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
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    const navbarOffset = 96;
    const targetPosition =
      element.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 850;
    const startTime = performance.now();

    const easeInOut = (t) =>
      t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOut(progress);

      window.scrollTo(
        0,
        startPosition + distance * easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
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
              sx={{
                alignItems: "center",
              }}
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
                  flexShrink: 0,
                }}
              >
                <HealthAndSafetyIcon />
              </Box>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: "white",
                }}
              >
                OsteoAI
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 2,
                maxWidth: 500,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.68)",
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
              sx={{
                mb: 2,
                color: "white",
              }}
            >
              Explore
            </Typography>

            <Stack spacing={1.2}>
              <Typography
                component="button"
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                sx={{
                  border: 0,
                  bgcolor: "transparent",
                  color: "rgba(255,255,255,0.68)",
                  textAlign: "left",
                  cursor: "pointer",
                  p: 0,
                  font: "inherit",
                  "&:hover": {
                    color: "white",
                  },
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
                  "&:hover": {
                    color: "white",
                  },
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
                  "&:hover": {
                    color: "white",
                  },
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
                  "&:hover": {
                    color: "white",
                  },
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
              sx={{
                mb: 2,
                color: "white",
              }}
            >
              Project
            </Typography>

            <Stack spacing={1.2}>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                AI Risk Assessment
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Explainable AI
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Health Analytics
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Preventive Guidance
              </Typography>
            </Stack>
          </Grid>

          {/* Bone Health Note */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography
              fontWeight={700}
              sx={{
                mb: 2,
                color: "white",
              }}
            >
              Bone Health Note
            </Typography>

            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.68)",
              }}
            >
              Osteoporosis weakens bones and can increase the risk
              of fractures. Understanding risk factors early can
              support better preventive health decisions.
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
          align="center"
          sx={{
            color: "rgba(255,255,255,0.52)",
          }}
        >
          © 2026 OsteoAI. Building smarter preventive bone-health
          experiences.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;