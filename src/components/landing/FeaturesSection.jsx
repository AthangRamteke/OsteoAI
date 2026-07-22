import { Container, Typography, Grid } from "@mui/material";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "🧠",
    title: "Explainable AI",
    description:
      "Understand why the AI predicted your osteoporosis risk instead of receiving only a score.",
  },
  {
    icon: "🤖",
    title: "AI Personal Agent",
    description:
      "Interact with an intelligent assistant that answers your questions in simple language.",
  },
  {
    icon: "📈",
    title: "Lifestyle Simulator",
    description:
      "See how exercise, nutrition and healthy habits can improve your future bone health.",
  },
  {
    icon: "📚",
    title: "Knowledge Center",
    description:
      "Access trusted osteoporosis information and FAQs powered by Salesforce.",
  },
];

function FeaturesSection() {
  return (
    <Container sx={{ py: 10 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Why OsteoAI?
      </Typography>

      <Typography align="center" color="text.secondary" sx={{ mb: 6 }}>
        Everything you need for smarter bone health decisions.
      </Typography>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default FeaturesSection;