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

/*
 * One yes / no medical-history question.
 *
 * Module level on purpose: a component declared inside its parent is
 * recreated on every render, which remounts the cards below it.
 */
function YesNoQuestion({ title, description, value, onSelect, icon }) {
  const { t } = useLanguage();

  const options = [
    { value: "Yes", title: t("common.yes"), subtitle: t("common.yes") },
    { value: "No", title: t("common.no"), subtitle: t("common.no") },
  ];

  return (
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
        {options.map((option) => (
          <Grid
            key={option.value}
            size={{ xs: 12, sm: 6 }}
          >
            <SelectableCard
              selected={value === option.value}
              onClick={() => onSelect(option.value)}
              icon={icon}
              title={option.title}
              subtitle={option.subtitle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


function MedicalHistoryForm() {
  const { t } = useLanguage();

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
        value={medicalHistory.otherBoneFractureAfter20}
        onSelect={(choice) => handleChange("otherBoneFractureAfter20", choice)}
        icon={<HealingIcon color="primary" />}
      />

      {/* Steroid use */}
      <YesNoQuestion
        title={t("assessment.medical.q2Title")}
        description={t("assessment.medical.q2Desc")}
        value={medicalHistory.longTermSteroidUse}
        onSelect={(choice) => handleChange("longTermSteroidUse", choice)}
        icon={<MedicationIcon color="primary" />}
      />

      {/* Parent osteoporosis */}
      <YesNoQuestion
        title={t("assessment.medical.q3Title")}
        description={t("assessment.medical.q3Desc")}
        value={medicalHistory.parentOsteoporosisHistory}
        onSelect={(choice) => handleChange("parentOsteoporosisHistory", choice)}
        icon={<FamilyRestroomIcon color="primary" />}
      />

      {/* Mother hip fracture */}
      <YesNoQuestion
        title={t("assessment.medical.q4Title")}
        description={t("assessment.medical.q4Desc")}
        value={medicalHistory.motherHipFracture}
        onSelect={(choice) => handleChange("motherHipFracture", choice)}
        icon={<PersonIcon color="primary" />}
      />

      {/* Father hip fracture */}
      <YesNoQuestion
        title={t("assessment.medical.q5Title")}
        description={t("assessment.medical.q5Desc")}
        value={medicalHistory.fatherHipFracture}
        onSelect={(choice) => handleChange("fatherHipFracture", choice)}
        icon={<PersonIcon color="primary" />}
      />

      {/* Information note */}
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "var(--oa-surface-2)",
          border: "1px solid var(--oa-border-1)",
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