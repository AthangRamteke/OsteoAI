import { Box, Container, Typography, Grid } from "@mui/material";
import StepCard from "./StepCard";
import { useLanguage } from "../../context/LanguageContext";

function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      step: 1,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
    },
    {
      step: 2,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
    },
    {
      step: 3,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
    },
    {
      step: 4,
      title: t("howItWorks.step4Title"),
      description: t("howItWorks.step4Desc"),
    },
  ];

  return (
    <Box
      id="how-it-works"
      sx={{
        scrollMarginTop: "115px",
        py: { xs: 8, md: 12 },
        bgcolor: "white",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          fontWeight={800}
          align="center"
          sx={{
            fontSize: {
              xs: "2.2rem",
              md: "3.2rem",
            },
            letterSpacing: "-0.02em",
          }}
        >
          {t("howItWorks.title")}
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          align="center"
          sx={{
            maxWidth: 760,
            mx: "auto",
            mt: 2,
            mb: 7,
            fontWeight: 400,
            lineHeight: 1.7,
          }}
        >
          {t("howItWorks.subtitle")}
        </Typography>

        <Grid
          container
          spacing={3}
        >
          {steps.map((item) => (
            <Grid
              key={item.step}
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <StepCard
                step={item.step}
                title={item.title}
                description={item.description}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HowItWorks;