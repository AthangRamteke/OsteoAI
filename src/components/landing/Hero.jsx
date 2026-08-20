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

function Hero() {
  const navigate = useNavigate();

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
      title: "Personal Information",
      description:
        "Basic health indicators and personal details.",
    },
    {
      number: 2,
      title: "Lifestyle Factors",
      description:
        "Habits that may influence bone health.",
    },
    {
      number: 3,
      title: "Medical History",
      description:
        "Relevant medical background and risk factors.",
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
            label="AI-POWERED BONE HEALTH PLATFORM"
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
            Understand Your Bone Health
            <Box
              component="span"
              sx={{
                display: "block",
                color: "primary.main",
              }}
            >
              Before It Becomes a Problem.
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
            OsteoAI combines personal, lifestyle, and medical
            factors to build a personalized osteoporosis risk
            assessment and help you understand the factors that may
            influence your bone health.
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
              Start Your Assessment
            </PrimaryButton>

            <PrimaryButton
              variant="outlined"
              onClick={scrollToFeatures}
              sx={{
                bgcolor: "rgba(255,255,255,0.82)",
                color: "primary.main",
              }}
            >
              Learn More
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
                sx={{ color: "#0F172A" }}
              >
                Multi-factor assessment
              </Typography>

              <Typography variant="body2">
                Personal + lifestyle + medical
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "#0F172A" }}
              >
                AI-ready architecture
              </Typography>

              <Typography variant="body2">
                Explainable predictions planned
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
                  OsteoAI Assessment
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
                    ~2-minute assessment • Free
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
                  A complete picture takes more than BMI.
                </Typography>
              </Box>
            </Box>

            {/* Timeline */}
            <Box
              sx={{
                position: "relative",
                mt: 4,
              }}
            >
              {assessmentSteps.map((step, index) => (
                <Box
                  key={step.number}
                  sx={{
                    position: "relative",
                    minHeight:
                      index < assessmentSteps.length - 1
                        ? 108
                        : "auto",
                  }}
                >
                  {/* Connector */}
                  {index <
                    assessmentSteps.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 17,
                        top: 34,
                        bottom: 0,
                        width: 2,
                        display: "flex",
                        justifyContent: "center",
                        background:
                          "repeating-linear-gradient(to bottom, #B7CCF8 0px, #B7CCF8 5px, transparent 5px, transparent 9px)",
                      }}
                    >
                      <KeyboardArrowDownIcon
                        sx={{
                          position: "absolute",
                          bottom: -4,
                          left: "50%",
                          transform:
                            "translateX(-50%)",
                          fontSize: 18,
                          color: "primary.main",
                          bgcolor: "white",
                        }}
                      />
                    </Box>
                  )}

                  {/* Step */}
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
                        position: "relative",
                        zIndex: 1,
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
                </Box>
              ))}
            </Box>

            {/* Bottom Note */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mt: 1,
                pt: 2.5,
                borderTop: "1px solid #E2E8F0",
                textAlign: "center",
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
                Takes less than 2 minutes
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Hero;