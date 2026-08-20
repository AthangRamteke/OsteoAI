import { Box, Container, Typography, Grid } from "@mui/material";
import StepCard from "./StepCard";

const steps = [
  {
    step: 1,
    title: "Complete Your Health Assessment",
    description:
      "Provide personal information, lifestyle habits, and relevant medical history to build a comprehensive health profile.",
  },
  {
    step: 2,
    title: "AI-Assisted Risk Assessment",
    description:
      "Our planned machine learning system will analyze the collected factors to estimate your osteoporosis risk.",
  },
  {
    step: 3,
    title: "Understand Your Results",
    description:
      "Explore your overall risk, key contributing factors, and explainable insights to better understand your assessment.",
  },
  {
    step: 4,
    title: "Take Action for Better Bone Health",
    description:
      "Receive personalized recommendations, preventive guidance, and future lifestyle insights to support healthier choices.",
  },
];

function HowItWorks() {
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
          How OsteoAI Works
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
          From health assessment to personalized bone-health insights,
          OsteoAI is designed to guide users through a simple four-step
          experience.
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