import {
  Box,
  Grid,
  Typography,
} from "@mui/material";

import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import ChairIcon from "@mui/icons-material/Chair";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import SmokingRoomsIcon from "@mui/icons-material/SmokingRooms";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import WineBarIcon from "@mui/icons-material/WineBar";
import NoDrinksIcon from "@mui/icons-material/NoDrinks";

import { useAssessment } from "../../context/AssessmentContext";
import SelectableCard from "../ui/SelectableCard";

function LifestyleForm() {
  const {
    assessmentData,
    updateLifestyle,
  } = useAssessment();

  const lifestyle = assessmentData.lifestyle;

  const handleChange = (name, value) => {
    updateLifestyle({
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

      {/* Physical Activity */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          How would you describe your physical activity?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Choose the option that best describes your usual
          activity level.
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.physicalActivity === "Low"
              }
              onClick={() =>
                handleChange(
                  "physicalActivity",
                  "Low"
                )
              }
              icon={
                <ChairIcon />
              }
              title="Low"
              subtitle="Little or no regular exercise"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.physicalActivity === "Moderate"
              }
              onClick={() =>
                handleChange(
                  "physicalActivity",
                  "Moderate"
                )
              }
              icon={
                <DirectionsWalkIcon />
              }
              title="Moderate"
              subtitle="Exercise a few times per week"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.physicalActivity === "High"
              }
              onClick={() =>
                handleChange(
                  "physicalActivity",
                  "High"
                )
              }
              icon={
                <DirectionsRunIcon />
              }
              title="High"
              subtitle="Regular or highly active lifestyle"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Smoking */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          What is your smoking status?
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.smoking === "Never"
              }
              onClick={() =>
                handleChange(
                  "smoking",
                  "Never"
                )
              }
              icon={
                <SmokeFreeIcon />
              }
              title="Never"
              subtitle="Never smoked"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.smoking === "Former"
              }
              onClick={() =>
                handleChange(
                  "smoking",
                  "Former"
                )
              }
              icon={
                <SmokingRoomsIcon />
              }
              title="Former"
              subtitle="Previously smoked"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.smoking === "Current"
              }
              onClick={() =>
                handleChange(
                  "smoking",
                  "Current"
                )
              }
              icon={
                <SmokingRoomsIcon />
              }
              title="Current"
              subtitle="Currently smoking"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Alcohol */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          How often do you consume alcohol?
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.alcohol === "Never"
              }
              onClick={() =>
                handleChange(
                  "alcohol",
                  "Never"
                )
              }
              icon={
                <NoDrinksIcon />
              }
              title="Never"
              subtitle="No alcohol consumption"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.alcohol === "Occasionally"
              }
              onClick={() =>
                handleChange(
                  "alcohol",
                  "Occasionally"
                )
              }
              icon={
                <WineBarIcon />
              }
              title="Occasionally"
              subtitle="Occasional consumption"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectableCard
              selected={
                lifestyle.alcohol === "Frequently"
              }
              onClick={() =>
                handleChange(
                  "alcohol",
                  "Frequently"
                )
              }
              icon={
                <LocalBarIcon />
              }
              title="Frequently"
              subtitle="Frequent consumption"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default LifestyleForm;