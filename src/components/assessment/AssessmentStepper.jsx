import { Stepper, Step, StepLabel } from "@mui/material";

import { useLanguage } from "../../context/LanguageContext";

function AssessmentStepper({ activeStep }) {
  const { t } = useLanguage();

  const steps = [
    t("assessment.stepperPersonal"),
    t("assessment.stepperLifestyle"),
    t("assessment.stepperMedical"),
  ];

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