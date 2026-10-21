"""
services/hospital_finder.py
=======================================================================
Find orthopedic / bone-care facilities near a location in India.

Data comes from OpenStreetMap through two free public services that
need no API key:

  - Nominatim  turns a PIN code or place name into coordinates
  - Overpass   lists the hospitals, clinics and doctors around a point

Both are shared community infrastructure with fair-use policies, so this
module identifies itself with a User-Agent, spaces out Nominatim calls
to at most one per second, and caches every answer (see
app/db/lookup_cache.py).

OpenStreetMap is volunteer-maintained: coverage and phone numbers vary
by area. Missing fields are returned as None / [] and the UI says
"not available" rather than guessing.
=======================================================================
"""

from __future__ import annotations

import logging
import math
import re
import threading
import time
from typing import Any

import httpx

from app.config import osm_user_agent
from app.db import lookup_cache

logger = logging.getLogger("osteoai.hospitals")

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

OVERPASS_URLS = (
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
)

# Rough bounding box of India. The feature is India-only for now, and
# this also rejects obviously wrong coordinates early.
INDIA_BOUNDS = {"lat": (6.0, 37.5), "lng": (68.0, 97.5)}

RADIUS_STEPS_KM = (5, 10, 25, 50)
MIN_RESULTS = 3
MAX_RESULTS = 60
MAX_SPECIALISTS = 30

GEOCODE_TTL = 30 * 24 * 3600
NEARBY_TTL = 12 * 3600

_PIN_PATTERN = re.compile(r"^[1-9][0-9]{5}$")

# Name hints for orthopedic / bone care. Word boundaries stop "hip"
# matching inside unrelated words.
_ORTHO_NAME = re.compile(
    r"\b(ortho\w*|bone|bones|joint|joints|spine|spinal|fracture|trauma|"
    r"arthro\w*|knee|hip|asthi|sports\s+injury)\b|अस्थि|हड्डी|हाड",
    re.IGNORECASE,
)

_ORTHO_SPECIALITY = re.compile(r"ortho|trauma|bone|spine", re.IGNORECASE)

# A hospital named for a different single specialty is not what a bone
# or joint problem needs, so it is left out of the list.
_OTHER_SPECIALTY_NAME = re.compile(
    r"\b(eye|netralaya|dental|dentist|cardiac|cardio\w*|heart|maternity|"
    r"women|womens|ladies|child|children|pediatric|paediatric|ent|ear|"
    r"cancer|oncology|kidney|nephro\w*|urolog\w*|ivf|fertility|skin|"
    r"derma\w*|psychiatr\w*|mental|veterinary|animal|ayurved\w*|"
    r"homeo\w*|diabet\w*|chest|liver|gastro\w*|neuro\w*|"
    r"mother|maternal|nursing\s+home\s+for\s+women)\b",
    re.IGNORECASE,
)

_GENERAL_SPECIALITY = re.compile(r"general|multi|internal|emergency", re.IGNORECASE)


class LocationNotFound(LookupError):
    """The PIN code or place could not be resolved to coordinates."""


class OutsideServiceArea(ValueError):
    """The coordinates are outside India."""


class UpstreamUnavailable(RuntimeError):
    """A free OpenStreetMap service did not answer."""


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------


def is_valid_pincode(value: str) -> bool:
    return bool(_PIN_PATTERN.match(value))


def check_in_india(lat: float, lng: float) -> None:
    lat_lo, lat_hi = INDIA_BOUNDS["lat"]
    lng_lo, lng_hi = INDIA_BOUNDS["lng"]

    if not (lat_lo <= lat <= lat_hi and lng_lo <= lng <= lng_hi):
        raise OutsideServiceArea(
            "Hospital search is currently available in India only."
        )


