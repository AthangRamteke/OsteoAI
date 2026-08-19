import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";

import AssessmentStepper from "../../components/assessment/AssessmentStepper";
import NavigationButtons from "../../components/assessment/NavigationButtons";

import PersonalInfoForm from "../../components/assessment/PersonalInfoForm";
import LifestyleForm from "../../components/assessment/LifestyleForm";
import MedicalHistoryForm from "../../components/assessment/MedicalHistoryForm";
import AssessmentResult from "../../components/assessment/AssessmentResult";

import {
  AssessmentProvider,
  useAssessment,
} from "../../context/AssessmentContext";

function AssessmentContent() {
  const [activeStep, setActiveStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const {
    assessmentData,
    resetAssessment,
  } = useAssessment();

  const steps = [
    <PersonalInfoForm key="personal" />,
    <LifestyleForm key="lifestyle" />,
    <MedicalHistoryForm key="medical" />,
  ];

  const isStepValid = () => {
    if (activeStep === 0) {
      const {
        name,
        age,
        gender,
        height,
        weight,
      } = assessmentData.personal;

      const ageNumber = Number(age);
      const heightNumber = Number(height);
      const weightNumber = Number(weight);

      return (
        name.trim() !== "" &&
        gender !== "" &&
        ageNumber >= 18 &&
        ageNumber <= 120 &&
        heightNumber >= 50 &&
        heightNumber <= 250 &&
        weightNumber >= 20 &&
        weightNumber <= 300
      );
    }

    if (activeStep === 1) {
      const {
        physicalActivity,
        smoking,
        alcohol,
      } = assessmentData.lifestyle;

      return (
        physicalActivity !== "" &&
        smoking !== "" &&
        alcohol !== ""
      );
    }

    if (activeStep === 2) {
      const {
        familyHistory,
        previousFracture,
        medications,
      } = assessmentData.medicalHistory;

      return (
        familyHistory !== "" &&
        previousFracture !== "" &&
        medications !== ""
      );
    }

    return false;
  };

  const handleEditAssessment = () => {
    setShowResult(false);
    setActiveStep(0);
  };

  const handleRetakeAssessment = () => {
    resetAssessment();
    setActiveStep(0);
    setShowResult(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Card
          elevation={0}
          sx={{
            borderRadius: 5,
            p: 3,
            border: "1px solid #E2E8F0",
          }}
        >
          <CardContent>
            {!showResult && (
              <>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  align="center"
                  gutterBottom
                >
                  Osteoporosis Risk Assessment
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 5 }}
                >
                  Complete this assessment in about 2 minutes.
                </Typography>
              </>
            )}

            {showResult ? (
              <AssessmentResult
                onEdit={handleEditAssessment}
                onRetake={handleRetakeAssessment}
              />
            ) : (
              <>
                <AssessmentStepper activeStep={activeStep} />

                {steps[activeStep]}

                <NavigationButtons
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  totalSteps={steps.length}
                  isStepValid={isStepValid()}
                  onSubmit={() => setShowResult(true)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function Assessment() {
  return (
    <AssessmentProvider>
      <AssessmentContent />
    </AssessmentProvider>
  );
}

export default Assessment;  