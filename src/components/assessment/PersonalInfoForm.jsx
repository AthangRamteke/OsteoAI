import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

function PersonalInfoForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    console.log(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateBMI = () => {
    const heightInMeters = Number(formData.height) / 100;
    const weight = Number(formData.weight);

    if (!heightInMeters || !weight) {
      return "";
    }

    const bmi = weight / (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };
  const getBMICategory = () => {
    const bmi = Number(calculateBMI());

    if (!bmi) {
      return "";
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
  const getBMIRecommendation = () => {
    const category = getBMICategory();

    switch (category) {
      case "Underweight":
        return "Your BMI is below the healthy range. Consider consulting a healthcare professional and improving your nutrition.";

      case "Healthy Weight":
        return "Your BMI is within the healthy range. Maintain a balanced diet, regular exercise, and healthy lifestyle habits to support strong bones.";

      case "Overweight":
        return "Your BMI is above the healthy range. Regular exercise and a balanced diet may help improve your overall bone health.";

      case "Obese":
        return "Your BMI is significantly above the healthy range. Please consult a healthcare professional for personalized advice.";

      default:
        return "";
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
      >
        Personal Information
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
      >
        Tell us about yourself before we assess your bone health.
      </Typography>

      <TextField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Age"
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <FormControl margin="normal">
        <FormLabel>Gender</FormLabel>

        <RadioGroup
          row
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <FormControlLabel
            value="Male"
            control={<Radio />}
            label="Male"
          />

          <FormControlLabel
            value="Female"
            control={<Radio />}
            label="Female"
          />

          <FormControlLabel
            value="Other"
            control={<Radio />}
            label="Other"
          />
        </RadioGroup>
      </FormControl>

      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Height (cm)"
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Weight (kg)"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Card
        elevation={0}
        sx={{
          mt: 4,
          borderRadius: 3,
          border: "1px solid #E2E8F0",
          bgcolor: "#F8FAFC",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            align="center"
            fontWeight={600}
          >
            Your BMI
          </Typography>

          <Typography
            variant="h2"
            align="center"
            fontWeight={700}
            color="primary"
            sx={{ mt: 2 }}
          >
            {calculateBMI()}

          </Typography>
          <Typography
            variant="h5"
            align="center"
            fontWeight={600}
            color="success.main"
            sx={{ mt: 2 }}
          >
            {getBMICategory()}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{
              mt: 2,
              maxWidth: 500,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            {getBMIRecommendation()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PersonalInfoForm;