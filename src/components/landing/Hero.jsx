import { useNavigate } from "react-router-dom";
import { Box, Typography, Stack } from "@mui/material";
import PrimaryButton from "../ui/PrimaryButton";

function Hero() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 3, md: 10 },
        py: 6,
        gap: 6,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left Side */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="overline"
          color="primary"
          fontWeight={700}
        >
          AI-POWERED HEALTHCARE PLATFORM
        </Typography>

        <Typography
          variant="h1"
          sx={{
            mt: 2,
            mb: 3,
            lineHeight: 1.2,
          }}
        >
          AI That Protects
          <br />
          Your Bone Health.
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 550,
            mb: 4,
            fontSize: "1.1rem",
          }}
        >
          Predict osteoporosis risk early using Explainable AI,
          lifestyle analysis, and a personal AI assistant that
          helps you understand and improve your bone health.
        </Typography>

        <Stack direction="row" spacing={2}>
          <PrimaryButton
            onClick={() => navigate("/assessment")}
          >
            Start Free Assessment
          </PrimaryButton>

          <PrimaryButton
            variant="outlined"
            sx={{
              bgcolor: "white",
              color: "primary.main",
            }}
          >
            Learn More
          </PrimaryButton>
        </Stack>
      </Box>

      {/* Right Side */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 320,
            height: 320,
            borderRadius: "24px",
            bgcolor: "white",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h2">
            🦴
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
          >
            Bone Health Score
          </Typography>

          <Typography
            variant="h2"
            color="primary"
          >
            82
          </Typography>

          <Typography color="text.secondary">
            Low Risk
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Hero;