import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Stack,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

function AboutSection() {
    const highlights = [
        {
            icon: <HealthAndSafetyIcon />,
            title: "Prevention First",
            description:
                "OsteoAI focuses on identifying risk factors early and encouraging healthier decisions before serious complications occur.",
        },
        {
            icon: <AutoGraphIcon />,
            title: "Data-Driven Insights",
            description:
                "The platform is designed to combine personal, lifestyle, and medical information into meaningful risk insights.",
        },
        {
            icon: <FavoriteBorderIcon />,
            title: "Personalized Guidance",
            description:
                "Future recommendations and AI assistance will be tailored to the user's assessment and health profile.",
        },
    ];

    return (
        <>
            <Box
                id="about"
                sx={{
                    py: { xs: 8, md: 12 },
                    bgcolor: "#F8FAFC",
                }}
            >
                <Container maxWidth="lg">
                    <Grid
                        container
                        spacing={{ xs: 5, md: 8 }}
                        sx={{ alignItems: "center" }}
                    >
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant="overline"
                                color="primary"
                                fontWeight={700}
                            >
                                ABOUT OSTEOAI
                            </Typography>

                            <Typography
                                variant="h2"
                                fontWeight={800}
                                sx={{
                                    mt: 1,
                                    fontSize: {
                                        xs: "2.2rem",
                                        md: "3.2rem",
                                    },
                                    lineHeight: 1.15,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                A smarter approach to
                                <Box
                                    component="span"
                                    sx={{
                                        display: "block",
                                        color: "primary.main",
                                    }}
                                >
                                    preventive bone health.
                                </Box>
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    mt: 3,
                                    maxWidth: 650,
                                    lineHeight: 1.8,
                                    fontSize: "1.05rem",
                                }}
                            >
                                OsteoAI is being developed as an AI-powered bone
                                health platform that brings together assessment,
                                machine learning, explainability, analytics, and
                                personalized guidance in one place.
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    mt: 2,
                                    maxWidth: 650,
                                    lineHeight: 1.8,
                                    fontSize: "1.05rem",
                                }}
                            >
                                The goal is not to replace medical professionals,
                                but to help users better understand important risk
                                factors and make informed preventive health decisions.
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2}>
                                {highlights.map((item) => (
                                    <Paper
                                        key={item.title}
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: "1px solid #E2E8F0",
                                            bgcolor: "white",
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            sx={{ alignItems: "flex-start" }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 3,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "#EEF4FF",
                                                    color: "primary.main",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.icon}
                                            </Box>

                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                >
                                                    {item.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mt: 0.75,
                                                        lineHeight: 1.7,
                                                    }}
                                                >
                                                    {item.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Final CTA */}
            <Box
                sx={{
                    py: { xs: 8, md: 10 },
                    bgcolor: "white",
                }}
            >
                <Container maxWidth="md">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: 5,
                            textAlign: "center",
                            border: "1px solid #E2E8F0",
                            background:
                                "linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%)",
                        }}
                    >
                        <Typography
                            variant="h3"
                            fontWeight={800}
                            sx={{
                                fontSize: {
                                    xs: "2rem",
                                    md: "2.8rem",
                                },
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Ready to understand your
                            <Box
                                component="span"
                                sx={{
                                    display: "block",
                                    color: "primary.main",
                                }}
                            >
                                bone health?
                            </Box>
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                maxWidth: 650,
                                mx: "auto",
                                mt: 2,
                                lineHeight: 1.8,
                            }}
                        >
                            Complete the assessment to explore your personal,
                            lifestyle, and medical health factors.
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 2,
                            }}
                        >
                            Your complete personalized risk assessment is
                            generated after the full assessment is completed.
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default AboutSection;