def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance (haversine)."""

    radius = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)

    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2

    return 2 * radius * math.asin(math.sqrt(a))


def _client(timeout: float) -> httpx.Client:
    return httpx.Client(
        timeout=timeout,
        headers={"User-Agent": osm_user_agent(), "Accept-Language": "en"},
    )


# ---------------------------------------------------------------------
# Geocoding (Nominatim)
# ---------------------------------------------------------------------

_nominatim_lock = threading.Lock()
_nominatim_last_call = 0.0


def _nominatim_search(params: dict[str, str]) -> list[dict[str, Any]]:
    """One Nominatim request, serialised and spaced to its 1 req/s rule."""

    global _nominatim_last_call

    with _nominatim_lock:
        wait = 1.1 - (time.monotonic() - _nominatim_last_call)

        if wait > 0:
            time.sleep(wait)

        try:
            with _client(10) as client:
                response = client.get(
                    NOMINATIM_URL,
                    params={
                        **params,
                        "format": "jsonv2",
                        "countrycodes": "in",
                        "addressdetails": "1",
                        "limit": "1",
                    },
                )
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Nominatim request failed: %s", exc)
            raise UpstreamUnavailable("The location service is not responding.") from exc
        finally:
            _nominatim_last_call = time.monotonic()


def _short_label(hit: dict[str, Any]) -> str:
    address = hit.get("address") or {}

    parts = [
        address.get("suburb")
        or address.get("village")
        or address.get("town")
        or address.get("city_district"),
        address.get("city")
        or address.get("town")
        or address.get("county")
        or address.get("state_district"),
        address.get("state"),
    ]

    seen: list[str] = []

    for part in parts:
        if part and part not in seen:
            seen.append(part)

    return ", ".join(seen) or str(hit.get("display_name", "")).split(",")[0]


def geocode(pincode: str | None = None, query: str | None = None) -> dict[str, Any]:
    """Resolve a PIN code (preferred) or place name to coordinates."""

    if pincode:
        key = f"geo:pin:{pincode}"
        cached = lookup_cache.get(key)

        if cached:
            return cached

        hits = _nominatim_search({"postalcode": pincode})

        if not hits:
            hits = _nominatim_search({"q": f"{pincode}, India"})

        # Nominatim falls back to fuzzy matches for unknown codes; only
        # accept a place that really carries this PIN code.
        hits = [
            hit
            for hit in hits
            if re.sub(r"\s", "", str((hit.get("address") or {}).get("postcode", "")))
            == pincode
        ]
    else:
        text = (query or "").strip().lower()
        key = f"geo:q:{text}"
        cached = lookup_cache.get(key)

        if cached:
            return cached

        hits = _nominatim_search({"q": text})

    if not hits:
        raise LocationNotFound(
            "We could not find that PIN code or place in India."
            if not query
            else "We could not find that place in India."
        )

    hit = hits[0]
    point = {
        "lat": float(hit["lat"]),
        "lng": float(hit["lon"]),
        "label": _short_label(hit),
    }

    check_in_india(point["lat"], point["lng"])
    lookup_cache.put(key, point, GEOCODE_TTL)

    return point


# ---------------------------------------------------------------------
# Hospital search (Overpass)
# ---------------------------------------------------------------------


def _overpass_query(lat: float, lng: float, radius_m: int) -> str:
    around = f"(around:{radius_m},{lat:.6f},{lng:.6f})"

    return (
        "[out:json][timeout:25];("
        f'nwr["amenity"~"^(hospital|clinic|doctors)$"]{around};'
        f'nwr["healthcare"~"^(hospital|clinic|doctor)$"]{around};'
        ");out center tags 1500;"
    )


def _overpass(query: str) -> list[dict[str, Any]]:
    last_error: Exception | None = None

    for url in OVERPASS_URLS:
        try:
            with _client(35) as client:
                response = client.post(url, data={"data": query})
                response.raise_for_status()
                return response.json().get("elements", [])
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Overpass mirror %s failed: %s", url, exc)
            last_error = exc

    raise UpstreamUnavailable(
        "The hospital data service is busy right now. Please try again shortly."
    ) from last_error


def _tag(tags: dict[str, str], *names: str) -> str | None:
    for name in names:
        value = (tags.get(name) or "").strip()

        if value:
            return value

    return None


def _phones(tags: dict[str, str]) -> list[str]:
    numbers: list[str] = []

    for name in ("phone", "contact:phone", "mobile", "contact:mobile"):
        raw = tags.get(name)

        if not raw:
            continue

        for piece in re.split(r"[;,/]", raw):
            piece = piece.strip()

            if sum(ch.isdigit() for ch in piece) >= 6 and piece not in numbers:
                numbers.append(piece)

    return numbers


def _address(tags: dict[str, str]) -> str | None:
    full = _tag(tags, "addr:full")

    if full:
        return full

    street_line = " ".join(
        part
        for part in (_tag(tags, "addr:housenumber"), _tag(tags, "addr:street"))
        if part
    )

    parts = [
        street_line or None,
        _tag(tags, "addr:suburb", "addr:neighbourhood", "addr:place"),
        _tag(tags, "addr:city", "addr:town", "addr:village", "addr:district"),
        _tag(tags, "addr:state"),
        _tag(tags, "addr:postcode"),
    ]

    text = ", ".join(part for part in parts if part)

    return text or None


def _website(tags: dict[str, str]) -> str | None:
    url = _tag(tags, "website", "contact:website", "url")

    if not url:
        return None

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url

    return url


def _is_specialist(tags: dict[str, str]) -> bool:
    speciality = _tag(
        tags, "healthcare:speciality", "healthcare:specialty", "speciality"
    )

    if speciality and _ORTHO_SPECIALITY.search(speciality):
        return True

    name = " ".join(filter(None, (tags.get("name"), tags.get("name:en"))))

    return bool(_ORTHO_NAME.search(name))


def _is_other_specialty(tags: dict[str, str]) -> bool:
    speciality = _tag(
        tags, "healthcare:speciality", "healthcare:specialty", "speciality"
    )

    if speciality and not _GENERAL_SPECIALITY.search(speciality):
        return True

    name = " ".join(filter(None, (tags.get("name"), tags.get("name:en"))))

    return bool(_OTHER_SPECIALTY_NAME.search(name))


def _category(tags: dict[str, str]) -> str | None:
    kind = tags.get("amenity") or tags.get("healthcare")

    if kind == "hospital":
        return "hospital"

    if kind == "clinic":
        return "clinic"

    if kind in {"doctors", "doctor"}:
        return "doctor"

    return None


def _to_hospital(
    element: dict[str, Any], origin_lat: float, origin_lng: float
) -> dict[str, Any] | None:
    tags = element.get("tags") or {}
    name = _tag(tags, "name", "name:en")
    category = _category(tags)

    if not name or not category:
        return None

    center = element.get("center") or element
    lat, lng = center.get("lat"), center.get("lon")

    if lat is None or lng is None:
        return None

    specialist = _is_specialist(tags)

    # Hospitals are kept even without an orthopedic hint, because most
    # have an orthopedic department. Clinics and private practices are
    # only relevant when they say they do orthopedics.
    if category != "hospital" and not specialist:
        return None

    if category == "hospital" and not specialist and _is_other_specialty(tags):
        return None

    return {
        "id": f"{element['type']}/{element['id']}",
        "name": name,
        "category": category,
        "specialist": specialist,
        "lat": lat,
        "lng": lng,
        "distance_km": round(_distance_km(origin_lat, origin_lng, lat, lng), 1),
        "address": _address(tags),
        "phones": _phones(tags),
        "website": _website(tags),
        "email": _tag(tags, "email", "contact:email"),
        "opening_hours": _tag(tags, "opening_hours"),
        "emergency": tags.get("emergency") == "yes",
    }


def _search_radius(lat: float, lng: float, radius_km: int) -> list[dict[str, Any]]:
    key = f"nearby:{lat:.3f}:{lng:.3f}:{radius_km}"
    cached = lookup_cache.get(key)

    if cached is not None:
        return cached

    elements = _overpass(_overpass_query(lat, lng, radius_km * 1000))

    seen: set[str] = set()
    found: list[dict[str, Any]] = []

    for element in elements:
        hospital = _to_hospital(element, lat, lng)

        if hospital is None or hospital["id"] in seen:
            continue

        seen.add(hospital["id"])
        found.append(hospital)

    found.sort(key=lambda item: item["distance_km"])

    # Keep every nearby specialist, then fill the rest with the nearest
    # general hospitals, so a dense city's many hospitals cannot push
    # the orthopedic ones out of the list.
    specialists = [item for item in found if item["specialist"]][:MAX_SPECIALISTS]
    general = [item for item in found if not item["specialist"]]
    found = sorted(
        specialists + general[: MAX_RESULTS - len(specialists)],
        key=lambda item: item["distance_km"],
    )

    lookup_cache.put(key, found, NEARBY_TTL)

    return found


def find_nearby(lat: float, lng: float, radius_km: int = 10) -> dict[str, Any]:
    """
    Search outward from the requested radius until enough facilities are
    found. Returns the results plus the radius actually used.
    """

    check_in_india(lat, lng)

    steps = [step for step in RADIUS_STEPS_KM if step >= radius_km] or [
        RADIUS_STEPS_KM[-1]
    ]

    results: list[dict[str, Any]] = []
    used = steps[0]

    for step in steps:
        used = step
        results = _search_radius(lat, lng, step)

        if len(results) >= MIN_RESULTS:
            break

    return {
        "radius_km": used,
        "widened": used > steps[0],
        "results": results,
    }
