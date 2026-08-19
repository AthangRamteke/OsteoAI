import {
  Box,
  Grid,
  Typography,
} from "@mui/material";

import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import HealingIcon from "@mui/icons-material/Healing";
import MedicationIcon from "@mui/icons-material/Medication";

import { useAssessment } from "../../context/AssessmentContext";
import SelectableCard from "../ui/SelectableCard";

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

  const options = [
    {
      value: "No",
      title: "No",
      subtitle: "No known history",
    },
    {
      value: "Yes",
      title: "Yes",
      subtitle: "Yes, I have relevant history",
    },
    {
      value: "Unknown",
      title: "Not sure",
      subtitle: "I don't know",
    },
  ];

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
          A few medical factors may help us build a more
          complete assessment of your bone health.
        </Typography>
      </Box>

      {/* Family History */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <FamilyRestroomIcon color="primary" />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Family History
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
          Does anyone in your family have osteoporosis?
        </Typography>

        <Grid
          container
          spacing={2}
        >
          {options.map((option) => (
            <Grid
              key={option.value}
              size={{ xs: 12, sm: 4 }}
            >
              <SelectableCard
                selected={
                  medicalHistory.familyHistory === option.value
                }
                onClick={() =>
                  handleChange(
                    "familyHistory",
                    option.value
                  )
                }
                icon={<FamilyRestroomIcon />}
                title={option.title}
                subtitle={option.subtitle}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Previous Fracture */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <HealingIcon color="primary" />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Previous Bone Fracture
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
          Have you ever had a bone fracture from a minor
          fall or injury?
        </Typography>

        <Grid
          container
          spacing={2}
        >
          {options.map((option) => (
            <Grid
              key={option.value}
              size={{ xs: 12, sm: 4 }}
            >
              <SelectableCard
                selected={
                  medicalHistory.previousFracture ===
                  option.value
                }
                onClick={() =>
                  handleChange(
                    "previousFracture",
                    option.value
                  )
                }
                icon={<HealingIcon />}
                title={option.title}
                subtitle={option.subtitle}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Medication */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <MedicationIcon color="primary" />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Long-Term Medication
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            lineHeight: 1.6,
          }}
        >
          Have you taken steroids or similar medicines for
          more than 3 months?
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 2,
          }}
        >
          Example: long-term corticosteroids such as prednisone.
        </Typography>

        <Grid
          container
          spacing={2}
        >
          {options.map((option) => (
            <Grid
              key={option.value}
              size={{ xs: 12, sm: 4 }}
            >
              <SelectableCard
                selected={
                  medicalHistory.medications === option.value
                }
                onClick={() =>
                  handleChange(
                    "medications",
                    option.value
                  )
                }
                icon={<MedicationIcon />}
                title={option.title}
                subtitle={option.subtitle}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default MedicalHistoryForm;