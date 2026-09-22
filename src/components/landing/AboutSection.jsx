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
import { useLanguage } from "../../context/LanguageContext";

function AboutSection() {
    const { t } = useLanguage();

    const highlights = [
        {
            icon: <HealthAndSafetyIcon />,
            title: t("about.highlight1Title"),
            description: t("about.highlight1Desc"),
        },
        {
            icon: <AutoGraphIcon />,
            title: t("about.highlight2Title"),
            description: t("about.highlight2Desc"),
        },
        {
            icon: <FavoriteBorderIcon />,
            title: t("about.highlight3Title"),
            description: t("about.highlight3Desc"),
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
                                {t("about.eyebrow")}
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
                                {t("about.titleLine1")}
                                <Box
                                    component="span"
                                    sx={{
                                        display: "block",
                                        color: "primary.main",
                                    }}
                                >
                                    {t("about.titleLine2")}
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
                                {t("about.paragraph1")}
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
                                {t("about.paragraph2")}
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
                            {t("about.ctaTitleLine1")}
                            <Box
                                component="span"
                                sx={{
                                    display: "block",
                                    color: "primary.main",
                                }}
                            >
                                {t("about.ctaTitleLine2")}
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
                            {t("about.ctaText")}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 2,
                            }}
                        >
                            {t("about.ctaSubtext")}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default AboutSection;