import { Box, Container, Typography, Grid } from "@mui/material";
import StepCard from "./StepCard";

const steps = [
  {
    step: 1,
    title: "Enter Health Details",
    description:
      "Provide your age, BMI, lifestyle habits, medical history, and optional DXA report.",
  },
  {
    step: 2,
    title: "AI Predicts Risk",
    description:
      "Our machine learning model analyzes your data and predicts your osteoporosis risk.",
  },
  {
    step: 3,
    title: "Understand Results",
    description:
      "Explainable AI (SHAP) shows why the prediction was made in simple language.",
  },
  {
    step: 4,
    title: "Improve Bone Health",
    description:
      "Receive personalized lifestyle suggestions and future risk simulation.",
  },
];

function HowItWorks() {
  return (
    <Box
      sx={{
        py: 10,
        backgroundColor: "#F8FAFC",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          fontWeight={700}
          align="center"
          gutterBottom
        >
          How OsteoAI Works
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          align="center"
          sx={{ mb: 6 }}
        >
          Get your osteoporosis risk assessment in four simple steps.
        </Typography>

        <Grid container spacing={4}>
          {steps.map((item) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
              key={item.step}
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