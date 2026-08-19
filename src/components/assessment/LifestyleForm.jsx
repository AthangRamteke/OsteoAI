import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
} from "@mui/material";

import { useAssessment } from "../../context/AssessmentContext";

function LifestyleForm() {
  const { assessmentData, updateLifestyle } = useAssessment();

  const lifestyle = assessmentData.lifestyle;

  const handleChange = (event) => {
    const { name, value } = event.target;

    updateLifestyle({
      [name]: value,
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          Lifestyle Factors
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Tell us about your daily habits and lifestyle.
        </Typography>
      </Box>

      {/* Physical Activity */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #E2E8F0",
        }}
      >
        <CardContent>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
              }}
            >
              How would you describe your physical activity?
            </FormLabel>

            <RadioGroup
              name="physicalActivity"
              value={lifestyle.physicalActivity}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Low"
                control={<Radio />}
                label="Low — Little or no regular exercise"
              />

              <FormControlLabel
                value="Moderate"
                control={<Radio />}
                label="Moderate — Exercise a few times per week"
              />

              <FormControlLabel
                value="High"
                control={<Radio />}
                label="High — Regular exercise or physically active lifestyle"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Smoking */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #E2E8F0",
        }}
      >
        <CardContent>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
              }}
            >
              What is your smoking status?
            </FormLabel>

            <RadioGroup
              name="smoking"
              value={lifestyle.smoking}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Never"
                control={<Radio />}
                label="Never smoked"
              />

              <FormControlLabel
                value="Former"
                control={<Radio />}
                label="Former smoker"
              />

              <FormControlLabel
                value="Current"
                control={<Radio />}
                label="Current smoker"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Alcohol */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #E2E8F0",
        }}
      >
        <CardContent>
          <FormControl>
            <FormLabel
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
              }}
            >
              How often do you consume alcohol?
            </FormLabel>

            <RadioGroup
              name="alcohol"
              value={lifestyle.alcohol}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Never"
                control={<Radio />}
                label="Never"
              />

              <FormControlLabel
                value="Occasionally"
                control={<Radio />}
                label="Occasionally"
              />

              <FormControlLabel
                value="Frequently"
                control={<Radio />}
                label="Frequently"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LifestyleForm;