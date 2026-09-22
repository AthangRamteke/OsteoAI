import { Box, MenuItem, ListItemText, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { useLanguage } from "../../context/LanguageContext";

// Shared "Change Language" content dropped into the Settings popover on
// both the landing sidebar and the dashboard sidebar. Kept as its own
// small component so the two gear menus stay visually consistent and the
// language logic lives in one place.
function LanguageMenuItems({ onSelected }) {
  const { language, setLanguage, t, languages } = useLanguage();

  return (
    <Box sx={{ py: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          px: 2,
          pt: 0.5,
          pb: 0.75,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#94A3B8",
        }}
      >
        {t("settingsMenu.changeLanguage")}
      </Typography>

      {languages.map((option) => {
        const selected = option.code === language;

        return (
          <MenuItem
            key={option.code}
            selected={selected}
            onClick={() => {
              setLanguage(option.code);
              onSelected?.();
            }}
            sx={{
              mx: 0.75,
              mb: 0.25,
              borderRadius: 2,
              minWidth: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              fontWeight: selected ? 700 : 500,
              color: selected ? "#1D4ED8" : "#334155",
              bgcolor: selected
                ? "rgba(37, 99, 235, 0.08)"
                : "transparent",
              "&:hover": {
                bgcolor: "rgba(37, 99, 235, 0.08)",
              },
            }}
          >
            <ListItemText
              primary={option.label}
              slotProps={{
                primary: {
                  fontSize: "0.9rem",
                  fontWeight: selected ? 700 : 500,
                },
              }}
            />

            {selected && (
              <CheckIcon
                fontSize="small"
                sx={{ color: "#2563EB" }}
              />
            )}
          </MenuItem>
        );
      })}
    </Box>
  );
}

export default LanguageMenuItems;
