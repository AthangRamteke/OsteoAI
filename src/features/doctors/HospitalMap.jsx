import { useEffect, useMemo } from "react";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { Box, GlobalStyles } from "@mui/material";

import { useThemeMode } from "../../context/ThemeModeContext";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const PIN_PATH =
  "M16 2C9.4 2 4 7.3 4 13.8 4 22.2 16 38 16 38s12-15.8 12-24.2C28 7.3 22.6 2 16 2z";

/*
 * Markers are drawn as inline SVG rather than Leaflet's default image,
 * which Vite's bundling cannot locate, and so they can change colour
 * with the hospital type and selection.
 */
function pinIcon({ specialist, selected }) {
  const fill = selected ? "#dc2626" : specialist ? "#2563eb" : "#0d9488";
  const size = selected ? 44 : 34;

  return L.divIcon({
    className: "oa-pin",
    iconSize: [size, size * 1.25],
    iconAnchor: [size / 2, size * 1.25],
    html: `
      <svg width="${size}" height="${size * 1.25}" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="${PIN_PATH}" fill="${fill}" stroke="#ffffff" stroke-width="2"/>
        <path d="M16 8.5v10M11 13.5h10" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`,
  });
}

const originIcon = L.divIcon({
  className: "oa-origin",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: '<span class="oa-origin-dot"></span>',
});

/** Keeps the viewport in step with the results and the selected pin. */
function ViewController({ origin, hospitals, selected }) {
  const map = useMap();

  useEffect(() => {
    const points = hospitals
      .slice(0, 20)
      .map((hospital) => [hospital.lat, hospital.lng]);

    points.push([origin.lat, origin.lng]);

    map.fitBounds(L.latLngBounds(points), {
      padding: [40, 40],
      maxZoom: 14,
    });
  }, [map, origin, hospitals]);

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15), {
        duration: 0.7,
      });
    }
  }, [map, selected]);

  // The map can mount while hidden (mobile tab); recompute its size.
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function HospitalMap({ origin, hospitals, selectedId, onSelect, label }) {
  const { mode } = useThemeMode();

  const selected = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedId) || null,
    [hospitals, selectedId]
  );

  return (
    <Box
      role="region"
      aria-label={label}
      sx={{
        position: "relative",
        zIndex: 0,
        height: "100%",
        minHeight: 360,
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid var(--oa-border-1)",
        // The free OSM tiles are light-only; invert them in dark mode.
        "& .leaflet-tile-pane":
          mode === "dark"
            ? { filter: "invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.88)" }
            : undefined,
      }}
    >
      <GlobalStyles
        styles={{
          ".oa-pin, .oa-origin": { background: "transparent", border: "none" },
          ".oa-pin svg": {
            filter: "drop-shadow(0 3px 4px rgba(15,23,42,0.35))",
            transition: "transform 0.15s ease",
          },
          ".oa-origin-dot": {
            display: "block",
            width: 16,
            height: 16,
            margin: 3,
            borderRadius: "50%",
            background: "#0ea5e9",
            border: "3px solid #ffffff",
            boxShadow: "0 0 0 0 rgba(14,165,233,0.55)",
            animation: "oa-origin-pulse 2s ease-out infinite",
          },
          "@keyframes oa-origin-pulse": {
            "70%": { boxShadow: "0 0 0 14px rgba(14,165,233,0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(14,165,233,0)" },
          },
          ".leaflet-container": { fontFamily: "inherit" },
        }}
      />

      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", minHeight: 360 }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />

        <Marker position={[origin.lat, origin.lng]} icon={originIcon} interactive={false} />

        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={pinIcon({
              specialist: hospital.specialist,
              selected: hospital.id === selectedId,
            })}
            zIndexOffset={hospital.id === selectedId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(hospital.id) }}
          >
            <Tooltip direction="top" offset={[0, -34]}>
              {hospital.name}
            </Tooltip>
          </Marker>
        ))}

        <ViewController origin={origin} hospitals={hospitals} selected={selected} />
      </MapContainer>
    </Box>
  );
}

export default HospitalMap;
