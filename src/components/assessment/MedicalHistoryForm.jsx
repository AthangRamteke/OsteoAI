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

const yesNoOptions = [
  {
    value: "Yes",
    title: "Yes",
    subtitle: "Yes",
  },
  {
    value: "No",
    title: "No",
    subtitle: "No",
  },
];

function MedicalHistoryForm() {
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
          Medical History
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          A few medical and family-history factors help
          create a more complete bone-health assessment.
        </Typography>
      </Box>

      {/* Previous fracture */}
      <YesNoQuestion
        title="Other Bone Fracture After Age 20"
        description="Have you had another bone fracture after the age of 20?"
        field="otherBoneFractureAfter20"
        icon={<HealingIcon color="primary" />}
      />

      {/* Steroid use */}
      <YesNoQuestion
        title="Long-Term Steroid Use"
        description="Have you taken corticosteroids or similar steroid medicines for a prolonged period?"
        field="longTermSteroidUse"
        icon={<MedicationIcon color="primary" />}
      />

      {/* Parent osteoporosis */}
      <YesNoQuestion
        title="Parent Osteoporosis History"
        description="Has a parent ever been diagnosed with osteoporosis?"
        field="parentOsteoporosisHistory"
        icon={<FamilyRestroomIcon color="primary" />}
      />

      {/* Mother hip fracture */}
      <YesNoQuestion
        title="Mother's Hip Fracture"
        description="Has your mother ever had a hip fracture?"
        field="motherHipFracture"
        icon={<PersonIcon color="primary" />}
      />

      {/* Father hip fracture */}
      <YesNoQuestion
        title="Father's Hip Fracture"
        description="Has your father ever had a hip fracture?"
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
          Why do we ask?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            lineHeight: 1.6,
          }}
        >
          Previous fractures, steroid exposure, and family
          history are among the factors used by the OsteoAI
          assessment model.
        </Typography>
      </Box>
    </Box>
  );
}

export default MedicalHistoryForm;