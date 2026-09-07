import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";

import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import ChairIcon from "@mui/icons-material/Chair";
import SmokeFreeIcon from "@mui/icons-material/Air";
import SmokingRoomsIcon from "@mui/icons-material/LocalFireDepartment";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import NoDrinksIcon from "@mui/icons-material/NoDrinks";

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

const alcoholFrequencyOptions = [
  { value: "0", label: "Never" },
  { value: "1", label: "Every day" },
  { value: "2", label: "Nearly every day" },
  { value: "3", label: "3–4 times per week" },
  { value: "4", label: "2 times per week" },
  { value: "5", label: "Once a week" },
  { value: "6", label: "2–3 times per month" },
  { value: "7", label: "Once a month" },
  { value: "8", label: "7–11 times per year" },
  { value: "9", label: "3–6 times per year" },
  { value: "10", label: "1–2 times per year" },
];

function LifestyleForm() {
  const { assessmentData, updateLifestyle } = useAssessment();

  const lifestyle = assessmentData.lifestyle;

  const handleChange = (name, value) => {
    updateLifestyle({
      [name]: value,
    });
  };

  const handleAlcoholEver = (value) => {
    updateLifestyle({
      alcoholEver: value,
      alcoholFrequency:
        value === "No"
          ? "0"
          : lifestyle.alcoholFrequency === "0"
            ? ""
            : lifestyle.alcoholFrequency,
    });
  };

  const BinaryQuestion = ({
    title,
    description,
    field,
    yesIcon,
    noIcon,
  }) => (
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {description}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectableCard
            selected={lifestyle[field] === "Yes"}
            onClick={() => handleChange(field, "Yes")}
            icon={yesIcon}
            title="Yes"
            subtitle="Yes"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectableCard
            selected={lifestyle[field] === "No"}
            onClick={() => handleChange(field, "No")}
            icon={noIcon}
            title="No"
            subtitle="No"
          />
        </Grid>
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
          Lifestyle Factors
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          Your daily habits can play an important role in
          overall bone health.
        </Typography>
      </Box>

      {/* Smoking */}
      <BinaryQuestion
        title="Have you smoked at least 100 cigarettes in your lifetime?"
        description="This matches the smoking measure used by the OsteoAI model."
        field="smoked100Cigarettes"
        yesIcon={<SmokingRoomsIcon />}
        noIcon={<SmokeFreeIcon />}
      />

      {/* Alcohol history */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Have you ever had an alcoholic drink?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          This refers to whether you have ever consumed alcohol.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectableCard
              selected={lifestyle.alcoholEver === "Yes"}
              onClick={() => handleAlcoholEver("Yes")}
              icon={<LocalBarIcon />}
              title="Yes"
              subtitle="Yes"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectableCard
              selected={lifestyle.alcoholEver === "No"}
              onClick={() => handleAlcoholEver("No")}
              icon={<NoDrinksIcon />}
              title="No"
              subtitle="No"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Alcohol frequency */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          How often did you drink alcohol during the past 12 months?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Select the option that best describes your drinking frequency.
        </Typography>

        <TextField
          select
          fullWidth
          label="Alcohol frequency"
          value={lifestyle.alcoholFrequency}
          onChange={(event) =>
            handleChange(
              "alcoholFrequency",
              event.target.value
            )
          }
        >
          {alcoholFrequencyOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Work activity */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Work Activity
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Answer Yes or No for each activity.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <BinaryQuestion
            title="Vigorous Work Activity"
            description="Heavy physical work involving substantial effort."
            field="vigorousWorkActivity"
            yesIcon={<DirectionsRunIcon />}
            noIcon={<ChairIcon />}
          />

          <BinaryQuestion
            title="Moderate Work Activity"
            description="Moderate physical work as part of your usual routine."
            field="moderateWorkActivity"
            yesIcon={<DirectionsWalkIcon />}
            noIcon={<ChairIcon />}
          />
        </Box>
      </Box>

      {/* Movement and recreation */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Movement & Recreation
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Answer Yes or No for each activity.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <BinaryQuestion
            title="Walk or Bicycle"
            description="Regular walking or cycling."
            field="walkOrBicycle"
            yesIcon={<DirectionsWalkIcon />}
            noIcon={<ChairIcon />}
          />

          <BinaryQuestion
            title="Vigorous Recreation"
            description="Running, vigorous sports, or similar exercise."
            field="vigorousRecreation"
            yesIcon={<DirectionsRunIcon />}
            noIcon={<ChairIcon />}
          />

          <BinaryQuestion
            title="Moderate Recreation"
            description="Moderate sports or exercise."
            field="moderateRecreation"
            yesIcon={<DirectionsWalkIcon />}
            noIcon={<ChairIcon />}
          />
        </Box>
      </Box>

      {/* Sedentary time */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Sedentary Time
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Approximately how many minutes do you spend sitting
          or inactive on a typical day?
        </Typography>

        <TextField
          fullWidth
          label="Sedentary minutes per day"
          type="number"
          value={lifestyle.sedentaryMinutes}
          onChange={(event) =>
            handleChange(
              "sedentaryMinutes",
              event.target.value
            )
          }
          slotProps={{
            htmlInput: {
              min: 0,
              max: 1440,
            },
          }}
          onWheel={(event) => event.target.blur()}
        />
      </Box>

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
        >
          Your information is used to build a multi-factor
          bone-health assessment.
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            lineHeight: 1.6,
          }}
        >
          Lifestyle information is combined with personal and
          medical factors before the model generates a result.
        </Typography>
      </Box>
    </Box>
  );
}

export default LifestyleForm;
