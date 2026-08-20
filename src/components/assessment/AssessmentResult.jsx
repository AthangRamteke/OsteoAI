import {
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { useAssessment } from "../../context/AssessmentContext";

function AssessmentResult({ onEdit, onRetake }) {
  const { assessmentData } = useAssessment();

  const {
    personal,
    lifestyle,
    medicalHistory,
  } = assessmentData;

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

          <Box
            sx={{
              minWidth: 0,
            }}
          >
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
      <Box
        sx={{
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#EEF4FF",
            color: "primary.main",
          }}
        >
          <HealthAndSafetyIcon
            sx={{
              fontSize: 34,
            }}
          />
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
          Your assessment information has been collected successfully.
        </Typography>
      </Box>

      {/* Overall Assessment */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border: "1px solid #DCE6F4",
          bgcolor: "rgba(248,250,252,0.95)",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, md: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
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
                color="primary"
                fontWeight={800}
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
                Prediction will appear here
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  maxWidth: 620,
                  color: "#64748B",
                  lineHeight: 1.7,
                }}
              >
                The machine-learning model will use the collected
                personal, lifestyle, and medical factors to generate
                your osteoporosis risk assessment.
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: { md: 190 },
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
                Risk Score
              </Typography>

              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  mt: 0.5,
                  color: "primary.main",
                }}
              >
                —
              </Typography>

              <Chip
                label="Awaiting ML model"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: "#EEF4FF",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

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
              value={calculateBMI() || "—"}
              subtitle={getBMICategory()}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              icon={<FitnessCenterIcon />}
              label="Activity"
              value={
                lifestyle.physicalActivity ||
                "Not provided"
              }
            />
          </Grid>
        </Grid>
      </Box>

      {/* Risk Breakdown */}
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
              Risk Breakdown
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
            These categories will be scored by the ML model after
            backend integration.
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {[
              "Personal Factors",
              "Lifestyle Factors",
              "Medical Factors",
            ].map((label) => (
              <Box
                key={label}
                sx={{
                  p: 2,
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
                  {label}
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    mt: 1,
                    color: "#94A3B8",
                  }}
                >
                  Pending
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Key Factors */}
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
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Assessment Factors
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              mb: 2.5,
              color: "#64748B",
            }}
          >
            Information currently considered by the assessment workflow.
          </Typography>

          <Stack spacing={1.5}>
            <FactorRow
              icon={<PersonIcon fontSize="small" />}
              title="Gender"
              value={personal.gender}
            />

            <FactorRow
              icon={<HealthAndSafetyIcon fontSize="small" />}
              title="Family History"
              value={medicalHistory.familyHistory}
            />

            <FactorRow
              icon={<HealthAndSafetyIcon fontSize="small" />}
              title="Previous Fracture"
              value={medicalHistory.previousFracture}
            />

            <FactorRow
              icon={<MedicalInformationIcon fontSize="small" />}
              title="Long-Term Medication"
              value={medicalHistory.medications}
            />

            <FactorRow
              icon={<FitnessCenterIcon fontSize="small" />}
              title="Smoking"
              value={lifestyle.smoking}
            />

            <FactorRow
              icon={<FitnessCenterIcon fontSize="small" />}
              title="Alcohol"
              value={lifestyle.alcohol}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Future Insights */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px dashed #BFDBFE",
          bgcolor: "#F8FAFF",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
          >
            Explainable AI & Analytics
          </Typography>

          <Typography
            sx={{
              mt: 1,
              maxWidth: 620,
              mx: "auto",
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            SHAP explanations, risk-factor charts, personalized
            recommendations, and advanced analytics will appear here
            once the prediction model and backend are connected.
          </Typography>

          <Chip
            label="Planned ML + SHAP integration"
            sx={{
              mt: 2,
              bgcolor: "#EEF4FF",
              color: "primary.main",
              fontWeight: 700,
            }}
          />
        </CardContent>
      </Card>

      <Divider />

      {/* Actions */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
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