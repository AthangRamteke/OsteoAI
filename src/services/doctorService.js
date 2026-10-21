const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Look up orthopedic / bone-care facilities near a place.
 *
 * Pass `{ lat, lng }` for a device location, or `{ pincode }` /
 * `{ query }` when the user prefers not to share theirs.
 */
export async function fetchNearbyHospitals({
  lat,
  lng,
  pincode,
  query,
  radiusKm = 10,
  signal,
}) {
  const params = new URLSearchParams({ radius_km: String(radiusKm) });

  if (lat != null && lng != null) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  } else if (pincode) {
    params.set("pincode", pincode);
  } else if (query) {
    params.set("q", query);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/doctors/nearby?${params}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error("Unable to reach the OsteoAI server. Please try again.", {
      cause: error,
    });
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The OsteoAI API returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "The hospital search failed. Please try again."
    );
  }

  return data;
}

/** Google Maps turn-by-turn link. A plain URL: free, no API key. */
export function googleDirectionsUrl(hospital, origin) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${hospital.lat},${hospital.lng}`,
  });

  if (origin?.source === "device") {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params}`;
}

/** The same place on OpenStreetMap, with routing when the origin is known. */
export function osmUrl(hospital, origin) {
  if (origin) {
    return (
      "https://www.openstreetmap.org/directions?engine=fossgis_osrm_car" +
      `&route=${origin.lat}%2C${origin.lng}%3B${hospital.lat}%2C${hospital.lng}`
    );
  }

  return (
    `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lng}` +
    `#map=17/${hospital.lat}/${hospital.lng}`
  );
}

/** Strip spaces and punctuation so the number works in a tel: link. */
export function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
