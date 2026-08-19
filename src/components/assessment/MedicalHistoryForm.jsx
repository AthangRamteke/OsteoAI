import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

import { useAssessment } from "../../context/AssessmentContext";

function MedicalHistoryForm() {
  const { assessmentData, updateMedicalHistory } = useAssessment();

  const medicalHistory = assessmentData.medicalHistory;

  const handleChange = (event) => {
    const { name, value } = event.target;

    updateMedicalHistory({
      [name]: value,
    });
  };

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
      >
        Medical History
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Tell us about your medical history and factors that may affect bone health.
      </Typography>

      {/* Family History */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
              }}
            >
              Does anyone in your immediate family have a history of osteoporosis?
            </FormLabel>

            <RadioGroup
              name="familyHistory"
              value={medicalHistory.familyHistory}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Yes"
                control={<Radio />}
                label="Yes"
              />

              <FormControlLabel
                value="No"
                control={<Radio />}
                label="No"
              />

              <FormControlLabel
                value="Unknown"
                control={<Radio />}
                label="I don't know"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Previous Fracture */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
              }}
            >
              Have you ever experienced a bone fracture from a minor fall or injury?
            </FormLabel>

            <RadioGroup
              name="previousFracture"
              value={medicalHistory.previousFracture}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Yes"
                control={<Radio />}
                label="Yes"
              />

              <FormControlLabel
                value="No"
                control={<Radio />}
                label="No"
              />
              <FormControlLabel
                value="Unknown"
                control={<Radio />}
                label="I'm not sure"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Medication */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 1,
              }}
            >
              Have you used medications for a long period that may affect bone health?
            </FormLabel>

            <RadioGroup
              name="medications"
              value={medicalHistory.medications}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Yes"
                control={<Radio />}
                label="Yes"
              />

              <FormControlLabel
                value="No"
                control={<Radio />}
                label="No"
              />

              <FormControlLabel
                value="Unknown"
                control={<Radio />}
                label="I'm not sure"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MedicalHistoryForm;