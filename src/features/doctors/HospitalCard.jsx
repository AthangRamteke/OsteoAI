import { Box, Button, Chip, Collapse, Stack, Typography } from "@mui/material";

import CallIcon from "@mui/icons-material/Call";
import DirectionsIcon from "@mui/icons-material/Directions";
import LanguageIcon from "@mui/icons-material/Language";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { useLanguage } from "../../context/LanguageContext";
import {
  googleDirectionsUrl,
  osmUrl,
  telHref,
} from "../../services/doctorService";

const CATEGORY_KEY = {
  hospital: "doctors.badgeHospital",
  clinic: "doctors.badgeClinic",
  doctor: "doctors.badgePractice",
};

function DetailRow({ icon, label, children }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
      <Box sx={{ color: "var(--oa-text-400)", mt: 0.25, display: "flex" }}>{icon}</Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: "var(--oa-text-500)", fontWeight: 700, display: "block" }}
        >
          {label}
        </Typography>
        {children}
      </Box>
    </Stack>
  );
}

function Unavailable({ children }) {
  return (
    <Typography variant="body2" sx={{ color: "var(--oa-text-400)", fontStyle: "italic" }}>
      {children}
    </Typography>
  );
}

function HospitalCard({ hospital, origin, selected, onSelect }) {
  const { t } = useLanguage();

  const accent = hospital.specialist ? "var(--oa-brand)" : "var(--oa-teal)";
  const primaryPhone = hospital.phones[0];

  return (
    <Box
      id={`hospital-${hospital.id.replace("/", "-")}`}
      sx={{
        position: "relative",
        borderRadius: 3,
        border: "1px solid",
        borderColor: selected ? "var(--oa-border-brand)" : "var(--oa-border-1)",
        bgcolor: selected ? "var(--oa-brand-soft-2)" : "var(--oa-surface)",
        boxShadow: selected ? "var(--oa-shadow-raised)" : "none",
        overflow: "hidden",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
        "&:hover": { borderColor: "var(--oa-border-brand)" },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 4,
          bgcolor: accent,
        },
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => onSelect(hospital.id)}
        aria-expanded={selected}
        sx={{
          all: "unset",
          boxSizing: "border-box",
          display: "block",
          width: "100%",
          cursor: "pointer",
          px: 2.25,
          py: 1.75,
          "&:focus-visible": { outline: "2px solid var(--oa-brand)", outlineOffset: -2 },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Typography
            sx={{ fontWeight: 800, color: "var(--oa-text-900)", lineHeight: 1.3 }}
          >
            {hospital.name}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "var(--oa-text-600)",
              fontWeight: 700,
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t("doctors.distanceAway", { km: hospital.distance_km })}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ mt: 0.75, gap: 0.75, flexWrap: "wrap" }}>
          {hospital.specialist && (
            <Chip
              size="small"
              icon={<MedicalServicesIcon />}
              label={t("doctors.badgeSpecialist")}
              sx={{
                fontWeight: 700,
                bgcolor: "var(--oa-brand-soft)",
                color: "var(--oa-brand)",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          )}

          <Chip
            size="small"
            icon={<LocalHospitalIcon />}
            label={t(CATEGORY_KEY[hospital.category])}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />

          {hospital.emergency && (
            <Chip
              size="small"
              label={t("doctors.badgeEmergency")}
              sx={{
                fontWeight: 700,
                bgcolor: "var(--oa-danger-soft)",
                color: "var(--oa-danger)",
              }}
            />
          )}
        </Stack>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: hospital.address ? "var(--oa-text-600)" : "var(--oa-text-400)",
            fontStyle: hospital.address ? "normal" : "italic",
            display: "-webkit-box",
            WebkitLineClamp: selected ? "unset" : 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {hospital.address || t("doctors.addressUnavailable")}
        </Typography>
      </Box>

      <Collapse in={selected} unmountOnExit>
        <Box sx={{ px: 2.25, pb: 2, pt: 0.5 }}>
          <Stack spacing={1.75} sx={{ pt: 1.5, borderTop: "1px solid var(--oa-border-5)" }}>
            <DetailRow icon={<CallIcon fontSize="small" />} label={t("doctors.phoneLabel")}>
              {hospital.phones.length ? (
                hospital.phones.map((phone) => (
                  <Typography
                    key={phone}
                    component="a"
                    href={telHref(phone)}
                    variant="body2"
                    sx={{
                      display: "block",
                      color: "var(--oa-brand)",
                      fontWeight: 700,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {phone}
                  </Typography>
                ))
              ) : (
                <Unavailable>{t("doctors.phoneUnavailable")}</Unavailable>
              )}
            </DetailRow>

            <DetailRow icon={<ScheduleIcon fontSize="small" />} label={t("doctors.hoursLabel")}>
              {hospital.opening_hours ? (
                <Typography variant="body2" sx={{ color: "var(--oa-text-700)" }}>
                  {hospital.opening_hours}
                </Typography>
              ) : (
                <Unavailable>{t("common.notAvailable")}</Unavailable>
              )}
            </DetailRow>

            <DetailRow icon={<LanguageIcon fontSize="small" />} label={t("doctors.websiteLabel")}>
              {hospital.website ? (
                <Typography
                  component="a"
                  href={hospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{
                    color: "var(--oa-brand)",
                    fontWeight: 600,
                    wordBreak: "break-all",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {hospital.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </Typography>
              ) : (
                <Unavailable>{t("common.notAvailable")}</Unavailable>
              )}
            </DetailRow>

            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", pt: 0.5 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<DirectionsIcon />}
                href={googleDirectionsUrl(hospital, origin)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, boxShadow: "none" }}
              >
                {t("doctors.directions")}
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<PlaceIcon />}
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                href={osmUrl(hospital, origin.source === "device" ? origin : null)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5 }}
              >
                {t("doctors.openOsm")}
              </Button>

              {primaryPhone && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CallIcon />}
                  href={telHref(primaryPhone)}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5 }}
                >
                  {t("doctors.call")}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default HospitalCard;
