import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import PersonIcon from "@mui/icons-material/Person";
import WcIcon from "@mui/icons-material/Wc";

import { useAssessment } from "../../context/AssessmentContext";
import SelectableCard from "../ui/SelectableCard";

function PersonalInfoForm() {
  const {
    assessmentData,
    updatePersonal,
  } = useAssessment();

  const formData = assessmentData.personal;

  const handleChange = (event) => {
    const { name, value } = event.target;

    updatePersonal({
      [name]: value,
    });
  };

  const handleGenderChange = (value) => {
    updatePersonal({
      gender: value,
    });
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

  const getBMIColor = () => {
    const category = getBMICategory();

    switch (category) {
      case "Underweight":
        return "warning.main";

      case "Healthy Weight":
        return "success.main";

      case "Overweight":
        return "warning.dark";

      case "Obese":
        return "error.main";

      default:
        return "text.primary";
    }
  };

  const getBMIIcon = () => {
    const category = getBMICategory();

    switch (category) {
      case "Healthy Weight":
        return (
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 30 }}
          />
        );

      case "Underweight":
        return (
          <WarningAmberIcon
            color="warning"
            sx={{ fontSize: 30 }}
          />
        );

      case "Overweight":
        return (
          <WarningAmberIcon
            color="warning"
            sx={{ fontSize: 30 }}
          />
        );

      case "Obese":
        return (
          <ErrorIcon
            color="error"
            sx={{ fontSize: 30 }}
          />
        );

      default:
        return null;
    }
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
          Personal Information
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          Tell us a little about yourself before we assess your
          bone health.
        </Typography>
      </Box>

      {/* Name + Age */}
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Age"
            name="age"
            type="number"
            slotProps={{
              htmlInput: {
                min: 18,
                max: 120,
              },
            }}
            value={formData.age}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>

      {/* Gender */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Gender
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Select the option that best describes you.
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={formData.gender === "Male"}
              onClick={() => handleGenderChange("Male")}
              icon={<PersonIcon />}
              title="Male"
              subtitle="Male"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={formData.gender === "Female"}
              onClick={() => handleGenderChange("Female")}
              icon={<PersonIcon />}
              title="Female"
              subtitle="Female"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={formData.gender === "Other"}
              onClick={() => handleGenderChange("Other")}
              icon={<WcIcon />}
              title="Other"
              subtitle="Prefer to identify differently"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Height + Weight */}
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Height (cm)"
            name="height"
            type="number"
            slotProps={{
              htmlInput: {
                min: 50,
                max: 250,
              },
            }}
            value={formData.height}
            onChange={handleChange}
            onWheel={(event) => event.target.blur()}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Weight (kg)"
            name="weight"
            type="number"
            slotProps={{
              htmlInput: {
                min: 20,
                max: 300,
              },
            }}
            value={formData.weight}
            onChange={handleChange}
            onWheel={(event) => event.target.blur()}
            fullWidth
          />
        </Grid>
      </Grid>

      {/* BMI */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          bgcolor: "#F8FAFC",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <HealthAndSafetyIcon
              color="primary"
              sx={{ fontSize: 30 }}
            />

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Your BMI
            </Typography>
          </Box>

          <Typography
            variant="h2"
            align="center"
            fontWeight={800}
            color="primary"
            sx={{
              mt: 2,
              letterSpacing: "-0.03em",
            }}
          >
            {calculateBMI() || "—"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mt: 1.5,
            }}
          >
            {getBMIIcon()}

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: getBMIColor(),
              }}
            >
              {getBMICategory() || "Waiting for your details"}
            </Typography>
          </Box>

          <Typography
            align="center"
            color="text.secondary"
            sx={{
              mt: 2,
              maxWidth: 560,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            BMI is one of several factors considered in your
            overall assessment.
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #E2E8F0",
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.primary"
            >
              Complete Lifestyle + Medical History
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                lineHeight: 1.6,
              }}
            >
              to generate your personalized bone-health
              assessment.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PersonalInfoForm;