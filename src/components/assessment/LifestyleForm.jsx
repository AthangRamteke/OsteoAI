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
import { useLanguage } from "../../context/LanguageContext";

function LifestyleForm() {
  const { t } = useLanguage();

  const alcoholFrequencyOptions = [
    { value: "0", label: t("assessment.lifestyle.alcoholFreq0") },
    { value: "1", label: t("assessment.lifestyle.alcoholFreq1") },
    { value: "2", label: t("assessment.lifestyle.alcoholFreq2") },
    { value: "3", label: t("assessment.lifestyle.alcoholFreq3") },
    { value: "4", label: t("assessment.lifestyle.alcoholFreq4") },
    { value: "5", label: t("assessment.lifestyle.alcoholFreq5") },
    { value: "6", label: t("assessment.lifestyle.alcoholFreq6") },
    { value: "7", label: t("assessment.lifestyle.alcoholFreq7") },
    { value: "8", label: t("assessment.lifestyle.alcoholFreq8") },
    { value: "9", label: t("assessment.lifestyle.alcoholFreq9") },
    { value: "10", label: t("assessment.lifestyle.alcoholFreq10") },
  ];

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
            title={t("common.yes")}
            subtitle={t("common.yes")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectableCard
            selected={lifestyle[field] === "No"}
            onClick={() => handleChange(field, "No")}
            icon={noIcon}
            title={t("common.no")}
            subtitle={t("common.no")}
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
          {t("assessment.lifestyle.title")}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
          }}
        >
          {t("assessment.lifestyle.subtitle")}
        </Typography>
      </Box>

      {/* Smoking */}
      <BinaryQuestion
        title={t("assessment.lifestyle.smokingTitle")}
        description={t("assessment.lifestyle.smokingDesc")}
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
          {t("assessment.lifestyle.alcoholEverTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t("assessment.lifestyle.alcoholEverDesc")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectableCard
              selected={lifestyle.alcoholEver === "Yes"}
              onClick={() => handleAlcoholEver("Yes")}
              icon={<LocalBarIcon />}
              title={t("common.yes")}
              subtitle={t("common.yes")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectableCard
              selected={lifestyle.alcoholEver === "No"}
              onClick={() => handleAlcoholEver("No")}
              icon={<NoDrinksIcon />}
              title={t("common.no")}
              subtitle={t("common.no")}
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
          {t("assessment.lifestyle.alcoholFreqTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t("assessment.lifestyle.alcoholFreqDesc")}
        </Typography>

        <TextField
          select
          fullWidth
          label={t("assessment.lifestyle.alcoholFreqLabel")}
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
          {t("assessment.lifestyle.workActivityTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t("assessment.lifestyle.workActivitySubtitle")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <BinaryQuestion
            title={t("assessment.lifestyle.vigorousWorkTitle")}
            description={t("assessment.lifestyle.vigorousWorkDesc")}
            field="vigorousWorkActivity"
            yesIcon={<DirectionsRunIcon />}
            noIcon={<ChairIcon />}
          />

          <BinaryQuestion
            title={t("assessment.lifestyle.moderateWorkTitle")}
            description={t("assessment.lifestyle.moderateWorkDesc")}
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
          {t("assessment.lifestyle.movementTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t("assessment.lifestyle.movementSubtitle")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <BinaryQuestion
            title={t("assessment.lifestyle.walkBicycleTitle")}
            description={t("assessment.lifestyle.walkBicycleDesc")}
            field="walkOrBicycle"
            yesIcon={<DirectionsWalkIcon />}
            noIcon={<ChairIcon />}
          />

          <BinaryQuestion
            title={t("assessment.lifestyle.vigorousRecreationTitle")}
            description={t("assessment.lifestyle.vigorousRecreationDesc")}
            field="vigorousRecreation"
            yesIcon={<DirectionsRunIcon />}
            noIcon={<ChairIcon />}
          />

          <BinaryQuestion
            title={t("assessment.lifestyle.moderateRecreationTitle")}
            description={t("assessment.lifestyle.moderateRecreationDesc")}
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
          {t("assessment.lifestyle.sedentaryTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t("assessment.lifestyle.sedentarySubtitle")}
        </Typography>

        <TextField
          fullWidth
          label={t("assessment.lifestyle.sedentaryLabel")}
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
          {t("assessment.lifestyle.infoNoteTitle")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            lineHeight: 1.6,
          }}
        >
          {t("assessment.lifestyle.infoNoteDesc")}
        </Typography>
      </Box>
    </Box>
  );
}

export default LifestyleForm;
