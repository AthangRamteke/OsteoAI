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

function AnalysisScreen({
  progress = 0,
  currentStep = 0,
}) {
  const stages = [
    {
      label: "Personal information",
      icon: <HealthAndSafetyIcon />,
      completed: currentStep >= 1,
    },
    {
      label: "Lifestyle factors",
      icon: <AutoGraphIcon />,
      completed: currentStep >= 2,
    },
    {
      label: "Medical history",
      icon: <PsychologyIcon />,
      completed: currentStep >= 3,
    },
  ];

  const getStageMessage = () => {
    if (progress < 30) {
      return "Preparing biometric inputs and personal health details...";
    }

    if (progress < 70) {
      return "Evaluating lifestyle habits and clinical risk history...";
    }

    return "Preparing the model-based risk analysis and explainability...";
  };

  return (
    <Box
      sx={{
        minHeight: 520,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 6 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 580,
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          border: "1px solid #DCE6F4",
          bgcolor: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        {/* Animated icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
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
                width: 78,
                height: 78,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#EEF4FF",
                color: "primary.main",
                boxShadow:
                  "0 12px 30px rgba(37,99,235,0.12)",
              }}
            >
              <PsychologyIcon
                sx={{ fontSize: 42 }}
              />
            </Box>
          </motion.div>
        </Box>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: "#0F172A",
            letterSpacing: "-0.02em",
          }}
        >
          Preparing Your Assessment
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            lineHeight: 1.7,
            color: "#64748B",
          }}
        >
          Your assessment data is being prepared for personalized
          analysis.
        </Typography>

        {/* Dynamic stage message */}
        <Box
          sx={{
            mt: 3,
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: "#334155",
            }}
          >
            {getStageMessage()}
          </Typography>
        </Box>

        {/* Progress */}
        <Box
          sx={{
            mt: 4,
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
              sx={{
                color: "#0F172A",
              }}
            >
              Assessment progress
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              color="primary"
            >
              {Math.round(progress)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
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

        {/* Assessment stages */}
        <Stack
          spacing={1.5}
          sx={{
            mt: 4,
            textAlign: "left",
          }}
        >
          {stages.map((stage) => (
            <Box
              key={stage.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: 3,
                bgcolor: stage.completed
                  ? "#F0FDF4"
                  : "#F8FAFC",
                border: "1px solid",
                borderColor: stage.completed
                  ? "#BBF7D0"
                  : "#E2E8F0",
                transition:
                  "background-color 0.25s ease, border-color 0.25s ease",
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  minWidth: 38,
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
                  <CheckCircleIcon />
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
            mt: 3,
            color: "#94A3B8",
          }}
        >
          Preparing your personalized results...
        </Typography>
      </Card>
    </Box>
  );
}

export default AnalysisScreen;