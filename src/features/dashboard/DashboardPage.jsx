import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  Paper,
  Stack,
  Grid,
} from "@mui/material";

/*
|--------------------------------------------------------------------------
| Custom SVG Icons
|--------------------------------------------------------------------------
*/

const IconBase = ({
  children,
  size = 22,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const MenuSvg = ({ open = false }) => (
  <IconBase size={22}>
    {open ? (
      <>
        <path
          d="M6 6L18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <path
          d="M4 7H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 12H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 17H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    )}
  </IconBase>
);

const DashboardSvg = () => (
  <IconBase>
    <rect
      x="4"
      y="4"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <rect
      x="14"
      y="4"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <rect
      x="4"
      y="14"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <rect
      x="14"
      y="14"
      width="6"
      height="6"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
  </IconBase>
);

const AssessmentSvg = () => (
  <IconBase>
    <rect
      x="5"
      y="4"
      width="14"
      height="17"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M9 4.5V3.5C9 2.67 9.67 2 10.5 2H13.5C14.33 2 15 2.67 15 3.5V4.5"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M9 10H15"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M9 14H15"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M9 18H12"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

const HistorySvg = () => (
  <IconBase>
    <path
      d="M4 12A8 8 0 1 0 7 6.35"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M4 5V10H9"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V12L15 14"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

const AIIcon = () => (
  <IconBase>
    <path
      d="M8 9.5C8 7.57 9.57 6 11.5 6H12.5C14.43 6 16 7.57 16 9.5V14.5C16 16.43 14.43 18 12.5 18H11.5C9.57 18 8 16.43 8 14.5V9.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M6 11V14"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M18 11V14"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M10 22V18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14 22V18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M10 2V6"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14 2V6"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle
      cx="10.5"
      cy="12"
      r="0.8"
      fill="currentColor"
    />
    <circle
      cx="13.5"
      cy="12"
      r="0.8"
      fill="currentColor"
    />
  </IconBase>
);

const KnowledgeSvg = () => (
  <IconBase>
    <path
      d="M5 5.5C5 4.67 5.67 4 6.5 4H11V19H6.5C5.67 19 5 19.67 5 20.5V5.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M19 5.5C19 4.67 18.33 4 17.5 4H13V19H17.5C18.33 19 19 19.67 19 20.5V5.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M8 8H10"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14 8H16"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

const SettingsSvg = () => (
  <IconBase>
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.77 16.86L17.86 18.77L17.82 18.73A1.65 1.65 0 0 0 16 19.4A1.65 1.65 0 0 0 15 20.73V20.8H9V20.73A1.65 1.65 0 0 0 8 19.4A1.65 1.65 0 0 0 6.18 19.73L6.14 19.77L4.23 17.86L4.27 17.82A1.65 1.65 0 0 0 4.6 16A1.65 1.65 0 0 0 3.27 15H3.2V9H3.27A1.65 1.65 0 0 0 4.6 8A1.65 1.65 0 0 0 4.27 6.18L4.23 6.14L6.14 4.23L6.18 4.27A1.65 1.65 0 0 0 8 4.6A1.65 1.65 0 0 0 9 3.27V3.2H15V3.27A1.65 1.65 0 0 0 16 4.6A1.65 1.65 0 0 0 17.82 4.27L17.86 4.23L19.77 6.14L19.73 6.18A1.65 1.65 0 0 0 19.4 8A1.65 1.65 0 0 0 20.73 9H20.8V15H20.73A1.65 1.65 0 0 0 19.4 15Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
  </IconBase>
);

const LogoutSvg = () => (
  <IconBase>
    <path
      d="M10 5H6.5C5.67 5 5 5.67 5 6.5V17.5C5 18.33 5.67 19 6.5 19H10"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 8L18 12L14 16"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12H18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </IconBase>
);

const ShieldSvg = () => (
  <IconBase size={26}>
    <path
      d="M12 3L19 6V11.5C19 16.2 16 19.3 12 21C8 19.3 5 16.2 5 11.5V6L12 3Z"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

const ArrowSvg = () => (
  <IconBase size={18}>
    <path
      d="M5 12H18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M13 6L19 12L13 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

const ChevronSvg = () => (
  <IconBase size={18}>
    <path
      d="M9 6L15 12L9 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

function DashboardPage() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [latestAssessment, setLatestAssessment] =
    useState(null);

  const [assessmentHistory, setAssessmentHistory] =
    useState([]);

  useEffect(() => {
    const readDashboardData = () => {
      try {
        const storedLatest =
          localStorage.getItem(
            "osteoai_latest_assessment"
          );

        if (storedLatest) {
          const parsedLatest =
            JSON.parse(storedLatest);

          setLatestAssessment(
            parsedLatest?.assessmentData &&
            parsedLatest?.predictionResult
              ? parsedLatest
              : null
          );
        } else {
          setLatestAssessment(null);
        }

        const storedHistory =
          localStorage.getItem(
            "osteoai_assessment_history"
          );

        if (storedHistory) {
          const parsedHistory =
            JSON.parse(storedHistory);

          setAssessmentHistory(
            Array.isArray(parsedHistory)
              ? parsedHistory.filter(
                  (item) =>
                    item?.assessmentData &&
                    item?.predictionResult
                )
              : []
          );
        } else {
          setAssessmentHistory([]);
        }
      } catch (error) {
        console.warn(
          "Unable to read OsteoAI dashboard data:",
          error
        );
        setLatestAssessment(null);
        setAssessmentHistory([]);
      }
    };

    readDashboardData();

    window.addEventListener(
      "osteoai:assessment-updated",
      readDashboardData
    );
    window.addEventListener("storage", readDashboardData);

    return () => {
      window.removeEventListener(
        "osteoai:assessment-updated",
        readDashboardData
      );

      window.removeEventListener(
        "storage",
        readDashboardData
      );
    };
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardSvg />,
      path: "/dashboard",
      active: true,
    },
    {
      label: "New Assessment",
      icon: <AssessmentSvg />,
      path: "/assessment",
      active: false,
    },
    {
      label: "Assessment History",
      icon: <HistorySvg />,
      path: "#",
      disabled: true,
    },
    {
      label: "AI Assistant",
      icon: <AIIcon />,
      path: "#",
      disabled: true,
    },
    {
      label: "Knowledge & Support",
      icon: <KnowledgeSvg />,
      path: "#",
      disabled: true,
    },
  ];

  const handleNavigation = (path) => {
    if (path !== "#") {
      navigate(path);
    }
  };

  const assessmentData =
    latestAssessment?.assessmentData || {};
  const personal =
    assessmentData.personal || {};
  const lifestyle =
    assessmentData.lifestyle || {};
  const medicalHistory =
    assessmentData.medicalHistory || {};
  const predictionResult =
    latestAssessment?.predictionResult || {};

  const hasAssessment =
    Boolean(latestAssessment);

  const probability = Number(
    predictionResult.osteoporosis_probability
  );

  const riskPercent =
    Number.isFinite(probability)
      ? `${(probability * 100).toFixed(1)}%`
      : "—";

  const riskLevel =
    predictionResult.risk_level ||
    "Unavailable";

  const calculateBMI = () => {
    const height =
      Number(personal.height) / 100;
    const weight =
      Number(personal.weight);

    if (
      !Number.isFinite(height) ||
      height <= 0 ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return null;
    }

    return weight / (height * height);
  };

  const bmi = calculateBMI();

  const bmiValue =
    Number.isFinite(bmi)
      ? bmi.toFixed(1)
      : "—";

  const bmiCategory =
    !Number.isFinite(bmi)
      ? "Not available"
      : bmi < 18.5
        ? "Underweight"
        : bmi < 25
          ? "Healthy Weight"
          : bmi < 30
            ? "Overweight"
            : "Obese";

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const activitySummary =
    !hasAssessment
      ? "—"
      : [
          lifestyle.vigorousRecreation,
          lifestyle.moderateRecreation,
          lifestyle.vigorousWorkActivity,
          lifestyle.moderateWorkActivity,
          lifestyle.walkOrBicycle,
        ].some(
          (value) =>
            String(value).toLowerCase() === "yes" ||
            String(value).toLowerCase() === "1"
        )
        ? "Active"
        : "Recorded";

  const medicalSummary =
    !hasAssessment
      ? "—"
      : [
          medicalHistory.otherBoneFractureAfter20,
          medicalHistory.longTermSteroidUse,
          medicalHistory.parentOsteoporosisHistory,
          medicalHistory.motherHipFracture,
          medicalHistory.fatherHipFracture,
        ].some(
          (value) =>
            String(value).toLowerCase() === "yes" ||
            String(value).toLowerCase() === "1"
        )
        ? "Factors present"
        : "No reported factors";

  const displayValue = (
    value,
    fallback = "Not provided"
  ) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return fallback;
    }

    const normalized = String(value)
      .trim()
      .toLowerCase();

    const simpleMap = {
      yes: "Yes",
      no: "No",
      true: "Yes",
      false: "No",
      "1": "Yes",
      "0": "No",
    };

    return simpleMap[normalized] || String(value);
  };

  const displayChoice = (
    value,
    options,
    fallback = "Not provided"
  ) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return fallback;
    }

    const key = String(value).trim();

    if (options[key]) {
      return options[key];
    }

    return displayValue(value, fallback);
  };

  const genderLabel = displayChoice(
    personal.gender,
    {
      "1": "Female",
      "2": "Male",
      female: "Female",
      male: "Male",
    }
  );

  const raceLabel = displayChoice(
    personal.raceEthnicity,
    {
      "1": "Mexican American",
      "2": "Other Hispanic",
      "3": "White",
      "4": "Black",
      "6": "Asian",
    }
  );

  const alcoholFrequencyLabel = displayChoice(
    lifestyle.alcoholFrequency,
    {
      "0": "Never",
      "1": "Less than once a week",
      "2": "Once a week",
      "3": "2–3 days a week",
      "4": "4–6 days a week",
      "5": "Daily or almost daily",
    }
  );

  const activityLabel = displayChoice(
    lifestyle.walkOrBicycle,
    {
      yes: "Yes",
      no: "No",
      "1": "Yes",
      "0": "No",
    }
  );

  const sedentaryHours = Number(
    lifestyle.sedentaryMinutes
  );

  const sedentaryDisplay =
    Number.isFinite(sedentaryHours)
      ? `${(
          sedentaryHours / 60
        ).toFixed(1)} hrs/day`
      : "Not provided";



  const chartHistory = [...assessmentHistory]
    .reverse()
    .map((item, index) => {
      const probability = Number(
        item?.predictionResult
          ?.osteoporosis_probability
      );

      return {
        index,
        assessmentNumber:
          index + 1,
        probability: Number.isFinite(probability)
          ? probability * 100
          : null,
        date: formatDate(item?.savedAt),
        riskLevel:
          item?.predictionResult?.risk_level ||
          "Unavailable",
      };
    })
    .filter((item) =>
      Number.isFinite(item.probability)
    );

  const trendMin = 0;
  const trendMax = 100;

  const trendPlotLeft = 8;
  const trendPlotRight = 98;
  const trendPlotTop = 8;
  const trendPlotBottom = 86;

  const trendPoints = chartHistory.map(
    (item, index) => {
      const x =
        chartHistory.length === 1
          ? (trendPlotLeft + trendPlotRight) / 2
          : trendPlotLeft +
            (index /
              (chartHistory.length - 1)) *
              (trendPlotRight -
                trendPlotLeft);

      const y =
        trendPlotBottom -
        ((item.probability - trendMin) /
          (trendMax - trendMin)) *
          (trendPlotBottom -
            trendPlotTop);

      return {
        ...item,
        x,
        y,
      };
    }
  );

  const trendPolyline = trendPoints
    .map(
      (point) =>
        `${point.x},${point.y}`
    )
    .join(" ");

  const trendAreaPolygon = [
    `${trendPlotLeft},${trendPlotBottom}`,
    ...trendPoints.map(
      (point) =>
        `${point.x},${point.y}`
    ),
    `${trendPlotRight},${trendPlotBottom}`,
  ].join(" ");

  const trendLabelCount = Math.min(
    6,
    chartHistory.length
  );

  const trendLabelIndexes =
    trendLabelCount <= 1
      ? [0]
      : Array.from(
          { length: trendLabelCount },
          (_, index) =>
            Math.round(
              (index /
                (trendLabelCount - 1)) *
                (chartHistory.length - 1)
            )
        );

  const uniqueTrendLabelIndexes = [
    ...new Set(trendLabelIndexes),
  ];

  const getFriendlyShapInput = (item) => {
    const rawFeature = String(
      item?.feature ||
      item?.label ||
      ""
    );

    const feature = rawFeature
      .toLowerCase()
      .replace(/[\s\-\/]+/g, "_")
      .replace(/__+/g, "_");

    const sourceValueMap = {
      age: personal.age,
      gender:
        personal.gender ||
        personal.sex,
      race_ethnicity:
        personal.raceEthnicity,
      bmi:
        Number.isFinite(bmi)
          ? bmi.toFixed(1)
          : null,
      weight:
        personal.weight,
      weight_kg:
        personal.weight,
      height:
        personal.height,
      height_cm:
        personal.height,
      waist:
        personal.waist,
      waist_cm:
        personal.waist,
      hip:
        personal.hip,
      hip_cm:
        personal.hip,
      other_bone_fracture_after_20:
        medicalHistory.otherBoneFractureAfter20,
      long_term_steroid_use:
        medicalHistory.longTermSteroidUse,
      parent_osteoporosis_history:
        medicalHistory.parentOsteoporosisHistory,
      mother_hip_fracture:
        medicalHistory.motherHipFracture,
      father_hip_fracture:
        medicalHistory.fatherHipFracture,
      smoked_100_cigarettes:
        lifestyle.smoked100Cigarettes,
      alcohol_frequency:
        lifestyle.alcoholFrequency,
      alcohol_drinks_per_day:
        lifestyle.alcoholDrinksPerDay,
      vigorous_work_activity:
        lifestyle.vigorousWorkActivity,
      moderate_work_activity:
        lifestyle.moderateWorkActivity,
      walk_or_bicycle:
        lifestyle.walkOrBicycle,
      vigorous_recreation:
        lifestyle.vigorousRecreation,
      moderate_recreation:
        lifestyle.moderateRecreation,
      sedentary_minutes:
        lifestyle.sedentaryMinutes,
    };

    const sourceValue =
      sourceValueMap[feature];

    if (
      sourceValue === null ||
      sourceValue === undefined ||
      String(sourceValue).trim() === ""
    ) {
      return item?.value !== null &&
        item?.value !== undefined
        ? String(item.value)
        : "Not provided";
    }

    if (feature === "race_ethnicity") {
      return raceLabel;
    }

    if (feature === "gender") {
      return displayValue(
        sourceValue
      );
    }

    if (
      feature.includes("fracture") ||
      feature.includes("steroid") ||
      feature.includes("osteoporosis_history") ||
      feature === "smoked_100_cigarettes" ||
      feature.includes("work_activity") ||
      feature.includes("recreation") ||
      feature === "walk_or_bicycle"
    ) {
      return displayValue(
        sourceValue
      );
    }

    if (feature === "alcohol_frequency") {
      const readable =
        displayChoice(
          sourceValue,
          {
            never: "Never",
            occasionally: "Occasionally",
            frequently: "Frequently",
          },
          null
        );

      return readable ||
        String(sourceValue);
    }

    return String(sourceValue);
  };

  const shapExplanations = Array.isArray(
    predictionResult.shap_explanations
  )
    ? predictionResult.shap_explanations
    : [];

  const shapChartData = [...shapExplanations]
    .map((item) => {
      const shapValue = Number(item?.shap_value);

      if (!Number.isFinite(shapValue)) {
        return null;
      }

      return {
        feature:
          item?.label ||
          item?.feature ||
          "Unknown factor",
        value: shapValue,
        inputValue:
          getFriendlyShapInput(item),
        increases:
          item?.direction ===
            "increases_model_output" ||
          shapValue > 0,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        Math.abs(b.value) - Math.abs(a.value)
    )
    .slice(0, 6);

  const maxShapMagnitude =
    shapChartData.length > 0
      ? Math.max(
          ...shapChartData.map((item) =>
            Math.abs(item.value)
          )
        )
      : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#F8FAFC",
      }}
    >
      {/* =========================================================
          SIDEBAR
          ========================================================= */}
      <Box
        sx={{
          width: sidebarOpen ? 292 : 72,

          minHeight: "100vh",

          bgcolor:
            "rgba(255,255,255,0.98)",

          borderRight:
            "1px solid rgba(226,232,240,0.9)",

          display: "flex",
          flexDirection: "column",

          transition:
            "width 0.28s cubic-bezier(0.4,0,0.2,1)",

          overflow: "hidden",

          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,

          zIndex: 1200,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            minHeight: 72,

            display: "flex",
            alignItems: "center",

            justifyContent:
              sidebarOpen
                ? "space-between"
                : "center",

            px: sidebarOpen
              ? 1.5
              : 0.5,
          }}
        >
          {sidebarOpen && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.15,
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

                  bgcolor: "#2563EB",

                  color: "white",

                  boxShadow:
                    "0 6px 16px rgba(37,99,235,0.18)",
                }}
              >
                <ShieldSvg />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.05,
                    color: "#0F172A",
                  }}
                >
                  OsteoAI
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  Bone Health
                </Typography>
              </Box>
            </Box>
          )}

          <Tooltip
            title={
              sidebarOpen
                ? "Collapse menu"
                : "Open menu"
            }
            placement="right"
          >
            <IconButton
              onClick={() =>
                setSidebarOpen(
                  (previous) =>
                    !previous
                )
              }
              sx={{
                width: 42,
                height: 42,

                color: "#2563EB",

                bgcolor:
                  sidebarOpen
                    ? "rgba(37,99,235,0.06)"
                    : "transparent",

                borderRadius: 2.5,

                "&:hover": {
                  bgcolor:
                    "rgba(37,99,235,0.09)",
                },
              }}
            >
              <MenuSvg
                open={sidebarOpen}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* PROFILE */}
        <Box
          onClick={() =>
            navigate("/dashboard")
          }
          sx={{
            minHeight: 82,

            display: "flex",
            alignItems: "center",

            justifyContent:
              sidebarOpen
                ? "flex-start"
                : "center",

            gap: 1.25,

            px: sidebarOpen
              ? 1.5
              : 0.5,

            py: 1.1,

            cursor: "pointer",

            "&:hover": {
              bgcolor:
                "rgba(37,99,235,0.05)",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,

                background:
                  "linear-gradient(135deg, #0B3B82 0%, #2563EB 55%, #38BDF8 100%)",

                border:
                  "2px solid rgba(255,255,255,0.96)",

                boxShadow:
                  "0 7px 18px rgba(37,99,235,0.24)",

                fontSize: "0.7rem",

                fontWeight: 800,
              }}
            >
              OA
            </Avatar>

            <Box
              sx={{
                position: "absolute",
                right: 0,
                bottom: 1,

                width: 10,
                height: 10,

                borderRadius: "50%",

                bgcolor: "#22C55E",

                border:
                  "2px solid white",
              }}
            />
          </Box>

          {sidebarOpen && (
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                }}
              >
                User Profile
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748B",
                }}
              >
                Active account
              </Typography>
            </Box>
          )}

          {sidebarOpen && (
            <Box
              sx={{
                color: "#94A3B8",
                display: "flex",
              }}
            >
              <ChevronSvg />
            </Box>
          )}
        </Box>

        <Divider />

        {/* NAVIGATION */}
        <List
          sx={{
            px: 0.75,
            py: 1.5,
          }}
        >
          {menuItems.map((item) => (
            <Tooltip
              key={item.label}
              title={
                sidebarOpen
                  ? ""
                  : item.label
              }
              placement="right"
            >
              <span>
                <ListItemButton
                  disabled={
                    item.disabled
                  }
                  onClick={() =>
                    handleNavigation(
                      item.path
                    )
                  }
                  selected={
                    item.active
                  }
                  sx={{
                    minHeight: 52,

                    px: sidebarOpen
                      ? 1.5
                      : 0,

                    mb: 0.65,

                    borderRadius: 2.5,

                    justifyContent:
                      sidebarOpen
                        ? "flex-start"
                        : "center",

                    color:
                      item.disabled
                        ? "#94A3B8"
                        : item.active
                          ? "#1D4ED8"
                          : "#334155",

                    bgcolor:
                      item.active
                        ? "rgba(37,99,235,0.10)"
                        : "transparent",

                    border:
                      item.active
                        ? "1px solid rgba(37,99,235,0.15)"
                        : "1px solid transparent",

                    "&:hover": {
                      bgcolor:
                        "rgba(37,99,235,0.08)",

                      color:
                        item.disabled
                          ? "#94A3B8"
                          : "#2563EB",
                    },

                    "&.Mui-disabled": {
                      opacity: 0.48,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth:
                        sidebarOpen
                          ? 42
                          : 0,

                      width:
                        sidebarOpen
                          ? 32
                          : 38,

                      height:
                        sidebarOpen
                          ? 32
                          : 38,

                      borderRadius: 2,

                      display: "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      color: "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {sidebarOpen && (
                    <ListItemText
                      primary={
                        item.label
                      }
                      primaryTypographyProps={{
                        fontWeight:
                          item.active
                            ? 700
                            : 600,

                        fontSize:
                          "0.91rem",

                        whiteSpace:
                          "nowrap",
                      }}
                    />
                  )}
                </ListItemButton>
              </span>
            </Tooltip>
          ))}
        </List>

        {/* BOTTOM MENU */}
        <Box
          sx={{
            mt: "auto",
            px: 0.75,
            pb: 1.25,
          }}
        >
          <Divider sx={{ mb: 1 }} />

          <ListItemButton
            disabled
            sx={{
              minHeight: 52,

              px: sidebarOpen
                ? 1.5
                : 0,

              mb: 0.4,

              borderRadius: 2,

              justifyContent:
                sidebarOpen
                  ? "flex-start"
                  : "center",

              color: "#64748B",

              "&.Mui-disabled": {
                opacity: 0.48,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth:
                  sidebarOpen
                    ? 42
                    : 0,

                justifyContent:
                  "center",

                color:
                  "inherit",
              }}
            >
              <SettingsSvg />
            </ListItemIcon>

            {sidebarOpen && (
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize:
                    "0.91rem",
                }}
              />
            )}
          </ListItemButton>

          <ListItemButton
            disabled
            sx={{
              minHeight: 52,

              px: sidebarOpen
                ? 1.5
                : 0,

              borderRadius: 2,

              justifyContent:
                sidebarOpen
                  ? "flex-start"
                  : "center",

              color: "#EF4444",

              "&.Mui-disabled": {
                opacity: 0.48,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth:
                  sidebarOpen
                    ? 42
                    : 0,

                justifyContent:
                  "center",

                color:
                  "inherit",
              }}
            >
              <LogoutSvg />
            </ListItemIcon>

            {sidebarOpen && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize:
                    "0.91rem",
                  color: "#EF4444",
                }}
              />
            )}
          </ListItemButton>
        </Box>
      </Box>

      {/* =========================================================
          MAIN DASHBOARD
          ========================================================= */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: sidebarOpen ? "292px" : "72px",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
          p: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
          },
        }}
      >
        <Box sx={{ maxWidth: 1320, mx: "auto" }}>
          {/* =====================================================
              PAGE HEADER
              ===================================================== */}
          <Box
            sx={{
              mb: 3.5,
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              alignItems: {
                xs: "flex-start",
                md: "flex-end",
              },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "#2563EB",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              >
                PERSONAL HEALTH DASHBOARD
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.45,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#0F172A",
                  fontSize: {
                    xs: "1.9rem",
                    sm: "2.25rem",
                    md: "2.65rem",
                  },
                }}
              >
                Your bone-health overview
              </Typography>

              <Typography
                sx={{
                  mt: 0.85,
                  color: "#64748B",
                  maxWidth: 720,
                  lineHeight: 1.7,
                }}
              >
                Track your latest OsteoAI assessment, understand contributing
                factors, and build a clearer picture of your health data over time.
              </Typography>
            </Box>

            <Button
              variant="contained"
              endIcon={<ArrowSvg />}
              onClick={() => navigate("/assessment")}
              sx={{
                flexShrink: 0,
                px: 2.5,
                py: 1.25,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 9px 22px rgba(37,99,235,0.18)",
              }}
            >
              New Assessment
            </Button>
          </Box>

          {/* =====================================================
              CURRENT ASSESSMENT HERO
              ===================================================== */}
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              mb: 3,
              p: {
                xs: 2.5,
                sm: 3.5,
                md: 4,
              },
              borderRadius: 5,
              border: "1px solid #DBEAFE",
              background:
                "linear-gradient(135deg, #EEF5FF 0%, #F8FBFF 58%, #FFFFFF 100%)",
              boxShadow: "0 18px 44px rgba(37,99,235,0.06)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -80,
                top: -110,
                width: 280,
                height: 280,
                borderRadius: "50%",
                bgcolor: "rgba(37,99,235,0.06)",
              }}
            />

            <Box
              sx={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0,1fr) auto",
                },
                gap: 3,
                alignItems: "center",
              }}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#2563EB",
                      color: "white",
                      boxShadow: "0 8px 18px rgba(37,99,235,0.18)",
                    }}
                  >
                    <ShieldSvg />
                  </Box>

                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      Latest Assessment
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", mt: 0.2 }}
                    >
                      Your most recent model-based assessment
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 3,
                    p: 2.25,
                    borderRadius: 3.5,
                    border: "1px dashed #BFDBFE",
                    bgcolor: "rgba(255,255,255,0.72)",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: hasAssessment
                        ? "#0F172A"
                        : "#1E3A8A",
                    }}
                  >
                    {hasAssessment
                      ? `Estimated risk: ${riskPercent}`
                      : "No completed assessment yet"}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.7,
                      color: "#64748B",
                      lineHeight: 1.65,
                      maxWidth: 680,
                    }}
                  >
                    {hasAssessment
                      ? `Risk category: ${riskLevel}. Your detailed health metrics and model explanations are available as your dashboard workspace expands.`
                      : "Complete an assessment to populate your risk score, health metrics, SHAP explanations, history, and trend visualizations on this dashboard."}
                  </Typography>

                  {hasAssessment && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "#94A3B8",
                      }}
                    >
                      Assessment date: {formatDate(latestAssessment.savedAt)}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  minWidth: {
                    xs: "100%",
                    md: 230,
                  },
                  p: 2.5,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(191,219,254,0.9)",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  CURRENT RISK
                </Typography>

                <Typography
                  sx={{
                    mt: 0.6,
                    fontSize: {
                      xs: "2.6rem",
                      md: "3.2rem",
                    },
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    color: "#94A3B8",
                  }}
                >
                  {hasAssessment ? riskPercent : "—"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.9,
                    color: hasAssessment
                      ? "#334155"
                      : "#64748B",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {hasAssessment
                    ? `${riskLevel} risk`
                    : "Awaiting assessment"}
                </Typography>

                {hasAssessment && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.55,
                      color: "#64748B",
                    }}
                  >
                    Last assessed {formatDate(latestAssessment.savedAt)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          {/* =====================================================
              HEALTH SNAPSHOT
              ===================================================== */}
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Health Snapshot
          </Typography>

          <Grid container spacing={2.2} sx={{ mb: 3.5 }}>
            {[
              {
                title: "BMI",
                value: bmiValue,
                note: bmiCategory,
                icon: <ShieldSvg />,
              },
              {
                title: "Age",
                value: hasAssessment
                  ? `${displayValue(personal.age)} yrs`
                  : "—",
                note: "Personal profile",
                icon: <DashboardSvg />,
              },
              {
                title: "Height",
                value: hasAssessment
                  ? `${displayValue(personal.height)} cm`
                  : "—",
                note: "Body measurement",
                icon: <AssessmentSvg />,
              },
              {
                title: "Weight",
                value: hasAssessment
                  ? `${displayValue(personal.weight)} kg`
                  : "—",
                note: "Body measurement",
                icon: <HistorySvg />,
              },
            ].map((metric) => (
              <Grid
                key={metric.title}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 2.5,
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                    bgcolor: "white",
                    boxShadow:
                      "0 10px 26px rgba(15,23,42,0.035)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.4}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2.6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#EEF4FF",
                        color: "#2563EB",
                        flexShrink: 0,
                      }}
                    >
                      {metric.icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        {metric.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.2,
                          fontWeight: 900,
                          fontSize: "1.35rem",
                          color: "#0F172A",
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1.7,
                      color: "#94A3B8",
                    }}
                  >
                    {metric.note}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.2} sx={{ mb: 3.5 }}>
            {/* PERSONAL DETAILS */}
            <Grid
              size={{
                xs: 12,
                lg: 5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: {
                    xs: 2.5,
                    md: 3,
                  },
                  borderRadius: 4.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "white",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Body & Personal Details
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.4,
                    color: "#64748B",
                  }}
                >
                  Values captured from your latest assessment.
                </Typography>

                <Grid
                  container
                  spacing={1.5}
                  sx={{ mt: 1.2 }}
                >
                  {[
                    ["Gender", genderLabel],
                    ["Race / Ethnicity", raceLabel],
                    [
                      "Waist",
                      hasAssessment
                        ? `${displayValue(personal.waist)} cm`
                        : "Not provided",
                    ],
                    [
                      "Hip",
                      hasAssessment
                        ? `${displayValue(personal.hip)} cm`
                        : "Not provided",
                    ],
                  ].map(([label, value]) => (
                    <Grid
                      key={label}
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.7,
                          borderRadius: 3,
                          bgcolor: "#F8FAFC",
                          border: "1px solid #EDF2F7",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "#94A3B8",
                            fontWeight: 700,
                          }}
                        >
                          {label}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.45,
                            color: "#334155",
                            fontWeight: 800,
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* LIFESTYLE DETAILS */}
            <Grid
              size={{
                xs: 12,
                lg: 7,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: {
                    xs: 2.5,
                    md: 3,
                  },
                  borderRadius: 4.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "white",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Lifestyle Profile
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.4,
                    color: "#64748B",
                  }}
                >
                  Lifestyle information used in the latest assessment.
                </Typography>

                <Grid
                  container
                  spacing={1.5}
                  sx={{ mt: 1.2 }}
                >
                  {[
                    [
                      "Smoking history",
                      displayValue(
                        lifestyle.smoked100Cigarettes
                      ),
                    ],
                    [
                      "Alcohol use",
                      displayValue(
                        lifestyle.alcoholEver
                      ),
                    ],
                    [
                      "Alcohol frequency",
                      alcoholFrequencyLabel,
                    ],
                    [
                      "Walk / bicycle",
                      activityLabel,
                    ],
                    [
                      "Vigorous work activity",
                      displayValue(
                        lifestyle.vigorousWorkActivity
                      ),
                    ],
                    [
                      "Moderate work activity",
                      displayValue(
                        lifestyle.moderateWorkActivity
                      ),
                    ],
                    [
                      "Vigorous recreation",
                      displayValue(
                        lifestyle.vigorousRecreation
                      ),
                    ],
                    [
                      "Moderate recreation",
                      displayValue(
                        lifestyle.moderateRecreation
                      ),
                    ],
                    [
                      "Sedentary time",
                      sedentaryDisplay,
                    ],
                  ].map(([label, value]) => (
                    <Grid
                      key={label}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.7,
                          minHeight: 72,
                          borderRadius: 3,
                          bgcolor: "#F8FAFC",
                          border: "1px solid #EDF2F7",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "#94A3B8",
                            fontWeight: 700,
                            lineHeight: 1.35,
                          }}
                        >
                          {label}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.55,
                            color: "#334155",
                            fontWeight: 800,
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              mb: 3.5,
              p: {
                xs: 2.5,
                md: 3,
              },
              borderRadius: 4.5,
              border: "1px solid #E2E8F0",
              bgcolor: "white",
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              Medical & Family History
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.4,
                color: "#64748B",
              }}
            >
              Risk-history information from your latest assessment.
            </Typography>

            <Grid
              container
              spacing={1.5}
              sx={{ mt: 1.2 }}
            >
              {[
                [
                  "Bone fracture after age 20",
                  displayValue(
                    medicalHistory.otherBoneFractureAfter20
                  ),
                ],
                [
                  "Long-term steroid use",
                  displayValue(
                    medicalHistory.longTermSteroidUse
                  ),
                ],
                [
                  "Parent osteoporosis history",
                  displayValue(
                    medicalHistory.parentOsteoporosisHistory
                  ),
                ],
                [
                  "Mother hip fracture",
                  displayValue(
                    medicalHistory.motherHipFracture
                  ),
                ],
                [
                  "Father hip fracture",
                  displayValue(
                    medicalHistory.fatherHipFracture
                  ),
                ],
              ].map(([label, value]) => (
                <Grid
                  key={label}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      bgcolor: "#F8FAFC",
                      border: "1px solid #EDF2F7",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "#94A3B8",
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.55,
                        color: "#334155",
                        fontWeight: 800,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
          {/* =====================================================
              ANALYTICS
              ===================================================== */}
          <Box
            sx={{
              display: "flex",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              justifyContent: "space-between",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              gap: 1,
              mb: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#0F172A",
                }}
              >
                Risk Analytics
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.3,
                  color: "#64748B",
                }}
              >
                Your deeper analytics workspace will grow as assessment data is collected.
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                fontWeight: 700,
              }}
            >
              PERSONAL DATA • MODEL EXPLANATION
            </Typography>
          </Box>

          <Grid container spacing={2.2} sx={{ mb: 3.5 }}>
            {/* TREND */}
            <Grid
              size={{
                xs: 12,
                lg: 7,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: {
                    xs: 2.5,
                    md: 3,
                  },
                  borderRadius: 4.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "white",
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      Risk Trend
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.45,
                        color: "#64748B",
                      }}
                    >
                      See how your estimated risk changes across saved assessments.
                    </Typography>
                  </Box>

                  {assessmentHistory.length > 0 && (
                    <Box
                      sx={{
                        px: 1.2,
                        py: 0.55,
                        borderRadius: 999,
                        bgcolor: "#F1F5F9",
                        color: "#475569",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {assessmentHistory.length}{" "}
                      {assessmentHistory.length === 1
                        ? "saved"
                        : "saved"}
                    </Box>
                  )}
                </Stack>

                {chartHistory.length > 0 ? (
                  <Box sx={{ mt: 2.4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "stretch",
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          py: 0.4,
                        }}
                      >
                        {[100, 75, 50, 25, 0].map(
                          (value) => (
                            <Typography
                              key={value}
                              variant="caption"
                              sx={{
                                color: "#94A3B8",
                                fontSize:
                                  "0.68rem",
                                lineHeight: 1,
                                textAlign: "right",
                              }}
                            >
                              {value}%
                            </Typography>
                          )
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          component="svg"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          role="img"
                          aria-label="Estimated osteoporosis risk trend across saved assessments"
                          sx={{
                            width: "100%",
                            height: 230,
                            display: "block",
                          }}
                        >
                          {[8, 27.5, 47, 66.5, 86].map(
                            (y, index) => (
                              <line
                                key={y}
                                x1={trendPlotLeft}
                                x2={trendPlotRight}
                                y1={y}
                                y2={y}
                                stroke="#E2E8F0"
                                strokeWidth="0.35"
                                strokeDasharray={
                                  index === 0 ||
                                  index === 4
                                    ? "0"
                                    : "1.2 1.2"
                                }
                              />
                            )
                          )}

                          <polygon
                            points={trendAreaPolygon}
                            fill="#2563EB"
                            opacity="0.055"
                          />

                          {chartHistory.length > 1 && (
                            <polyline
                              points={trendPolyline}
                              fill="none"
                              stroke="#2563EB"
                              strokeWidth="1.7"
                              vectorEffect="non-scaling-stroke"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {trendPoints.map(
                            (point) => (
                              <circle
                                key={`${point.index}-${point.date}`}
                                cx={point.x}
                                cy={point.y}
                                r="2.1"
                                fill="#FFFFFF"
                                stroke="#2563EB"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                              >
                                <title>
                                  {`Assessment ${point.assessmentNumber} • ${point.date} • ${point.probability.toFixed(1)}% • ${point.riskLevel}`}
                                </title>
                              </circle>
                            )
                          )}
                        </Box>

                        <Box
                          sx={{
                            position: "relative",
                            height: 28,
                            mt: 0.4,
                          }}
                        >
                          {uniqueTrendLabelIndexes.map(
                            (index) => {
                              const point =
                                trendPoints[index];

                              return (
                                <Typography
                                  key={index}
                                  variant="caption"
                                  sx={{
                                    position: "absolute",
                                    left: `${point.x}%`,
                                    transform:
                                      "translateX(-50%)",
                                    color: "#94A3B8",
                                    fontSize:
                                      "0.67rem",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  A{point.assessmentNumber}
                                </Typography>
                              );
                            }
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Stack
                      direction="row"
                      sx={{
                        mt: 0.4,
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#94A3B8",
                        }}
                      >
                        {chartHistory[0].date}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.1,
                          py: 0.45,
                          borderRadius: 999,
                          bgcolor: "#EEF4FF",
                          color: "#2563EB",
                          fontWeight: 800,
                        }}
                      >
                        Latest:{" "}
                        {
                          chartHistory[
                            chartHistory.length - 1
                          ].probability
                        .toFixed(1)}
                        %
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "#94A3B8",
                        }}
                      >
                        {
                          chartHistory[
                            chartHistory.length - 1
                          ].date
                        }
                      </Typography>
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1.2,
                        color: "#94A3B8",
                        lineHeight: 1.5,
                      }}
                    >
                      Each point is one saved model estimate. Hover a point
                      to see its assessment number, date, percentage, and risk level.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 2.5,
                      height: 230,
                      borderRadius: 3.5,
                      border: "1px dashed #CBD5E1",
                      bgcolor: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      px: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                        }}
                      >
                        Your trend chart will appear here
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.65,
                          color: "#64748B",
                          lineHeight: 1.6,
                          maxWidth: 430,
                        }}
                      >
                        Complete additional assessments to compare saved
                        risk estimates over time.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* SHAP */}
            <Grid
              size={{
                xs: 12,
                lg: 5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: {
                    xs: 2.5,
                    md: 3,
                  },
                  borderRadius: 4.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "white",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.3}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#EEF4FF",
                      color: "#2563EB",
                    }}
                  >
                    <AIIcon />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      Explainable AI
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.2,
                        color: "#64748B",
                      }}
                    >
                      Why the model moved toward this result
                    </Typography>
                  </Box>
                </Stack>

                {shapChartData.length > 0 ? (
                  <Box sx={{ mt: 2.5 }}>
                    <Stack spacing={1.6}>
                      {shapChartData.map((item) => {
                        const width =
                          maxShapMagnitude > 0
                            ? Math.max(
                                5,
                                (Math.abs(item.value) /
                                  maxShapMagnitude) *
                                  100
                              )
                            : 5;

                        return (
                          <Box key={item.feature}>
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent:
                                  "space-between",
                                alignItems: "baseline",
                                gap: 1.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                  fontWeight: 800,
                                  color: "#334155",
                                }}
                              >
                                {item.feature}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  flexShrink: 0,
                                  fontWeight: 800,
                                  color: item.increases
                                    ? "#DC2626"
                                    : "#16A34A",
                                }}
                              >
                                {item.value > 0
                                  ? "+"
                                  : ""}
                                {item.value.toFixed(3)}
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                mt: 0.7,
                                height: 9,
                                borderRadius: 999,
                                bgcolor: "#F1F5F9",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${width}%`,
                                  height: "100%",
                                  borderRadius: 999,
                                  bgcolor: item.increases
                                    ? "#F87171"
                                    : "#4ADE80",
                                  transition:
                                    "width 0.35s ease",
                                }}
                              />
                            </Box>

                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 0.35,
                                color: "#94A3B8",
                              }}
                            >
                              {item.increases
                                ? "Increased model output"
                                : "Decreased model output"}
                              {" • "}
                              Input: {item.inputValue}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        mt: 2.1,
                        flexWrap: "wrap",
                        rowGap: 0.8,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.7}
                        sx={{ alignItems: "center" }}
                      >
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            bgcolor: "#F87171",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748B" }}
                        >
                          Increases model output
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.7}
                        sx={{ alignItems: "center" }}
                      >
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            bgcolor: "#4ADE80",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748B" }}
                        >
                          Decreases model output
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1.3,
                        color: "#94A3B8",
                        lineHeight: 1.55,
                      }}
                    >
                      SHAP explains this prediction; it does not
                      change the model result.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 2.5,
                      minHeight: 230,
                      borderRadius: 3.5,
                      border: "1px dashed #CBD5E1",
                      bgcolor: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      px: 3,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748B",
                        lineHeight: 1.65,
                        maxWidth: 360,
                      }}
                    >
                      Complete an assessment to see the real SHAP
                      factors returned by the model.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* =====================================================
              POWER BI + REPORTS
              ===================================================== */}
          <Grid container spacing={2.2} sx={{ mb: 3.5 }}>
            <Grid
              size={{
                xs: 12,
                lg: 7,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: {
                    xs: 2.5,
                    md: 3,
                  },
                  borderRadius: 4.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "white",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.3}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      Power BI Analytics
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.35,
                        color: "#64748B",
                      }}
                    >
                      Population-level and research analytics workspace
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 1.1,
                      py: 0.55,
                      borderRadius: 2,
                      bgcolor: "#F1F5F9",
                      color: "#64748B",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    CONNECT LATER
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 2.5,
                    minHeight: 210,
                    borderRadius: 3.5,
                    bgcolor: "#F8FAFC",
                    border: "1px dashed #CBD5E1",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <DashboardSvg />

                  <Typography
                    sx={{
                      mt: 1.2,
                      fontWeight: 800,
                      color: "#334155",
                    }}
                  >
                    Power BI report area
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.65,
                      color: "#64748B",
                      maxWidth: 500,
                      lineHeight: 1.65,
                    }}
                  >
                    The final report can be embedded here once the actual
                    Power BI report, dataset, and embedding configuration are ready.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid
              size={{
                xs: 12,
                lg: 5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: {
                    xs: 2.5,
                    md: 3,
                  },
                  borderRadius: 4.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "white",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Reports & Documents
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.45,
                    color: "#64748B",
                    lineHeight: 1.6,
                  }}
                >
                  Your future document workspace for uploaded reports,
                  AI-extracted information, and generated health summaries.
                </Typography>

                <Box
                  sx={{
                    mt: 2.2,
                    p: 2.2,
                    borderRadius: 3.5,
                    bgcolor: "#F8FAFC",
                    border: "1px solid #EDF2F7",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.3}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#EEF4FF",
                        color: "#2563EB",
                      }}
                    >
                      <AssessmentSvg />
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: "#334155",
                        }}
                      >
                        Document intelligence
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748B",
                          display: "block",
                          mt: 0.25,
                        }}
                      >
                        Planned AI-assisted autofill workspace
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    mt: 1.3,
                    p: 2.2,
                    borderRadius: 3.5,
                    bgcolor: "#F8FAFC",
                    border: "1px solid #EDF2F7",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    Generated health summary
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.45,
                      color: "#94A3B8",
                    }}
                  >
                    Available after the reporting workflow is connected.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* =====================================================
              ASSESSMENT HISTORY
              ===================================================== */}
          <Paper
            elevation={0}
            sx={{
              mb: 3.5,
              p: {
                xs: 2.5,
                md: 3,
              },
              borderRadius: 4.5,
              border: "1px solid #E2E8F0",
              bgcolor: "white",
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Assessment History
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.4,
                    color: "#64748B",
                  }}
                >
                  Your saved assessment results and estimated risk levels.
                </Typography>
              </Box>

              <HistorySvg />
            </Stack>

            {assessmentHistory.length > 0 ? (
              <Box
                sx={{
                  mt: 2.2,
                  border: "1px solid #EDF2F7",
                  borderRadius: 3.5,
                  overflow: "hidden",
                }}
              >
                {assessmentHistory
                  .slice(0, 8)
                  .map((item, index) => {
                    const probability = Number(
                      item?.predictionResult
                        ?.osteoporosis_probability
                    );

                    const percent =
                      Number.isFinite(probability)
                        ? `${(
                            probability * 100
                          ).toFixed(1)}%`
                        : "—";

                    const level =
                      item?.predictionResult
                        ?.risk_level ||
                      "Unavailable";

                    return (
                      <Box
                        key={
                          item.id ||
                          `${item.savedAt}-${index}`
                        }
                        sx={{
                          px: 2,
                          py: 1.6,
                          display: "flex",
                          alignItems: {
                            xs: "flex-start",
                            sm: "center",
                          },
                          justifyContent:
                            "space-between",
                          flexDirection: {
                            xs: "column",
                            sm: "row",
                          },
                          gap: 1.3,
                          borderTop:
                            index === 0
                              ? "none"
                              : "1px solid #EDF2F7",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
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
                              bgcolor:
                                index === 0
                                  ? "#EEF4FF"
                                  : "#F8FAFC",
                              color:
                                index === 0
                                  ? "#2563EB"
                                  : "#64748B",
                              flexShrink: 0,
                            }}
                          >
                            <HistorySvg />
                          </Box>

                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: "#334155",
                              }}
                            >
                              {index === 0
                                ? "Latest assessment"
                                : `Assessment ${assessmentHistory.length - index}`}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                color: "#94A3B8",
                              }}
                            >
                              {formatDate(item.savedAt)}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 900,
                              color: "#0F172A",
                            }}
                          >
                            {percent}
                          </Typography>

                          <Box
                            sx={{
                              px: 1.1,
                              py: 0.45,
                              borderRadius: 999,
                              bgcolor:
                                level === "High"
                                  ? "#FEF2F2"
                                  : level ===
                                    "Moderate"
                                    ? "#FFFBEB"
                                    : level ===
                                      "Low"
                                      ? "#F0FDF4"
                                      : "#F8FAFC",
                              color:
                                level === "High"
                                  ? "#B91C1C"
                                  : level ===
                                    "Moderate"
                                    ? "#B45309"
                                    : level ===
                                      "Low"
                                      ? "#15803D"
                                      : "#64748B",
                              fontSize:
                                "0.72rem",
                              fontWeight: 800,
                            }}
                          >
                            {level}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
              </Box>
            ) : (
              <Box
                sx={{
                  mt: 2.2,
                  p: 2.2,
                  borderRadius: 3.5,
                  border: "1px dashed #CBD5E1",
                  bgcolor: "#F8FAFC",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#475569",
                    fontWeight: 700,
                  }}
                >
                  No saved assessments
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.45,
                    color: "#94A3B8",
                  }}
                >
                  Complete another assessment to start building your history.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* =====================================================
              EXPLORE
              ===================================================== */}
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Explore OsteoAI
          </Typography>

          <Grid container spacing={2.2}>
            {[
              {
                title: "AI Assistant",
                description:
                  "Get guided help with future assessments, explanations, and health documents.",
                icon: <AIIcon />,
              },
              {
                title: "Knowledge & Support",
                description:
                  "Access understandable bone-health education and frequently asked questions.",
                icon: <KnowledgeSvg />,
              },
              {
                title: "Notifications",
                description:
                  "Future email, WhatsApp, and SMS updates can be managed from your account.",
                icon: <HistorySvg />,
              },
            ].map((item) => (
              <Grid
                key={item.title}
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 2.5,
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                    bgcolor: "white",
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.7,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#F8FAFC",
                      color: "#475569",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      mt: 1.5,
                      fontWeight: 800,
                      color: "#0F172A",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.65,
                      color: "#64748B",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardPage;
