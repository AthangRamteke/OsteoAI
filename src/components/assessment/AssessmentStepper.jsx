import { Stepper, Step, StepLabel } from "@mui/material";

const steps = [
  "Personal",
  "Lifestyle",
  "Medical",
];

function AssessmentStepper({ activeStep }) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        mb: 5,
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default AssessmentStepper;