import Button from "@mui/material/Button";

function PrimaryButton({
  children,
  onClick,
  sx = {},
  ...props
}) {
  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={onClick}
      sx={{
        borderRadius: "12px",
        textTransform: "none",
        px: 3,
        py: 1.2,
        fontWeight: 600,
        boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 25px rgba(37,99,235,0.35)",
          filter: "brightness(1.05)",
        },
        transition: "all 0.3s ease",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export default PrimaryButton;