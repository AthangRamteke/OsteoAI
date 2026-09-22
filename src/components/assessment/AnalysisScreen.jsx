import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

import { motion } from "framer-motion";

import { useLanguage } from "../../context/LanguageContext";

function AnalysisScreen({
  progress = 0,
  currentStep = 0,
}) {
  const { t } = useLanguage();

  const safeProgress = Math.max(
    0,
    Math.min(100, Number(progress) || 0)
  );

  const stages = [
    {
      label: t("assessment.analysis.stage1"),
      icon: <HealthAndSafetyIcon />,
      completed: currentStep >= 1,
    },
    {
      label: t("assessment.analysis.stage2"),
      icon: <AutoGraphIcon />,
      completed: currentStep >= 2,
    },
    {
      label: t("assessment.analysis.stage3"),
      icon: <PsychologyIcon />,
      completed: currentStep >= 3,
    },
  ];

  const getStageMessage = () => {
    if (safeProgress < 30) {
      return t("assessment.analysis.stageMessage1");
    }

    if (safeProgress < 60) {
      return t("assessment.analysis.stageMessage2");
    }

    if (safeProgress < 85) {
      return t("assessment.analysis.stageMessage3");
    }

    return t("assessment.analysis.stageMessage4");
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: { xs: 0, sm: 1 },
        py: { xs: 1, md: 2 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 5,
          border: "1px solid #DCE6F4",
          bgcolor: "rgba(255,255,255,0.98)",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2.5,
              sm: 3.5,
              md: 4,
            },
          }}
        >
          {/* Animated icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2.5,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EEF4FF",
                  color: "primary.main",
                }}
              >
                <PsychologyIcon
                  sx={{ fontSize: 40 }}
                />
              </Box>
            </motion.div>
          </Box>

          {/* Heading */}
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              color: "#0F172A",
              letterSpacing: "-0.02em",
              fontSize: {
                xs: "1.8rem",
                sm: "2.2rem",
              },
            }}
          >
            {t("assessment.analysis.title")}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              lineHeight: 1.7,
              color: "#64748B",
            }}
          >
            {t("assessment.analysis.subtitle")}
          </Typography>

          {/* Dynamic message */}
          <Box
            sx={{
              mt: 2.5,
              px: 2,
              py: 1.5,
              borderRadius: 3,
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              minHeight: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                color: "#334155",
                lineHeight: 1.5,
              }}
            >
              {getStageMessage()}
            </Typography>
          </Box>

          {/* Progress */}
          <Box
            sx={{
              mt: 3,
              textAlign: "left",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "#0F172A" }}
              >
                {t("assessment.analysis.progressLabel")}
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
                color="primary"
              >
                {Math.round(safeProgress)}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={safeProgress}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "#E2E8F0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />
          </Box>

          {/* Stages */}
          <Stack
            spacing={1.25}
            sx={{
              mt: 3,
              textAlign: "left",
            }}
          >
            {stages.map((stage) => (
              <Box
                key={stage.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  p: 1.25,
                  borderRadius: 3,
                  bgcolor: stage.completed
                    ? "#F0FDF4"
                    : "#F8FAFC",
                  border: "1px solid",
                  borderColor: stage.completed
                    ? "#BBF7D0"
                    : "#E2E8F0",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: stage.completed
                      ? "#DCFCE7"
                      : "#EEF4FF",
                    color: stage.completed
                      ? "#16A34A"
                      : "primary.main",
                  }}
                >
                  {stage.completed ? (
                    <CheckCircleIcon
                      sx={{ fontSize: 21 }}
                    />
                  ) : (
                    stage.icon
                  )}
                </Box>

                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    color: stage.completed
                      ? "#166534"
                      : "#334155",
                  }}
                >
                  {stage.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mt: 2.5,
              color: "#94A3B8",
            }}
          >
            {t("assessment.analysis.footerNote")}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default AnalysisScreen;