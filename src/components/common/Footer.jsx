import {
  Box,
  Container,
  Grid,
  Typography,
  Divider,
  Stack,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

import { useLanguage } from "../../context/LanguageContext";

function Footer() {
  const { t } = useLanguage();

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
              sx={{ alignItems: "center" }}
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
              {t("footer.description")}
            </Typography>
          </Grid>

          {/* Explore */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              {t("footer.exploreTitle")}
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
                {t("footer.linkHome")}
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
                {t("footer.linkFeatures")}
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
                {t("footer.linkHowItWorks")}
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
                {t("footer.linkAbout")}
              </Typography>
            </Stack>
          </Grid>

          {/* Project */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              {t("footer.projectTitle")}
            </Typography>

            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                {t("footer.projectItem1")}
              </Typography>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                {t("footer.projectItem2")}
              </Typography>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                {t("footer.projectItem3")}
              </Typography>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.68)"
              >
                {t("footer.projectItem4")}
              </Typography>
            </Stack>
          </Grid>

          {/* Disclaimer */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              {t("footer.importantTitle")}
            </Typography>

            <Typography
              variant="body2"
              color="rgba(255,255,255,0.68)"
              sx={{ lineHeight: 1.7 }}
            >
              {t("footer.disclaimer")}
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
          {t("footer.copyright")}
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;