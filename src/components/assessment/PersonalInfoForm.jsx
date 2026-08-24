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

const raceOptions = [
  {
    value: "1",
    title: "Mexican American",
    subtitle: "Mexican American",
  },
  {
    value: "2",
    title: "Other Hispanic",
    subtitle: "Hispanic / Latino",
  },
  {
    value: "3",
    title: "White",
    subtitle: "Non-Hispanic White",
  },
  {
    value: "4",
    title: "Black",
    subtitle: "Non-Hispanic Black",
  },
  {
    value: "6",
    title: "Asian",
    subtitle: "Non-Hispanic Asian",
  },
];

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

  const handleNumericChange = (event) => {
    const { name, value } = event.target;

    if (value === "") {
      updatePersonal({
        [name]: "",
      });
      return;
    }

    if (/^\d+$/.test(value)) {
      updatePersonal({
        [name]: value,
      });
    }
  };

  const handleGenderChange = (value) => {
    updatePersonal({
      gender: value,
    });
  };

  const handleRaceChange = (value) => {
    updatePersonal({
      raceEthnicity: value,
    });
  };

  const calculateBMI = () => {
    const heightInMeters =
      Number(formData.height) / 100;

    const weight = Number(formData.weight);

    if (!heightInMeters || !weight) {
      return "";
    }

    const bmi =
      weight /
      (heightInMeters * heightInMeters);

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

  const numericInput = (
    name,
    value,
    min,
    max,
    label
  ) => (
    <TextField
      label={label}
      name={name}
      type="text"
      value={value}
      onChange={handleNumericChange}
      autoComplete="new-password"
      spellCheck={false}
      fullWidth
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
          pattern: "[0-9]*",
          min,
          max,
        },
      }}
    />
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
          Personal Information
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          Tell us a little about yourself before we assess
          your bone health.
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
            autoComplete="off"
            spellCheck={false}
            autoCorrect="off"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          {numericInput(
            "age",
            formData.age,
            18,
            120,
            "Age"
          )}
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
              selected={
                formData.gender === "Male"
              }
              onClick={() =>
                handleGenderChange("Male")
              }
              icon={<PersonIcon />}
              title="Male"
              subtitle="Male"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                formData.gender === "Female"
              }
              onClick={() =>
                handleGenderChange("Female")
              }
              icon={<PersonIcon />}
              title="Female"
              subtitle="Female"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                formData.gender === "Other"
              }
              onClick={() =>
                handleGenderChange("Other")
              }
              icon={<WcIcon />}
              title="Other"
              subtitle="Prefer to identify differently"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Race / Ethnicity */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Race / Ethnicity
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Choose the option that best matches your background.
        </Typography>

        <Grid
          container
          spacing={2}
        >
          {raceOptions.map((option) => (
            <Grid
              key={option.value}
              size={{ xs: 12, sm: 6 }}
            >
              <SelectableCard
                selected={
                  formData.raceEthnicity ===
                  option.value
                }
                onClick={() =>
                  handleRaceChange(
                    option.value
                  )
                }
                icon={<WcIcon />}
                title={option.title}
                subtitle={option.subtitle}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Height + Weight */}
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          {numericInput(
            "height",
            formData.height,
            50,
            250,
            "Height (cm)"
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {numericInput(
            "weight",
            formData.weight,
            20,
            300,
            "Weight (kg)"
          )}
        </Grid>
      </Grid>

      {/* Waist + Hip */}
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          {numericInput(
            "waist",
            formData.waist,
            40,
            200,
            "Waist Circumference (cm)"
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {numericInput(
            "hip",
            formData.hip,
            40,
            200,
            "Hip Circumference (cm)"
          )}
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
              {getBMICategory() ||
                "Waiting for your details"}
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
            BMI is one of several factors considered in
            your overall assessment.
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