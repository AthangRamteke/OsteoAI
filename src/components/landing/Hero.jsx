import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Chip,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import PrimaryButton from "../ui/PrimaryButton";
import { useLanguage } from "../../context/LanguageContext";

function Hero() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const scrollToFeatures = () => {
    const element = document.getElementById("features");

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

  const assessmentSteps = [
    {
      number: 1,
      title: t("hero.step1Title"),
      description: t("hero.step1Desc"),
    },
    {
      number: 2,
      title: t("hero.step2Title"),
      description: t("hero.step2Desc"),
    },
    {
      number: 3,
      title: t("hero.step3Title"),
      description: t("hero.step3Desc"),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        px: { xs: 3, sm: 5, md: 8, lg: 12 },
        py: { xs: 6, md: 10 },
        background:
          "radial-gradient(1000px circle at 70% 35%, rgba(37, 99, 235, 0.12) 0%, rgba(99, 102, 241, 0.055) 34%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.05fr 0.95fr",
          },
          alignItems: "center",
          gap: { xs: 6, md: 8 },
        }}
      >
        {/* LEFT SIDE */}
        <Box>
          <Chip
            icon={<HealthAndSafetyIcon />}
            label={t("hero.badge")}
            color="primary"
            variant="outlined"
            sx={{
              mb: 3,
              fontWeight: 700,
              borderRadius: 2,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: "2.8rem",
                sm: "3.5rem",
                md: "4.2rem",
              },
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: 760,
              color: "#0F172A",
            }}
          >
            {t("hero.titleLine1")}
            <Box
              component="span"
              sx={{
                display: "block",
                color: "primary.main",
              }}
            >
              {t("hero.titleLine2")}
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 3,
              maxWidth: 680,
              fontSize: {
                xs: "1rem",
                md: "1.12rem",
              },
              lineHeight: 1.8,
              color: "#475569",
            }}
          >
            {t("hero.subtitle")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 4 }}
          >
            <PrimaryButton
              onClick={() => navigate("/assessment")}
              endIcon={<ArrowForwardIcon />}
            >
              {t("hero.ctaStart")}
            </PrimaryButton>

            <PrimaryButton
              variant="outlined"
              onClick={scrollToFeatures}
              sx={{
                bgcolor: "rgba(255,255,255,0.82)",
                color: "primary.main",
              }}
            >
              {t("hero.ctaLearnMore")}
            </PrimaryButton>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{
              mt: 4,
              color: "#64748B",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  color: "#0F172A",
                }}
              >
                {t("hero.statMultiFactorTitle")}
              </Typography>

              <Typography variant="body2">
                {t("hero.statMultiFactorDesc")}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  color: "#0F172A",
                }}
              >
                {t("hero.statAiTitle")}
              </Typography>

              <Typography variant="body2">
                {t("hero.statAiDesc")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* RIGHT SIDE */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: { xs: 500, md: 600 },

            "&::before": {
              content: '""',
              position: "absolute",
              width: { xs: 430, md: 700 },
              height: { xs: 430, md: 700 },
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(37, 99, 235, 0.24) 0%, rgba(59, 130, 246, 0.15) 28%, rgba(99, 102, 241, 0.08) 48%, rgba(255,255,255,0) 72%)",
              filter: "blur(18px)",
              zIndex: 0,
              pointerEvents: "none",
            },

            "&::after": {
              content: '""',
              position: "absolute",
              width: { xs: 260, md: 360 },
              height: { xs: 260, md: 360 },
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(96, 165, 250, 0.18) 0%, rgba(129, 140, 248, 0.08) 40%, rgba(255,255,255,0) 72%)",
              filter: "blur(14px)",
              right: { xs: "0%", md: "5%" },
              top: { xs: "15%", md: "8%" },
              zIndex: 0,
              pointerEvents: "none",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: {
                xs: "100%",
                sm: 440,
              },
              maxWidth: 440,
              borderRadius: 6,
              p: { xs: 3, sm: 4 },
              bgcolor: "rgba(255,255,255,0.94)",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 24px 60px rgba(15, 23, 42, 0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Assessment Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EEF4FF",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <HealthAndSafetyIcon
                  sx={{
                    fontSize: 32,
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    lineHeight: 1.2,
                    color: "#0F172A",
                  }}
                >
                  {t("hero.cardTitle")}
                </Typography>

                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    mt: 1,
                    px: 1.25,
                    py: 0.6,
                    borderRadius: 999,
                    bgcolor: "#ECFDF3",
                    border: "1px solid #D1FAE5",
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "#22C55E",
                      boxShadow:
                        "0 0 0 4px rgba(34, 197, 94, 0.12)",
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color: "#15803D",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("hero.cardBadge")}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    lineHeight: 1.5,
                    color: "#64748B",
                  }}
                >
                  {t("hero.cardNote")}
                </Typography>
              </Box>
            </Box>

            {/* Assessment Timeline */}
            <Box
              sx={{
                position: "relative",
                mt: 4,
              }}
            >
              {assessmentSteps.map((step, index) => (
                <Box
                  key={step.number}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        minWidth: 34,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor:
                          index === 0
                            ? "primary.main"
                            : "#EEF4FF",
                        color:
                          index === 0
                            ? "white"
                            : "primary.main",
                        border:
                          index === 0
                            ? "none"
                            : "1px solid #C7D2FE",
                        fontWeight: 800,
                        boxShadow:
                          index === 0
                            ? "0 5px 14px rgba(37,99,235,0.20)"
                            : "none",
                      }}
                    >
                      {step.number}
                    </Box>

                    <Box
                      sx={{
                        pt: 0.25,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={800}
                        sx={{
                          color: "#0F172A",
                        }}
                      >
                        {step.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.35,
                          lineHeight: 1.5,
                          color: "#64748B",
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>

                  {index <
                    assessmentSteps.length - 1 && (
                    <Box
                      sx={{
                        height: 34,
                        ml: "16px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          height: 22,
                          borderLeft:
                            "2px dotted #C7D2FE",
                        }}
                      />

                      <KeyboardArrowDownIcon
                        sx={{
                          color: "primary.main",
                          fontSize: 18,
                          ml: -1.15,
                          mt: 1.2,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* Bottom Note */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 3,
                pt: 2.5,
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <AccessTimeIcon
                sx={{
                  fontSize: 18,
                  color: "#64748B",
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                }}
              >
                {t("hero.bottomNote")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Hero;