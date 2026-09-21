import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PersonIcon from "@mui/icons-material/Person";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import InsightsIcon from "@mui/icons-material/Insights";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import { useAssessment } from "../../context/AssessmentContext";
import { streamAgentMessage } from "../../services/agentService";
import { historyForAgent } from "../../services/historyStore";


/* =========================================================
   Result Assistant
   ========================================================= */

function ResultAssistant({ predictionResult }) {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your OsteoAI Assistant. I can explain your assessment result, including the model probability and the factors that influenced it.",
    },
  ]);

  const [conversationId, setConversationId] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const language =
    localStorage.getItem("osteoai-language") || "en";


  const sendMessage = async (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setError("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      let action = null;
      let finalMessage = "";
      let streamedText = "";

      /*
       * Show the assistant reply as it streams in.
       * The first chunk adds a bubble marked
       * `streaming`; later chunks update it.
       */
      const showAssistantText = (
        content,
        streaming = true
      ) => {
        setMessages((previous) => {
          const last = previous[previous.length - 1];
          const next = {
            role: "assistant",
            content,
            streaming,
          };

          return last?.streaming
            ? [...previous.slice(0, -1), next]
            : [...previous, next];
        });
      };

      await streamAgentMessage({
        message: trimmedMessage,
        predictionResult,
        assessmentHistory: historyForAgent(),
        conversationId,
        language,
        onEvent: (event) => {
          if (event.type === "meta") {
            if (event.conversation_id) {
              setConversationId(
                event.conversation_id
              );
            }
            action = event.action;
          }

          if (event.type === "delta") {
            streamedText += event.text;
            showAssistantText(streamedText);
          }

          if (event.type === "done") {
            finalMessage = event.message;
          }
        },
      });

      /*
       * Execute Agent actions.
       *
       * The backend can return:
       *
       * {
       *   "action": {
       *     "type": "navigate",
       *     "path": "/dashboard"
       *   }
       * }
       *
       * The frontend performs the actual navigation.
       */
      const allowedPaths = [
        "/",
        "/dashboard",
        "/assessment",
        "/history",
        "/assistant",
        "/knowledge",
      ];

      if (
        action?.type === "navigate" &&
        allowedPaths.includes(action.path)
      ) {
        showAssistantText(
          finalMessage ||
          "Opening the requested page.",
          false
        );

        setTimeout(() => {
          if (action.path === "/assessment") {
            /*
             * Result and Assessment currently share
             * the same /assessment route.
             *
             * A full navigation resets Assessment.jsx
             * back to its initial entry state.
             */
            window.location.assign(
              "/assessment"
            );
            return;
          }

          navigate(action.path);
        }, 350);

        return;
      }

      // The final message is cleaned of formatting
      // the chat bubble cannot display.
      showAssistantText(
        finalMessage ||
        streamedText ||
        "I was unable to generate a response.",
        false
      );
    } catch (agentError) {
      console.error(
        "OsteoAI Agent request failed:",
        agentError
      );

      setError(
        agentError?.message ||
        "Unable to connect to the OsteoAI Assistant."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };


  const quickQuestions = [
    "Explain my result",
    "Why did I get this result?",
    "What does my risk level mean?",
  ];


  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #DCE6F4",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
        }}
      >

        {/* Header */}

        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#EEF4FF",
              color: "#2563EB",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                color: "#0F172A",
              }}
            >
              Ask OsteoAI
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.25,
                color: "#64748B",
              }}
            >
              Ask questions about this assessment result.
            </Typography>
          </Box>
        </Stack>


        {/* Quick Questions */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {quickQuestions.map((question) => (
            <Chip
              key={question}
              label={question}
              onClick={() =>
                sendMessage(question)
              }
              clickable
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderColor: "#D7E3F4",
              }}
            />
          ))}
        </Stack>


        {/* Conversation */}

        <Box
          sx={{
            mt: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            maxHeight: 360,
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {messages.map((item, index) => {
            const isAssistant =
              item.role === "assistant";

            return (
              <Stack
                key={`${item.role}-${index}`}
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "flex-start",
                  justifyContent: isAssistant
                    ? "flex-start"
                    : "flex-end",
                }}
              >
                {isAssistant && (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#EEF4FF",
                      color: "#2563EB",
                      flexShrink: 0,
                    }}
                  >
                    <SmartToyIcon
                      sx={{ fontSize: 18 }}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    maxWidth: {
                      xs: "88%",
                      sm: "78%",
                    },
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 3,
                    bgcolor: isAssistant
                      ? "#F8FAFC"
                      : "#EEF4FF",
                    border: isAssistant
                      ? "1px solid #E2E8F0"
                      : "1px solid #D7E3F4",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#334155",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {item.content}
                  </Typography>
                </Box>
              </Stack>
            );
          })}


          {loading &&
            !messages[messages.length - 1]
              ?.streaming && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#EEF4FF",
                  color: "#2563EB",
                }}
              >
                <SmartToyIcon
                  sx={{ fontSize: 18 }}
                />
              </Box>

              <CircularProgress size={18} />
            </Stack>
          )}
        </Box>


        {/* Error */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}


        {/* Input */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2.5,
            alignItems: "flex-end",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask about your result..."
            size="small"
          />

          <IconButton
            color="primary"
            onClick={() => sendMessage()}
            disabled={
              loading || !message.trim()
            }
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: "#EEF4FF",
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>


        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1,
            color: "#94A3B8",
          }}
        >
          OsteoAI provides a prototype risk assessment
          explanation, not a medical diagnosis.
        </Typography>

      </CardContent>
    </Card>
  );
}


