import {
  Box,
  Container,
  Typography,
  Grid,
} from "@mui/material";

import PsychologyIcon from "@mui/icons-material/Psychology";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PieChartIcon from "@mui/icons-material/PieChart";

import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: <PsychologyIcon />,
    title: "Explainable AI",
    description:
      "Understand which factors may influence an osteoporosis risk prediction instead of receiving only a final score.",
    tint: "#EEF4FF",
    iconColor: "#2563EB",
  },
  {
    icon: <ShowChartIcon />,
    title: "Personalized Risk Insights",
    description:
      "Combine personal, lifestyle, and medical information to build a more comprehensive assessment.",
    tint: "#F3EEFF",
    iconColor: "#7C3AED",
  },
  {
    icon: <FavoriteIcon />,
    title: "OsteoAI Health Assistant",
    description:
      "Get easy-to-understand guidance about bone health, assessment results, and preventive lifestyle habits.",
    tint: "#ECFDF3",
    iconColor: "#16A34A",
  },
  {
    icon: <PieChartIcon />,
    title: "Health Analytics",
    description:
      "Explore visual insights from your assessment and, later, track changes across multiple assessments.",
    tint: "#FFF7ED",
    iconColor: "#EA580C",
  },
];

function FeaturesSection() {
  return (
    <Box
      id="features"
      sx={{
        scrollMarginTop: "115px",
        py: { xs: 8, md: 12 },
        background:
          "radial-gradient(900px circle at 50% 0%, rgba(37, 99, 235, 0.045) 0%, #F8FAFC 65%)",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          fontWeight={800}
          sx={{
            fontSize: {
              xs: "2.2rem",
              md: "3.2rem",
            },
            letterSpacing: "-0.02em",
            color: "#0F172A",
          }}
        >
          Why OsteoAI?
        </Typography>

        <Typography
          align="center"
          sx={{
            maxWidth: 760,
            mx: "auto",
            mt: 2,
            mb: 7,
            fontSize: {
              xs: "1rem",
              md: "1.08rem",
            },
            lineHeight: 1.8,
            color: "#64748B",
          }}
        >
          A multi-factor bone health platform designed to combine
          assessment, explainable AI, personalized guidance, and
          meaningful health insights.
        </Typography>

        <Grid
          container
          spacing={3}
        >
          {features.map((feature) => (
            <Grid
              key={feature.title}
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  p: 0.5,
                }}
              >
                <FeatureCard
                  icon={
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: feature.tint,
                        color: feature.iconColor,
                      }}
                    >
                      {feature.icon}
                    </Box>
                  }
                  title={feature.title}
                  description={feature.description}
                  sx={{
                    height: "100%",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0 14px 30px rgba(15, 23, 42, 0.07)",
                    },
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default FeaturesSection;