"""
routers/doctors.py
=======================================================================
GET /api/doctors/nearby

Nearby orthopedic / bone-care facilities in India, from OpenStreetMap.
The caller gives either device coordinates (lat + lng) or, when the
user prefers not to share their location, a 6-digit PIN code.
=======================================================================
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.doctor_schemas import NearbyResponse
from app.services import hospital_finder as finder

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


@router.get("/nearby", response_model=NearbyResponse)
def nearby(
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
    pincode: str | None = Query(None, description="6-digit Indian PIN code."),
    q: str | None = Query(
        None, min_length=2, max_length=80, description="City or area name."
    ),
    radius_km: int = Query(10, ge=1, le=50),
) -> NearbyResponse:
    has_coordinates = lat is not None and lng is not None

    if not has_coordinates and not pincode and not q:
        raise HTTPException(
            422,
            "Provide your location, a PIN code, or a place name.",
        )

    try:
        if has_coordinates:
            origin = {"lat": lat, "lng": lng, "label": None, "source": "device"}
        else:
            if pincode:
                pincode = pincode.strip()

                if not finder.is_valid_pincode(pincode):
                    raise HTTPException(
                        422,
                        "Enter a valid 6-digit PIN code.",
                    )

            point = finder.geocode(pincode=pincode, query=q)
            origin = {**point, "source": "pincode" if pincode else "place"}

        found = finder.find_nearby(origin["lat"], origin["lng"], radius_km)

    except finder.OutsideServiceArea as exc:
        raise HTTPException(422, str(exc)) from exc
    except finder.LocationNotFound as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except finder.UpstreamUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc

    return NearbyResponse(origin=origin, **found)
