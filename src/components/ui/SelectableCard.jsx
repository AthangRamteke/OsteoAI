import {
  Box,
  Card,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function SelectableCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      elevation={0}
      sx={{
        position: "relative",
        height: "100%",
        cursor: "pointer",
        borderRadius: 3,
        border: selected
          ? "2px solid #2563EB"
          : "1px solid #E2E8F0",
        bgcolor: selected ? "#EEF4FF" : "#FFFFFF",
        boxShadow: selected
          ? "0 4px 12px rgba(37, 99, 235, 0.12)"
          : "none",
        transition:
          "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: "#2563EB",
          transform: "translateY(-2px)",
          boxShadow:
            "0 6px 16px rgba(15, 23, 42, 0.08)",
        },
        "&:focus-visible": {
          outline: "3px solid rgba(37, 99, 235, 0.2)",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          p: 2.25,
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            minWidth: 42,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: selected ? "#DCE9FF" : "#F8FAFC",
            color: "primary.main",
            transition: "background-color 0.2s ease",
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
            pr: selected ? 3 : 0,
          }}
        >
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{
              color: "text.primary",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {selected && (
          <CheckCircleIcon
            color="primary"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              fontSize: 22,
            }}
          />
        )}
      </Box>
    </Card>
  );
}

export default SelectableCard;