import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PersonIcon from "@mui/icons-material/Person";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import InsightsIcon from "@mui/icons-material/Insights";
import TrendingUpIcon from "@mui/icons-material/ArrowUpward";
import TrendingDownIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/ReportProblem";

import { useAssessment } from "../../context/AssessmentContext";

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

  const probabilityPercent = Number.isFinite(probability)
    ? (probability * 100).toFixed(1)
    : "—";

  const prediction = Number(result.prediction);

  const riskLevel = result.risk_level || "Unavailable";

  const isPositive = prediction === 1;

  const shapExplanations = Array.isArray(
    result.shap_explanations
  )
    ? result.shap_explanations
    : [];

  const calculateBMI = () => {
    const heightInMeters =
      Number(personal.height) / 100;

    const weight = Number(personal.weight);

    if (!heightInMeters || !weight) {
      return "";
    }

    return (
      weight /
      (heightInMeters * heightInMeters)
    ).toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = Number(calculateBMI());

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
        label={value || "Not provided"}
        size="small"
        sx={{
          fontWeight: 700,
          bgcolor: "white",
          border: "1px solid #E2E8F0",
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
          border: "1px solid #DCE6F4",
          bgcolor: getRiskBackground(),
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, md: 4 },
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
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                fontWeight={800}
                sx={{
                  color: getRiskColor(),
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
                probability for the positive osteoporosis
                class in this assessment.
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: { md: 210 },
                p: 2.5,
                borderRadius: 4,
                bgcolor: "white",
                border: "1px solid #E2E8F0",
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
                  color: getRiskColor(),
                }}
              >
                {probabilityPercent}%
              </Typography>

              <Chip
                label={riskLevel}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: getRiskBackground(),
                  color: getRiskColor(),
                  fontWeight: 800,
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Model Status */}
      <Alert
        severity={isPositive ? "warning" : "success"}
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
          sx={{ mt: 0.5 }}
        >
          This is a research/prototype risk assessment and
          is not a medical diagnosis.
        </Typography>
      </Alert>
      {/* SHAP Explainability */}
      {shapExplanations.length > 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid #E2E8F0",
            bgcolor: "white",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2.5, md: 3 },
            }}
          >
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: "center",
              }}
            >
              <InsightsIcon color="primary" />

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Why the Model Produced This Result
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
              These are the strongest factors that influenced
              this particular model prediction. They explain the
              model output and are not medical diagnoses.
            </Typography>

            <Stack
              spacing={1.5}
              sx={{
                mt: 2.5,
              }}
            >
              {shapExplanations.map((item) => {
                const shapValue = Number(
                  item.shap_value
                );

                const increases =
                  item.direction ===
                  "increases_model_output";

                const magnitude = Number.isFinite(
                  shapValue
                )
                  ? Math.abs(shapValue).toFixed(3)
                  : "—";

                return (
                  <Box
                    key={item.feature}
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1.5}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: {
                          xs: "stretch",
                          sm: "center",
                        },
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
                            width: 38,
                            height: 38,
                            borderRadius: 2.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: increases
                              ? "#FEF2F2"
                              : "#F0FDF4",
                            color: increases
                              ? "#DC2626"
                              : "#16A34A",
                            flexShrink: 0,
                          }}
                        >
                          {increases ? (
                            <TrendingUpIcon />
                          ) : (
                            <TrendingDownIcon />
                          )}
                        </Box>

                        <Box>
                          <Typography
                            variant="body1"
                            fontWeight={800}
                            sx={{
                              color: "#0F172A",
                            }}
                          >
                            {item.label ||
                              item.feature}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.25,
                              color: "#64748B",
                            }}
                          >
                            {increases
                              ? "Increased the model output"
                              : "Decreased the model output"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={`Influence ${magnitude}`}
                        size="small"
                        sx={{
                          alignSelf: {
                            xs: "flex-start",
                            sm: "center",
                          },
                          fontWeight: 800,
                          bgcolor: "white",
                          border:
                            "1px solid #E2E8F0",
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "#94A3B8",
                      }}
                    >
                      Input value:{" "}
                      {item.value !== null &&
                        item.value !== undefined
                        ? String(item.value)
                        : "Not provided"}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              icon={<HealthAndSafetyIcon />}
              label="BMI"
              value={
                calculateBMI() || "—"
              }
              subtitle={getBMICategory()}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              icon={<FitnessCenterIcon />}
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
          border: "1px solid #E2E8F0",
          bgcolor: "white",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
            }}
          >
            <InsightsIcon color="primary" />

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
            Personal, lifestyle, and medical information
            were combined to generate the model output.
          </Typography>

          <Stack
            spacing={1.5}
            sx={{ mt: 2.5 }}
          >
            <FactorRow
              icon={<PersonIcon fontSize="small" />}
              title="Gender"
              value={personal.gender}
            />

            <FactorRow
              icon={<HealthAndSafetyIcon fontSize="small" />}
              title="Race / Ethnicity"
              value={
                personal.raceEthnicity
                  ? "Provided"
                  : ""
              }
            />

            <FactorRow
              icon={<FitnessCenterIcon fontSize="small" />}
              title="Smoking History"
              value={
                lifestyle.smoked100Cigarettes
              }
            />

            <FactorRow
              icon={<MedicalInformationIcon fontSize="small" />}
              title="Long-Term Steroid Use"
              value={
                medicalHistory.longTermSteroidUse
              }
            />

            <FactorRow
              icon={<HealthAndSafetyIcon fontSize="small" />}
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
          border: "1px solid #E2E8F0",
          bgcolor: "#F8FAFC",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
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
            sx={{ mt: 0.5 }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Model Version
              </Typography>

              <Typography
                fontWeight={800}
                sx={{ mt: 0.5 }}
              >
                {result.model_version || "—"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Decision Threshold
              </Typography>

              <Typography
                fontWeight={800}
                sx={{ mt: 0.5 }}
              >
                {result.threshold_used !== undefined
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
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onEdit}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Edit Assessment
        </Button>

        <Button
          variant="contained"
          startIcon={<RestartAltIcon />}
          onClick={onRetake}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
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