/* =========================================================
   Assessment Result
   ========================================================= */

function AssessmentResult({
  predictionResult,
  onEdit,
  onRetake,
}) {
  const { assessmentData } = useAssessment();

  const {
    personal,
    lifestyle,
    medicalHistory,
  } = assessmentData;

  const result = predictionResult || {};

  const probability = Number(
    result.osteoporosis_probability
  );

  const probabilityPercent =
    Number.isFinite(probability)
      ? (probability * 100).toFixed(1)
      : "—";

  const prediction = Number(
    result.prediction
  );

  const riskLevel =
    result.risk_level || "Unavailable";

  const isPositive =
    prediction === 1;


  const calculateBMI = () => {
    const heightInMeters =
      Number(personal.height) / 100;

    const weight =
      Number(personal.weight);

    if (
      !heightInMeters ||
      !weight
    ) {
      return "";
    }

    return (
      weight /
      (heightInMeters * heightInMeters)
    ).toFixed(1);
  };


  const getBMICategory = () => {
    const bmi =
      Number(calculateBMI());

    if (!bmi) {
      return "Not available";
    }

    if (bmi < 18.5) {
      return "Underweight";
    }

    if (bmi < 25) {
      return "Healthy Weight";
    }

    if (bmi < 30) {
      return "Overweight";
    }

    return "Obese";
  };


  const getRiskColor = () => {
    if (riskLevel === "High") {
      return "#DC2626";
    }

    if (riskLevel === "Moderate") {
      return "#D97706";
    }

    if (riskLevel === "Low") {
      return "#16A34A";
    }

    return "#2563EB";
  };


  const getRiskBackground = () => {
    if (riskLevel === "High") {
      return "#FEF2F2";
    }

    if (riskLevel === "Moderate") {
      return "#FFFBEB";
    }

    if (riskLevel === "Low") {
      return "#F0FDF4";
    }

    return "#EEF4FF";
  };


  const MetricCard = ({
    icon,
    label,
    value,
    subtitle,
  }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        bgcolor: "rgba(255,255,255,0.94)",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#EEF4FF",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
              }}
            >
              {label}
            </Typography>

            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                mt: 0.25,
                color: "#0F172A",
                overflowWrap: "anywhere",
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.25,
                  color: "#94A3B8",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );


  const FactorRow = ({
    icon,
    title,
    value,
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 1.5,
        borderRadius: 3,
        bgcolor: "#F8FAFC",
        border: "1px solid #E2E8F0",
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: "center",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            color: "#334155",
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Chip
        label={
          value || "Not provided"
        }
        size="small"
        sx={{
          fontWeight: 700,
          bgcolor: "white",
          border:
            "1px solid #E2E8F0",
          maxWidth: "48%",
        }}
      />
    </Box>
  );


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >

      {/* Header */}

      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 68,
            height: 68,
            mx: "auto",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isPositive
              ? "#FEF2F2"
              : "#F0FDF4",
            color: isPositive
              ? "#DC2626"
              : "#16A34A",
          }}
        >
          {isPositive ? (
            <WarningAmberIcon
              sx={{ fontSize: 36 }}
            />
          ) : (
            <CheckCircleIcon
              sx={{ fontSize: 36 }}
            />
          )}
        </Box>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            mt: 2,
            color: "#0F172A",
            letterSpacing: "-0.02em",
          }}
        >
          Your Bone Health Assessment
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "#64748B",
            lineHeight: 1.7,
          }}
        >
          Your assessment has been processed using the
          OsteoAI machine-learning model.
        </Typography>
      </Box>


      {/* Overall Assessment */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border:
            "1px solid #DCE6F4",
          bgcolor:
            getRiskBackground(),
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 4,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={3}
            sx={{
              alignItems: {
                xs: "stretch",
                md: "center",
              },
              justifyContent:
                "space-between",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                fontWeight={800}
                sx={{
                  color:
                    getRiskColor(),
                }}
              >
                OVERALL ASSESSMENT
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  mt: 0.5,
                  color: "#0F172A",
                }}
              >
                {riskLevel} Risk Level
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  maxWidth: 620,
                  color: "#64748B",
                  lineHeight: 1.7,
                }}
              >
                The model estimates a{" "}
                <strong>
                  {probabilityPercent}%
                </strong>{" "}
                probability for the
                positive osteoporosis
                class in this assessment.
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: {
                  md: 210,
                },
                p: 2.5,
                borderRadius: 4,
                bgcolor: "white",
                border:
                  "1px solid #E2E8F0",
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                }}
              >
                Estimated Probability
              </Typography>

              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  mt: 0.5,
                  color:
                    getRiskColor(),
                }}
              >
                {probabilityPercent}%
              </Typography>

              <Chip
                label={riskLevel}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor:
                    getRiskBackground(),
                  color:
                    getRiskColor(),
                  fontWeight: 800,
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>


      {/* Ask OsteoAI */}

      <ResultAssistant
        predictionResult={result}
      />


      {/* Model Status */}

      <Alert
        severity={
          isPositive
            ? "warning"
            : "success"
        }
        icon={
          isPositive ? (
            <WarningAmberIcon />
          ) : (
            <CheckCircleIcon />
          )
        }
        sx={{
          borderRadius: 3,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
        >
          Model prediction:{" "}
          {isPositive
            ? "Positive osteoporosis risk flag"
            : "No osteoporosis risk flag"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
          }}
        >
          This is a research/prototype
          risk assessment and is not a
          medical diagnosis.
        </Typography>
      </Alert>


      {/* Key Metrics */}

      <Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            mb: 2,
            color: "#0F172A",
          }}
        >
          Key Health Metrics
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <MetricCard
              icon={<PersonIcon />}
              label="Age"
              value={
                personal.age
                  ? `${personal.age} years`
                  : "Not provided"
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <MetricCard
              icon={
                <HealthAndSafetyIcon />
              }
              label="BMI"
              value={
                calculateBMI() ||
                "—"
              }
              subtitle={
                getBMICategory()
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <MetricCard
              icon={
                <FitnessCenterIcon />
              }
              label="Sedentary Time"
              value={
                lifestyle.sedentaryMinutes
                  ? `${lifestyle.sedentaryMinutes} min`
                  : "Not provided"
              }
              subtitle="Typical day"
            />
          </Grid>
        </Grid>
      </Box>


      {/* Assessment Factors */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border:
            "1px solid #E2E8F0",
          bgcolor: "white",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
            }}
          >
            <InsightsIcon
              color="primary"
            />

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Assessment Factors
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            Personal, lifestyle, and
            medical information were
            combined to generate the
            model output.
          </Typography>

          <Stack
            spacing={1.5}
            sx={{
              mt: 2.5,
            }}
          >
            <FactorRow
              icon={
                <PersonIcon
                  fontSize="small"
                />
              }
              title="Gender"
              value={
                personal.gender
              }
            />

            <FactorRow
              icon={
                <HealthAndSafetyIcon
                  fontSize="small"
                />
              }
              title="Race / Ethnicity"
              value={
                personal.raceEthnicity
                  ? "Provided"
                  : ""
              }
            />

            <FactorRow
              icon={
                <FitnessCenterIcon
                  fontSize="small"
                />
              }
              title="Smoking History"
              value={
                lifestyle.smoked100Cigarettes
              }
            />

            <FactorRow
              icon={
                <MedicalInformationIcon
                  fontSize="small"
                />
              }
              title="Long-Term Steroid Use"
              value={
                medicalHistory.longTermSteroidUse
              }
            />

            <FactorRow
              icon={
                <HealthAndSafetyIcon
                  fontSize="small"
                />
              }
              title="Family Osteoporosis History"
              value={
                medicalHistory.parentOsteoporosisHistory
              }
            />
          </Stack>
        </CardContent>
      </Card>


      {/* Model Information */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border:
            "1px solid #E2E8F0",
          bgcolor: "#F8FAFC",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Model Information
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{
              mt: 0.5,
            }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Model Version
              </Typography>

              <Typography
                fontWeight={800}
                sx={{
                  mt: 0.5,
                }}
              >
                {result.model_version ||
                  "—"}
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Decision Threshold
              </Typography>

              <Typography
                fontWeight={800}
                sx={{
                  mt: 0.5,
                }}
              >
                {result.threshold_used !==
                  undefined
                  ? result.threshold_used
                  : "—"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      {/* Disclaimer */}

      <Alert
        severity="info"
        sx={{
          borderRadius: 3,
        }}
      >
        {result.disclaimer ||
          "This is a research/prototype risk-assessment output, not a medical diagnosis, and has not been clinically validated."}
      </Alert>


      <Divider />


      {/* Actions */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent: "center",
        }}
      >
        {onEdit && (
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={onEdit}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform:
              "none",
            fontWeight: 700,
          }}
        >
          Edit Assessment
        </Button>
        )}

        <Button
          variant="contained"
          startIcon={
            <RestartAltIcon />
          }
          onClick={onRetake}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform:
              "none",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Retake Assessment
        </Button>
      </Stack>
    </Box>
  );
}


export default AssessmentResult;