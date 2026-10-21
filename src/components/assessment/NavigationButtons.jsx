import { Box, Button } from "@mui/material";

import { useLanguage } from "../../context/LanguageContext";

function NavigationButtons({
  activeStep,
  setActiveStep,
  totalSteps,
  onSubmit,
  isStepValid,
}) {
  const { t } = useLanguage();

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;

  const handleBack = (event) => {
    event.preventDefault();

    if (isFirstStep) {
      return;
    }

    setActiveStep((prev) => prev - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = (event) => {
    event.preventDefault();

    if (isLastStep || !isStepValid) {
      return;
    }

    setActiveStep((prev) => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLastStep || !isStepValid) {
      return;
    }

    await onSubmit();
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
        type="button"
        variant="outlined"
        onClick={handleBack}
        disabled={isFirstStep}
      >
        {t("common.back")}
      </Button>

      <Button
        type="button"
        variant="contained"
        onClick={
          isLastStep
            ? handleSubmit
            : handleNext
        }
        disabled={!isStepValid}
      >
        {isLastStep ? t("common.submit") : t("common.next")}
      </Button>
    </Box>
  );
}

export default NavigationButtons;