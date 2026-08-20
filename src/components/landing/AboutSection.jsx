import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Stack,
    Button,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function AboutSection() {
    const navigate = useNavigate();

    const highlights = [
        {
            icon: <HealthAndSafetyIcon />,
            title: "Prevention First",
            description:
                "OsteoAI focuses on identifying important risk factors early and encouraging healthier decisions before serious complications occur.",
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
            {/* About */}
            <Box
                id="about"
                sx={{
                    scrollMarginTop: "115px",
                    py: { xs: 8, md: 12 },
                    bgcolor: "#F8FAFC",
                    background:
                        "radial-gradient(900px circle at 18% 35%, rgba(37, 99, 235, 0.045) 0%, rgba(248,250,252,0) 65%)",
                }}
            >
                <Container maxWidth="lg">
                    <Grid
                        container
                        spacing={{ xs: 5, md: 8 }}
                        alignItems="center"
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
                                    color: "#0F172A",
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
                                sx={{
                                    mt: 3,
                                    maxWidth: 650,
                                    lineHeight: 1.8,
                                    fontSize: "1.05rem",
                                    color: "#64748B",
                                }}
                            >
                                OsteoAI is being developed as an AI-powered bone
                                health platform that brings together assessment,
                                machine learning, explainability, analytics, and
                                personalized guidance in one place.
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mt: 2,
                                    maxWidth: 650,
                                    lineHeight: 1.8,
                                    fontSize: "1.05rem",
                                    color: "#64748B",
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
                                            bgcolor: "rgba(255,255,255,0.94)",
                                            boxShadow:
                                                "0 8px 24px rgba(15, 23, 42, 0.035)",
                                            transition:
                                                "transform 0.2s ease, box-shadow 0.2s ease",
                                            "&:hover": {
                                                transform: "translateY(-3px)",
                                                boxShadow:
                                                    "0 14px 30px rgba(15, 23, 42, 0.07)",
                                            },
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            sx={{
                                                alignItems: "flex-start",
                                            }}
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
                                                    sx={{
                                                        color: "#0F172A",
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        mt: 0.75,
                                                        lineHeight: 1.7,
                                                        color: "#64748B",
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
                    py: { xs: 8, md: 11 },
                    bgcolor: "white",
                }}
            >
                <Container maxWidth="md">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, sm: 5, md: 6 },
                            borderRadius: 5,
                            textAlign: "center",
                            border: "1px solid #DCE6F4",
                            bgcolor: "#F8FAFC",
                            boxShadow:
                                "0 18px 50px rgba(15, 23, 42, 0.05)",
                        }}
                    >
                        <Typography
                            variant="overline"
                            color="primary"
                            fontWeight={700}
                        >
                            YOUR NEXT STEP
                        </Typography>

                        <Typography
                            variant="h3"
                            fontWeight={800}
                            sx={{
                                mt: 1,
                                fontSize: {
                                    xs: "2rem",
                                    md: "2.8rem",
                                },
                                letterSpacing: "-0.02em",
                                lineHeight: 1.15,
                                color: "#0F172A",
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
                            sx={{
                                maxWidth: 650,
                                mx: "auto",
                                mt: 2,
                                lineHeight: 1.8,
                                color: "#64748B",
                            }}
                        >
                            Complete the assessment to explore your personal,
                            lifestyle, and medical health factors.
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 1.5,
                                color: "#64748B",
                            }}
                        >
                            Your personalized risk assessment is generated after
                            the complete assessment is finished.
                        </Typography>

                        <Box
                            sx={{
                                mt: 3.5,
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate("/assessment")}
                                sx={{
                                    px: 3.2,
                                    py: 1.35,
                                    borderRadius: 3,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    boxShadow:
                                        "0 10px 24px rgba(37, 99, 235, 0.18)",
                                    "&:hover": {
                                        boxShadow:
                                            "0 12px 28px rgba(37, 99, 235, 0.24)",
                                    },
                                }}
                            >
                                Start Your Assessment
                            </Button>
                        </Box>

                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mt: 2,
                                color: "#94A3B8",
                            }}
                        >
                            Takes about 2 minutes • Free to complete
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default AboutSection;