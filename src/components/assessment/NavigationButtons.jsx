import { Box, Button } from "@mui/material";

function NavigationButtons({
  activeStep,
  setActiveStep,
  totalSteps,
  onSubmit,
  isStepValid,
}) {
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  const handleBack = () => {
    if (!isFirstStep) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    onSubmit();
  };
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 4,
      }}
    >
      <Button
        variant="outlined"
        onClick={handleBack}
        disabled={isFirstStep}
      >
        Back
      </Button>

      <Button
        variant="contained"
        onClick={isLastStep ? handleSubmit : handleNext}
        disabled={!isStepValid}
      >
        {isLastStep ? "Submit" : "Next"}
      </Button>
    </Box>
  );
}

export default NavigationButtons;