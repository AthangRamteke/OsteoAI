import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Typography,
} from "@mui/material";

import { AnimatePresence, motion } from "framer-motion";

import AssessmentStepper from "../../components/assessment/AssessmentStepper";
import NavigationButtons from "../../components/assessment/NavigationButtons";

import PersonalInfoForm from "../../components/assessment/PersonalInfoForm";
import LifestyleForm from "../../components/assessment/LifestyleForm";
import MedicalHistoryForm from "../../components/assessment/MedicalHistoryForm";
import AssessmentResult from "../../components/assessment/AssessmentResult";
import AnalysisScreen from "../../components/assessment/AnalysisScreen";

import Navbar from "../../components/common/Navbar";

import {
  AssessmentProvider,
  useAssessment,
} from "../../context/AssessmentContext";

const stepNames = [
  "Personal Information",
  "Lifestyle Assessment",
  "Medical History",
];

function AssessmentContent() {
  const [activeStep, setActiveStep] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState(0);

  const {
    assessmentData,
    resetAssessment,
  } = useAssessment();

  const steps = [
    <PersonalInfoForm key="personal" />,
    <LifestyleForm key="lifestyle" />,
    <MedicalHistoryForm key="medical" />,
  ];

  const currentStepName = stepNames[activeStep];

  const progressPercentage =
    ((activeStep + 1) / steps.length) * 100;

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

  const startAnalysis = () => {
    setShowAnalysis(true);
    setShowResult(false);
    setAnalysisProgress(0);
    setAnalysisStage(0);
  };

  useEffect(() => {
    if (!showAnalysis) {
      return undefined;
    }

    const progressTimer = setInterval(() => {
      setAnalysisProgress((previous) => {
        const next = previous + 10;

        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }

        return next;
      });
    }, 220);

    const stageTimer = setInterval(() => {
      setAnalysisStage((previous) => {
        return Math.min(previous + 1, 3);
      });
    }, 750);

    const resultTimer = setTimeout(() => {
      setShowAnalysis(false);
      setShowResult(true);
    }, 2500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
      clearTimeout(resultTimer);
    };
  }, [showAnalysis]);

  const handleEditAssessment = () => {
    setShowResult(false);
    setShowAnalysis(false);
    setActiveStep(0);
  };

  const handleRetakeAssessment = () => {
    resetAssessment();
    setActiveStep(0);
    setShowAnalysis(false);
    setShowResult(false);
    setAnalysisProgress(0);
    setAnalysisStage(0);
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 4, md: 7 },
          background:
            "radial-gradient(1200px circle at 50% 0%, rgba(37, 99, 235, 0.06) 0%, #F8FAFC 100%)",
        }}
      >
        <Container maxWidth="md">
          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 3, md: 5 },
              border: "1px solid #E2E8F0",
              bgcolor: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
              }}
            >
              <AnimatePresence mode="wait">
                {showAnalysis ? (
                  <motion.div
                    key="analysis"
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -15,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <AnalysisScreen
                      progress={analysisProgress}
                      currentStep={analysisStage}
                    />
                  </motion.div>
                ) : showResult ? (
                  <motion.div
                    key="result"
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -15,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <AssessmentResult
                      onEdit={handleEditAssessment}
                      onRetake={handleRetakeAssessment}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="assessment"
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        textAlign: "center",
                        mb: { xs: 3, md: 4 },
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                          fontSize: {
                            xs: "2rem",
                            sm: "2.5rem",
                            md: "3rem",
                          },
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Osteoporosis Risk Assessment
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          lineHeight: 1.7,
                        }}
                      >
                        Complete the assessment in about 2 minutes.
                      </Typography>
                    </Box>

                    {/* Progress */}
                    <Box
                      sx={{
                        mb: 4,
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid #E2E8F0",
                        bgcolor: "#F8FAFC",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          Step {activeStep + 1} of {steps.length}{" "}
                          • {currentStepName}
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="primary"
                        >
                          {Math.round(progressPercentage)}% Complete
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={progressPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: "#E2E8F0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                          },
                        }}
                      />
                    </Box>

                    <AssessmentStepper
                      activeStep={activeStep}
                    />

                    {/* Current step */}
                    <Box
                      sx={{
                        mt: 4,
                        overflow: "hidden",
                      }}
                    >
                      <AnimatePresence
                        mode="wait"
                        initial={false}
                      >
                        <motion.div
                          key={activeStep}
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -20,
                          }}
                          transition={{
                            duration: 0.25,
                            ease: "easeOut",
                          }}
                        >
                          {steps[activeStep]}
                        </motion.div>
                      </AnimatePresence>
                    </Box>

                    <NavigationButtons
                      activeStep={activeStep}
                      setActiveStep={setActiveStep}
                      totalSteps={steps.length}
                      isStepValid={isStepValid()}
                      onSubmit={startAnalysis}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
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