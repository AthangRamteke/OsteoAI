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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    // Hard guard: don't advance if the current step is invalid.
    if (isLastStep || !isStepValid) {
      return;
    }

    setActiveStep((prev) => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = () => {
    // Hard guard: don't submit invalid data.
    if (!isLastStep || !isStepValid) {
      return;
    }

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