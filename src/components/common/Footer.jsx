import {
  Box,
  Container,
  Grid,
  Typography,
  Divider,
  Stack,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

function Footer() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0F172A",
        color: "white",
        pt: 8,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={5}
        >
          {/* Brand */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                }}
              >
                <HealthAndSafetyIcon />
              </Box>

              <Typography
                variant="h6"
                fontWeight={800}
              >
                OsteoAI
              </Typography>
            </Stack>

            <Typography
              color="rgba(255,255,255,0.68)"
              sx={{
                mt: 2,
                maxWidth: 500,
                lineHeight: 1.8,
              }}
            >
              An AI-powered preventive bone-health platform
              designed to help users understand risk factors,
              explore insights, and make informed health decisions.
            </Typography>
          </Grid>

          {/* Explore */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              Explore
            </Typography>

            <Stack spacing={1}>
              <Typography
                component="button"
                onClick={() =>
                  (window.location.href = "/")
                }
                sx={{
                  border: 0,
                  bgcolor: "transparent",
                  color: "rgba(255,255,255,0.68)",
                  textAlign: "left",
                  cursor: "pointer",
                  p: 0,
                  font: "inherit",
                }}
              >
                Home
              </Typography>

              <Typography
                component="button"
                onClick={() => scrollToSection("features")}
                sx={{
                  border: 0,
                  bgcolor: "transparent",
                  color: "rgba(255,255,255,0.68)",
                  textAlign: "left",
                  cursor: "pointer",
                  p: 0,
                  font: "inherit",
                }}
              >
                Features
              </Typography>

              <Typography
                component="button"
                onClick={() =>
                  scrollToSection("how-it-works")
                }
                sx={{
                  border: 0,
                  bgcolor: "transparent",
                  color: "rgba(255,255,255,0.68)",
                  textAlign: "left",
                  cursor: "pointer",
                  p: 0,
                  font: "inherit",
                }}
              >
                How It Works
              </Typography>

              <Typography
                component="button"
                onClick={() => scrollToSection("about")}
                sx={{
                  border: 0,
                  bgcolor: "transparent",
                  color: "rgba(255,255,255,0.68)",
                  textAlign: "left",
                  cursor: "pointer",
                  p: 0,
                  font: "inherit",
                }}
              >
                About
              </Typography>
            </Stack>
          </Grid>

          {/* Project */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              Project
            </Typography>

            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                AI Risk Assessment
              </Typography>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                Explainable AI
              </Typography>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                Health Analytics
              </Typography>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                Preventive Guidance
              </Typography>
            </Stack>
          </Grid>

          {/* Disclaimer */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              Important
            </Typography>

            <Typography
              variant="body2"
              color="rgba(255,255,255,0.68)"
              sx={{ lineHeight: 1.7 }}
            >
              OsteoAI is intended as an educational and
              risk-assessment project and is not a replacement
              for professional medical diagnosis or treatment.
            </Typography>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 5,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        />

        <Typography
          variant="body2"
          color="rgba(255,255,255,0.52)"
          align="center"
        >
          © 2026 OsteoAI. Final Year Project.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;