import {
  Box,
  Grid,
  Typography,
} from "@mui/material";

import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import HealingIcon from "@mui/icons-material/Healing";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";

import { useAssessment } from "../../context/AssessmentContext";
import SelectableCard from "../ui/SelectableCard";
import { useLanguage } from "../../context/LanguageContext";

function MedicalHistoryForm() {
  const { t } = useLanguage();

  const yesNoOptions = [
    {
      value: "Yes",
      title: t("common.yes"),
      subtitle: t("common.yes"),
    },
    {
      value: "No",
      title: t("common.no"),
      subtitle: t("common.no"),
    },
  ];

  const {
    assessmentData,
    updateMedicalHistory,
  } = useAssessment();

  const medicalHistory = assessmentData.medicalHistory;

  const handleChange = (name, value) => {
    updateMedicalHistory({
      [name]: value,
    });
  };

  const YesNoQuestion = ({
    title,
    description,
    field,
    icon,
  }) => (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        {icon}

        <Typography
          variant="h6"
          fontWeight={700}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      <Grid
        container
        spacing={2}
      >
        {yesNoOptions.map((option) => (
          <Grid
            key={option.value}
            size={{ xs: 12, sm: 6 }}
          >
            <SelectableCard
              selected={
                medicalHistory[field] === option.value
              }
              onClick={() =>
                handleChange(field, option.value)
              }
              icon={icon}
              title={option.title}
              subtitle={option.subtitle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* Header */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={800}
        >
          {t("assessment.medical.title")}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          {t("assessment.medical.subtitle")}
        </Typography>
      </Box>

      {/* Previous fracture */}
      <YesNoQuestion
        title={t("assessment.medical.q1Title")}
        description={t("assessment.medical.q1Desc")}
        field="otherBoneFractureAfter20"
        icon={<HealingIcon color="primary" />}
      />

      {/* Steroid use */}
      <YesNoQuestion
        title={t("assessment.medical.q2Title")}
        description={t("assessment.medical.q2Desc")}
        field="longTermSteroidUse"
        icon={<MedicationIcon color="primary" />}
      />

      {/* Parent osteoporosis */}
      <YesNoQuestion
        title={t("assessment.medical.q3Title")}
        description={t("assessment.medical.q3Desc")}
        field="parentOsteoporosisHistory"
        icon={<FamilyRestroomIcon color="primary" />}
      />

      {/* Mother hip fracture */}
      <YesNoQuestion
        title={t("assessment.medical.q4Title")}
        description={t("assessment.medical.q4Desc")}
        field="motherHipFracture"
        icon={<PersonIcon color="primary" />}
      />

      {/* Father hip fracture */}
      <YesNoQuestion
        title={t("assessment.medical.q5Title")}
        description={t("assessment.medical.q5Desc")}
        field="fatherHipFracture"
        icon={<PersonIcon color="primary" />}
      />

      {/* Information note */}
      <Box
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
          color="text.primary"
        >
          {t("assessment.medical.whyAskTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            lineHeight: 1.6,
          }}
        >
          {t("assessment.medical.whyAskDesc")}
        </Typography>
      </Box>
    </Box>
  );
}

export default MedicalHistoryForm;