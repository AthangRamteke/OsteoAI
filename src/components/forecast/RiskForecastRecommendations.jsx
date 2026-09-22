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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WarningAmberIcon from "@mui/icons-material/ReportProblem";

import { useLanguage } from "../../context/LanguageContext";

/*
|--------------------------------------------------------------------------
| RiskForecastRecommendations
|--------------------------------------------------------------------------
| This screen NEVER computes, recalculates, or estimates a risk score of
| its own. The ONLY number it shows for the model score is derived from
| `predictionResult.osteoporosis_probability`, using the exact same
| conversion the rest of the app already uses:
|
|     (probability * 100).toFixed(1)
|
| (see AssessmentResult.jsx / DashboardPage.jsx). Everything else on this
| screen — the risk-range bucket, the factor list, the priorities, and
| the recommended next steps — is a presentational interpretation of that
| single number plus the patient's own already-collected assessment
| answers. No values are invented: a factor is only ever shown when the
| corresponding field is actually present in `assessmentData`.
*/

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "";

const isYes = (value) =>
  String(value || "").trim().toLowerCase() === "yes";

function RiskForecastRecommendations({
  assessmentData,
  predictionResult,
  onBack,
  onRetake,
}) {
  const { t } = useLanguage();

  const data = assessmentData || {};
  const personal = data.personal || {};
  const lifestyle = data.lifestyle || {};
  const medicalHistory = data.medicalHistory || {};

  const result = predictionResult || {};

  const probability = Number(
    result.osteoporosis_probability
  );

  const scoreAvailable = Number.isFinite(probability);

  // ---------------------------------------------------------------
  // THE EXISTING APPLICATION'S ESTABLISHED CONVERSION.
  // Do not change this formula — it must always match
  // AssessmentResult.jsx / DashboardPage.jsx exactly.
  // ---------------------------------------------------------------
  const percentDisplay = scoreAvailable
    ? (probability * 100).toFixed(1)
    : null;

  const numericPercent = scoreAvailable
    ? probability * 100
    : null;

  const markerPercent =
    numericPercent === null
      ? 0
      : Math.min(100, Math.max(0, numericPercent));

  // Project-defined display ranges for THIS screen only — a way of
  // presenting the existing score, not a second model.
  const bucket =
    numericPercent === null
      ? null
      : numericPercent < 20
        ? "lower"
        : numericPercent <= 60
          ? "moderate"
          : "higher";

  const isHigherRisk = bucket === "higher";

  const bucketColor =
    bucket === "higher"
      ? "#DC2626"
      : bucket === "moderate"
        ? "#D97706"
        : bucket === "lower"
          ? "#16A34A"
          : "#2563EB";

  const bucketBg =
    bucket === "higher"
      ? "#FEF2F2"
      : bucket === "moderate"
        ? "#FFFBEB"
        : bucket === "lower"
          ? "#F0FDF4"
          : "#EEF4FF";

  const bucketLabel =
    bucket === "higher"
      ? t("forecast.scale.higher")
      : bucket === "moderate"
        ? t("forecast.scale.moderate")
        : bucket === "lower"
          ? t("forecast.scale.lower")
          : t("common.riskLevels.Unavailable");

  // ---------------------------------------------------------------
  // PATIENT ASSESSMENT DATA — only ever read, never guessed.
  // ---------------------------------------------------------------
  const hasAssessmentData =
    hasValue(personal.age) ||
    hasValue(personal.gender) ||
    hasValue(lifestyle.smoked100Cigarettes) ||
    hasValue(medicalHistory.parentOsteoporosisHistory);

  const calculateBMI = () => {
    const heightInMeters = Number(personal.height) / 100;
    const weight = Number(personal.weight);

    if (!heightInMeters || !weight) {
      return null;
    }

    return weight / (heightInMeters * heightInMeters);
  };

  const bmiNumber = calculateBMI();

  const bmiCategory = !Number.isFinite(bmiNumber)
    ? null
    : bmiNumber < 18.5
      ? "Underweight"
      : bmiNumber < 25
        ? "Healthy Weight"
        : bmiNumber < 30
          ? "Overweight"
          : "Obese";

  const translateBMICategory = (category) =>
    category ? t(`common.bmiCategories.${category}`) : "";

  const translateGender = (gender) => {
    if (!hasValue(gender)) return "";
    return (
      t(`common.values.${String(gender).toLowerCase()}`) ||
      gender
    );
  };

  const translateYesNo = (value) => {
    if (isYes(value)) return t("common.yes");
    if (String(value || "").trim().toLowerCase() === "no")
      return t("common.no");
    return "";
  };

  const alcoholFrequencyLabel = (() => {
    const map = {
      0: t("dashboard.alcoholFreqNever"),
      1: t("dashboard.alcoholFreqLess1"),
      2: t("dashboard.alcoholFreqOnce1"),
      3: t("dashboard.alcoholFreq23"),
      4: t("dashboard.alcoholFreq46"),
      5: t("dashboard.alcoholFreqDaily"),
    };
    const code = Number(lifestyle.alcoholFrequency);
    return Number.isFinite(code) && map[code]
      ? map[code]
      : "";
  })();

  const alcoholFrequencyCode = Number(
    lifestyle.alcoholFrequency
  );

  // ---------------------------------------------------------------
  // DERIVED, DATA-BACKED FLAGS (aggregating fields the patient
  // already answered — not a new prediction of any kind).
  // ---------------------------------------------------------------
  const activityFields = [
    lifestyle.vigorousWorkActivity,
    lifestyle.moderateWorkActivity,
    lifestyle.walkOrBicycle,
    lifestyle.vigorousRecreation,
    lifestyle.moderateRecreation,
  ];

  const activityFieldsPresent = activityFields.some(
    hasValue
  );

  const physicalActivityLow =
    activityFieldsPresent &&
    !activityFields.some((value) => isYes(value));

  const smokingYes = isYes(
    lifestyle.smoked100Cigarettes
  );

  const alcoholEverYes = isYes(lifestyle.alcoholEver);

  const alcoholHigh =
    alcoholEverYes &&
    Number.isFinite(alcoholFrequencyCode) &&
    alcoholFrequencyCode >= 3;

  const underweight =
    Number.isFinite(bmiNumber) && bmiNumber < 18.5;

  const fractureAfter20Yes = isYes(
    medicalHistory.otherBoneFractureAfter20
  );

  const steroidYes = isYes(
    medicalHistory.longTermSteroidUse
  );

  const exerciseNeedsCaution =
    fractureAfter20Yes ||
    isHigherRisk ||
    Number(result.prediction) === 1;

  // ---------------------------------------------------------------
  // FACTORS IDENTIFIED — only fields that are actually present.
  // ---------------------------------------------------------------
  const modifiableFactors = [
    activityFieldsPresent && {
      key: "activity",
      label: t("forecast.factors.physicalActivity"),
      value: physicalActivityLow
        ? t("forecast.factors.physicalActivityLow")
        : t("forecast.factors.physicalActivityActive"),
    },
    hasValue(lifestyle.smoked100Cigarettes) && {
      key: "smoking",
      label: t("forecast.factors.smoking"),
      value: translateYesNo(
        lifestyle.smoked100Cigarettes
      ),
    },
    hasValue(lifestyle.alcoholEver) && {
      key: "alcohol",
      label: t("forecast.factors.alcohol"),
      value: [
        translateYesNo(lifestyle.alcoholEver),
        alcoholFrequencyLabel,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    hasValue(lifestyle.sedentaryMinutes) && {
      key: "sedentary",
      label: t("forecast.factors.sedentaryTime"),
      value: t("dashboard.hrsPerDay", {
        value: (
          Number(lifestyle.sedentaryMinutes) / 60
        ).toFixed(1),
      }),
    },
  ].filter(Boolean);

  const nonModifiableFactors = [
    hasValue(personal.age) && {
      key: "age",
      label: t("forecast.factors.age"),
      value: t("assessment.result.yearsSuffix", {
        value: personal.age,
      }),
    },
    hasValue(personal.gender) && {
      key: "sex",
      label: t("forecast.factors.sex"),
      value: translateGender(personal.gender),
    },
    Number.isFinite(bmiNumber) && {
      key: "bmi",
      label: t("forecast.factors.bmi"),
      value: `${bmiNumber.toFixed(1)} (${translateBMICategory(
        bmiCategory
      )})`,
    },
    hasValue(medicalHistory.parentOsteoporosisHistory) && {
      key: "familyHistory",
      label: t("forecast.factors.familyHistory"),
      value: translateYesNo(
        medicalHistory.parentOsteoporosisHistory
      ),
    },
    hasValue(medicalHistory.motherHipFracture) && {
      key: "motherHip",
      label: t("forecast.factors.motherHipFracture"),
      value: translateYesNo(
        medicalHistory.motherHipFracture
      ),
    },
    hasValue(medicalHistory.fatherHipFracture) && {
      key: "fatherHip",
      label: t("forecast.factors.fatherHipFracture"),
      value: translateYesNo(
        medicalHistory.fatherHipFracture
      ),
    },
    hasValue(medicalHistory.otherBoneFractureAfter20) && {
      key: "fractureHistory",
      label: t("forecast.factors.fractureHistory"),
      value: translateYesNo(
        medicalHistory.otherBoneFractureAfter20
      ),
    },
    hasValue(medicalHistory.longTermSteroidUse) && {
      key: "steroid",
      label: t("forecast.factors.steroidUse"),
      value: translateYesNo(
        medicalHistory.longTermSteroidUse
      ),
    },
  ].filter(Boolean);

  // ---------------------------------------------------------------
  // PERSONALIZED PRIORITIES — only ever shown when the underlying
  // data actually supports them.
  // ---------------------------------------------------------------
  const priorities = [
    physicalActivityLow && {
      key: "activity",
      title: t("forecast.priorities.activityTitle"),
      body: t("forecast.priorities.activityBody"),
    },
    smokingYes && {
      key: "smoking",
      title: t("forecast.priorities.smokingTitle"),
      body: t("forecast.priorities.smokingBody"),
    },
    alcoholHigh && {
      key: "alcohol",
      title: t("forecast.priorities.alcoholTitle"),
      body: t("forecast.priorities.alcoholBody"),
    },
    underweight && {
      key: "weight",
      title: t("forecast.priorities.weightTitle"),
      body: t("forecast.priorities.weightBody"),
    },
  ].filter(Boolean);

  // ---------------------------------------------------------------
  // NEXT STEPS — 3 to 5 items, dynamically selected.
  // ---------------------------------------------------------------
  const nextSteps = [
    physicalActivityLow
      ? t("forecast.nextSteps.activity")
      : t("forecast.nextSteps.generalActivity"),
    t("forecast.nextSteps.calcium"),
    t("forecast.nextSteps.protein"),
    (smokingYes || alcoholHigh) &&
      t("forecast.nextSteps.avoidSmokingAlcohol"),
    (bucket !== "lower" || fractureAfter20Yes) &&
      t("forecast.nextSteps.discussProfessional"),
  ]
    .filter(Boolean)
    .slice(0, 5);

  // ---------------------------------------------------------------
  // SUB-COMPONENTS
  // ---------------------------------------------------------------

  const SectionCard = ({ children, sx }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        bgcolor: "white",
        ...sx,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );

  const SectionTitle = ({ children }) => (
    <Typography
      variant="h6"
      fontWeight={800}
      sx={{ color: "#0F172A", mb: 1.5 }}
    >
      {children}
    </Typography>
  );

  const FactorChip = ({ label, value }) => (
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
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: "#334155" }}
      >
        {label}
      </Typography>

      <Chip
        label={value || t("common.notProvided")}
        size="small"
        sx={{
          fontWeight: 700,
          bgcolor: "white",
          border: "1px solid #E2E8F0",
          maxWidth: "55%",
        }}
      />
    </Box>
  );

  const PriorityCard = ({ title, body }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "#F8FAFC",
        border: "1px solid #E2E8F0",
      }}
    >
      <Typography
        fontWeight={800}
        sx={{ color: "#0F172A" }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 0.5, color: "#64748B", lineHeight: 1.65 }}
      >
        {body}
      </Typography>
    </Box>
  );

  const BulletList = ({ items }) => (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {items.map((item) => (
        <Typography
          key={item}
          component="li"
          variant="body2"
          sx={{ color: "#334155", mb: 0.5, lineHeight: 1.6 }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );

  const EvidenceBadge = () => (
    <Chip
      size="small"
      label={t("forecast.sources.badge")}
      sx={{
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
        bgcolor: "#EEF4FF",
        color: "#2563EB",
        border: "1px solid #DBEAFE",
      }}
    />
  );

  // ---------------------------------------------------------------
  // ERROR STATE — no score, no fabricated 0%.
  // ---------------------------------------------------------------
  if (!scoreAvailable) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#0F172A" }}
          >
            {t("forecast.pageTitle")}
          </Typography>
        </Box>

        <Alert
          severity="warning"
          icon={<WarningAmberIcon />}
          sx={{ borderRadius: 3 }}
        >
          <Typography variant="body1" fontWeight={800}>
            {t("forecast.unavailableTitle")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {t("forecast.unavailableBody")}
          </Typography>
        </Alert>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "center" }}
        >
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
            {t("forecast.unavailableCta")}
          </Button>

          {onBack && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {t("common.back")}
            </Button>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* ===================================================
          HEADER
          =================================================== */}
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: "#0F172A",
            letterSpacing: "-0.02em",
          }}
        >
          {t("forecast.pageTitle")}
        </Typography>

        <Typography
          sx={{ mt: 1, color: "#64748B", lineHeight: 1.7 }}
        >
          {t("forecast.pageSubtitle")}
        </Typography>
      </Box>

      {/* ===================================================
          MODEL SCORE
          =================================================== */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          border: "1px solid #DCE6F4",
          bgcolor: bucketBg,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                fontWeight={800}
                sx={{ color: bucketColor }}
              >
                {t("forecast.scoreLabel")}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: "2.6rem", md: "3.2rem" },
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: bucketColor,
                }}
              >
                {percentDisplay}%
              </Typography>

              <Chip
                label={bucketLabel}
                size="small"
                sx={{
                  mt: 1.25,
                  bgcolor: "white",
                  color: bucketColor,
                  fontWeight: 800,
                  border: `1px solid ${bucketColor}33`,
                }}
              />
            </Box>

            <Box
              sx={{
                maxWidth: { md: 420 },
                p: 2.5,
                borderRadius: 4,
                bgcolor: "white",
                border: "1px solid #E2E8F0",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#64748B", lineHeight: 1.7 }}
              >
                {t("forecast.rangeDisclaimer")}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================
          VISUAL RISK INDICATOR
          =================================================== */}
      <SectionCard>
        <SectionTitle>{t("forecast.scale.title")}</SectionTitle>

        <Box sx={{ px: { xs: 0.5, sm: 1.5 }, pt: 2, pb: 1 }}>
          <Box sx={{ position: "relative", height: 46 }}>
            {/* Marker + callout */}
            <Box
              role="img"
              aria-label={t("forecast.scale.markerAria", {
                percent: percentDisplay,
              })}
              sx={{
                position: "absolute",
                left: `${markerPercent}%`,
                top: 0,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Chip
                label={`${percentDisplay}%`}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: bucketColor,
                  color: "white",
                  mb: 0.5,
                }}
              />
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderTop: `9px solid ${bucketColor}`,
                }}
              />
            </Box>
          </Box>

          {/* Track */}
          <Box
            sx={{
              position: "relative",
              height: 14,
              borderRadius: 999,
              overflow: "hidden",
              display: "flex",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box sx={{ width: "20%", bgcolor: "#BBF7D0" }} />
            <Box sx={{ width: "40%", bgcolor: "#FDE68A" }} />
            <Box sx={{ width: "40%", bgcolor: "#FECACA" }} />
          </Box>

          {/* Axis labels */}
          <Box
            sx={{
              position: "relative",
              height: 22,
              mt: 0.5,
            }}
          >
            {[
              { value: 0, label: t("forecast.scale.axisStart") },
              { value: 20, label: t("forecast.scale.axis20") },
              { value: 60, label: t("forecast.scale.axis60") },
              { value: 100, label: t("forecast.scale.axisEnd") },
            ].map((tick) => (
              <Typography
                key={tick.value}
                variant="caption"
                sx={{
                  position: "absolute",
                  left: `${tick.value}%`,
                  transform:
                    tick.value === 0
                      ? "translateX(0%)"
                      : tick.value === 100
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                  color: "#64748B",
                  fontWeight: 700,
                }}
              >
                {tick.label}
              </Typography>
            ))}
          </Box>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          sx={{ mt: 1.5, flexWrap: "wrap" }}
        >
          {[
            {
              color: "#16A34A",
              label: t("forecast.scale.lower"),
            },
            {
              color: "#D97706",
              label: t("forecast.scale.moderate"),
            },
            {
              color: "#DC2626",
              label: t("forecast.scale.higher"),
            },
          ].map((legend) => (
            <Stack
              key={legend.label}
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center" }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: legend.color,
                }}
              />
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: "#475569" }}
              >
                {legend.label}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1.5, color: "#94A3B8" }}
        >
          {t("forecast.scale.note")}
        </Typography>
      </SectionCard>

      {/* ===================================================
          RISK OUTLOOK
          =================================================== */}
      <Alert
        severity={
          bucket === "higher"
            ? "error"
            : bucket === "moderate"
              ? "warning"
              : "success"
        }
        sx={{ borderRadius: 3 }}
      >
        <Typography variant="body1" fontWeight={800}>
          {bucket === "higher"
            ? t("forecast.outlook.higherTitle")
            : bucket === "moderate"
              ? t("forecast.outlook.moderateTitle")
              : t("forecast.outlook.lowerTitle")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.75, lineHeight: 1.7 }}
        >
          {bucket === "higher"
            ? t("forecast.outlook.higherBody")
            : bucket === "moderate"
              ? t("forecast.outlook.moderateBody")
              : t("forecast.outlook.lowerBody")}
        </Typography>
      </Alert>

      {/* ===================================================
          FACTORS IDENTIFIED
          =================================================== */}
      {hasAssessmentData && (
        <SectionCard>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", mb: 0.5 }}
          >
            <InsightsIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              {t("forecast.factors.title")}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: "#64748B", lineHeight: 1.7, mb: 2.5 }}
          >
            {t("forecast.factors.desc")}
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                fontWeight={800}
                sx={{ color: "#0F172A", mb: 0.25 }}
              >
                {t("forecast.factors.modifiableTitle")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "#94A3B8",
                  mb: 1.5,
                }}
              >
                {t("forecast.factors.modifiableHelp")}
              </Typography>

              <Stack spacing={1.25}>
                {modifiableFactors.length > 0 ? (
                  modifiableFactors.map((factor) => (
                    <FactorChip
                      key={factor.key}
                      label={factor.label}
                      value={factor.value}
                    />
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#94A3B8" }}
                  >
                    {t("common.notAvailable")}
                  </Typography>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                fontWeight={800}
                sx={{ color: "#0F172A", mb: 0.25 }}
              >
                {t("forecast.factors.nonModifiableTitle")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "#94A3B8",
                  mb: 1.5,
                }}
              >
                {t("forecast.factors.nonModifiableHelp")}
              </Typography>

              <Stack spacing={1.25}>
                {nonModifiableFactors.length > 0 ? (
                  nonModifiableFactors.map((factor) => (
                    <FactorChip
                      key={factor.key}
                      label={factor.label}
                      value={factor.value}
                    />
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#94A3B8" }}
                  >
                    {t("common.notAvailable")}
                  </Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>
      )}

      {/* ===================================================
          RECOMMENDED PRIORITIES
          =================================================== */}
      {hasAssessmentData && (
        <SectionCard>
          <SectionTitle>
            {t("forecast.priorities.title")}
          </SectionTitle>
          <Typography
            variant="body2"
            sx={{ color: "#64748B", lineHeight: 1.7, mb: 2 }}
          >
            {t("forecast.priorities.desc")}
          </Typography>

          {priorities.length > 0 ? (
            <Stack spacing={1.5}>
              {priorities.map((priority) => (
                <PriorityCard
                  key={priority.key}
                  title={priority.title}
                  body={priority.body}
                />
              ))}
            </Stack>
          ) : (
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              {t("forecast.priorities.none")}
            </Alert>
          )}
        </SectionCard>
      )}

      {/* ===================================================
          FUTURE RISK MANAGEMENT
          =================================================== */}
      <SectionCard sx={{ bgcolor: "#F8FAFC" }}>
        <SectionTitle>
          {t("forecast.outlookFuture.title")}
        </SectionTitle>
        <Typography
          variant="body2"
          sx={{ color: "#64748B", lineHeight: 1.75 }}
        >
          {t("forecast.outlookFuture.body")}
        </Typography>
      </SectionCard>

      {/* ===================================================
          WHAT TO EAT
          =================================================== */}
      <SectionCard>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 1.5 }}
        >
          <Typography variant="h6" fontWeight={800}>
            {t("forecast.eat.title")}
          </Typography>
          <EvidenceBadge />
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              fontWeight={800}
              sx={{ color: "#0F172A", mb: 1 }}
            >
              {t("forecast.eat.calciumTitle")}
            </Typography>
            <BulletList
              items={[
                t("forecast.eat.calciumItem1"),
                t("forecast.eat.calciumItem2"),
                t("forecast.eat.calciumItem3"),
                t("forecast.eat.calciumItem4"),
                t("forecast.eat.calciumItem5"),
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              fontWeight={800}
              sx={{ color: "#0F172A", mb: 1 }}
            >
              {t("forecast.eat.proteinTitle")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#334155", lineHeight: 1.7 }}
            >
              {t("forecast.eat.proteinBody")}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              fontWeight={800}
              sx={{ color: "#0F172A", mb: 1 }}
            >
              {t("forecast.eat.vitaminDTitle")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#334155", lineHeight: 1.7 }}
            >
              {t("forecast.eat.vitaminDBody")}
            </Typography>
          </Grid>
        </Grid>
      </SectionCard>

      {/* ===================================================
          WHAT TO LIMIT
          =================================================== */}
      <SectionCard>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ mb: 1.5 }}
        >
          {t("forecast.limit.title")}
        </Typography>

        <BulletList
          items={[
            t("forecast.limit.alcohol"),
            t("forecast.limit.smoking"),
            t("forecast.limit.crashDiets"),
            t("forecast.limit.poorDiet"),
          ]}
        />
      </SectionCard>

      {/* ===================================================
          PHYSICAL ACTIVITY
          =================================================== */}
      <SectionCard>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 1.5 }}
        >
          <Typography variant="h6" fontWeight={800}>
            {t("forecast.exercise.title")}
          </Typography>
          <EvidenceBadge />
        </Stack>

        <BulletList
          items={[
            t("forecast.exercise.walking"),
            t("forecast.exercise.weightBearing"),
            t("forecast.exercise.resistance"),
            t("forecast.exercise.balance"),
          ]}
        />

        {exerciseNeedsCaution && (
          <Alert
            severity="info"
            sx={{ borderRadius: 3, mt: 2 }}
          >
            {t("forecast.exercise.cautionNote")}
          </Alert>
        )}
      </SectionCard>

      {/* ===================================================
          RECOMMENDED NEXT STEPS
          =================================================== */}
      <SectionCard>
        <SectionTitle>
          {t("forecast.nextSteps.title")}
        </SectionTitle>

        <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
          {nextSteps.map((step) => (
            <Typography
              key={step}
              component="li"
              variant="body2"
              sx={{
                color: "#334155",
                mb: 0.85,
                lineHeight: 1.65,
                fontWeight: 600,
              }}
            >
              {step}
            </Typography>
          ))}
        </Box>
      </SectionCard>

      {/* ===================================================
          PROFESSIONAL GUIDANCE (only above the higher-risk
          threshold — never shown as a generic upsell)
          =================================================== */}
      {isHigherRisk && (
        <SectionCard sx={{ borderColor: "#FCA5A5" }}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", mb: 1 }}
          >
            <LocalHospitalIcon sx={{ color: "#DC2626" }} />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: "#0F172A" }}
            >
              {t("forecast.professional.title")}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: "#334155", lineHeight: 1.75 }}
          >
            {t("forecast.professional.body")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1.25,
              color: "#64748B",
              lineHeight: 1.75,
              fontStyle: "italic",
            }}
          >
            {t("forecast.professional.cannotDetermine")}
          </Typography>
        </SectionCard>
      )}

      {/* ===================================================
          SOURCES & EVIDENCE
          =================================================== */}
      <SectionCard sx={{ bgcolor: "#F8FAFC" }}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center", mb: 1.5 }}
        >
          <MenuBookIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            {t("forecast.sources.title")}
          </Typography>
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography fontWeight={800} sx={{ color: "#0F172A" }}>
            {t("forecast.sources.iofName")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: "#64748B", lineHeight: 1.7 }}
          >
            {t("forecast.sources.iofDesc")}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, color: "#94A3B8" }}
          >
            osteoporosis.foundation
          </Typography>
        </Box>
      </SectionCard>

      {/* ===================================================
          MEDICAL DISCLAIMER
          =================================================== */}
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        <Typography variant="body2" fontWeight={800}>
          {t("forecast.disclaimerTitle")}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {t("forecast.disclaimerBody")}
        </Typography>
      </Alert>

      <Divider />

      {/* ===================================================
          ACTIONS
          =================================================== */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "center" }}
      >
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {t("forecast.backToResult")}
          </Button>
        )}

        {onRetake && (
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
            {t("assessment.result.retakeAssessment")}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default RiskForecastRecommendations;
