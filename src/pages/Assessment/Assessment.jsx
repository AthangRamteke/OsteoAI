import { useEffect, useState } from "react";

import {
  Alert,
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

import { predictAssessment } from "../../services/predictionService";

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

  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState("");

  const { assessmentData, resetAssessment } = useAssessment();

  const steps = [
    <PersonalInfoForm key="personal" />,
    <LifestyleForm key="lifestyle" />,
    <MedicalHistoryForm key="medical" />,
  ];

  const currentStepName = stepNames[activeStep];

  const progressPercentage =
    ((activeStep + 1) / steps.length) * 100;

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const hasValue = (value) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "";

  const isStepValid = () => {
    // PERSONAL INFORMATION
    if (activeStep === 0) {
      const {
        name,
        age,
        gender,
        raceEthnicity,
        height,
        weight,
        waist,
        hip,
      } = assessmentData.personal;

      // First require every field to actually contain a value.
      if (
        !hasValue(name) ||
        !hasValue(age) ||
        !hasValue(gender) ||
        !hasValue(raceEthnicity) ||
        !hasValue(height) ||
        !hasValue(weight) ||
        !hasValue(waist) ||
        !hasValue(hip)
      ) {
        return false;
      }

      const ageNumber = Number(age);
      const heightNumber = Number(height);
      const weightNumber = Number(weight);
      const waistNumber = Number(waist);
      const hipNumber = Number(hip);

      return (
        Number.isFinite(ageNumber) &&
        ageNumber >= 18 &&
        ageNumber <= 120 &&
        Number.isFinite(heightNumber) &&
        heightNumber >= 50 &&
        heightNumber <= 250 &&
        Number.isFinite(weightNumber) &&
        weightNumber >= 20 &&
        weightNumber <= 300 &&
        Number.isFinite(waistNumber) &&
        waistNumber >= 40 &&
        waistNumber <= 200 &&
        Number.isFinite(hipNumber) &&
        hipNumber >= 40 &&
        hipNumber <= 200
      );
    }

    // LIFESTYLE
    if (activeStep === 1) {
      const {
        smoked100Cigarettes,
        alcoholEver,
        alcoholFrequency,
        vigorousWorkActivity,
        moderateWorkActivity,
        walkOrBicycle,
        vigorousRecreation,
        moderateRecreation,
        sedentaryMinutes,
      } = assessmentData.lifestyle;

      console.log("LIFESTYLE STATE:", {
        smoked100Cigarettes,
        alcoholEver,
        alcoholFrequency,
        vigorousWorkActivity,
        moderateWorkActivity,
        walkOrBicycle,
        vigorousRecreation,
        moderateRecreation,
        sedentaryMinutes,
      });

      if (
        !hasValue(smoked100Cigarettes) ||
        !hasValue(alcoholEver) ||
        !hasValue(alcoholFrequency) ||
        !hasValue(vigorousWorkActivity) ||
        !hasValue(moderateWorkActivity) ||
        !hasValue(walkOrBicycle) ||
        !hasValue(vigorousRecreation) ||
        !hasValue(moderateRecreation) ||
        !hasValue(sedentaryMinutes)
      ) {
        return false;
      }

      const sedentaryNumber = Number(sedentaryMinutes);

      return (
        Number.isFinite(sedentaryNumber) &&
        sedentaryNumber >= 0 &&
        sedentaryNumber <= 1440
      );
    }

    // MEDICAL HISTORY
    if (activeStep === 2) {
      const {
        otherBoneFractureAfter20,
        longTermSteroidUse,
        parentOsteoporosisHistory,
        motherHipFracture,
        fatherHipFracture,
      } = assessmentData.medicalHistory;

      return (
        hasValue(otherBoneFractureAfter20) &&
        hasValue(longTermSteroidUse) &&
        hasValue(parentOsteoporosisHistory) &&
        hasValue(motherHipFracture) &&
        hasValue(fatherHipFracture)
      );
    }

    return false;
  };

  // ---------------------------------------------------------
  // API SUBMISSION
  // ---------------------------------------------------------

  const wait = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });

  const handleSubmit = async () => {
    if (showAnalysis || !isStepValid()) {
      return;
    }

    setPredictionError("");
    setPredictionResult(null);

    setShowResult(false);
    setShowAnalysis(true);

    setAnalysisProgress(0);
    setAnalysisStage(0);

    const startedAt = Date.now();

    let progressTimer;
    let stageTimer;

    try {
      progressTimer = setInterval(() => {
        setAnalysisProgress((previous) => {
          if (previous >= 92) {
            return previous;
          }

          return Math.min(previous + 6, 92);
        });
      }, 120);

      stageTimer = setInterval(() => {
        setAnalysisStage((previous) =>
          Math.min(previous + 1, 3)
        );
      }, 500);

      const result = await predictAssessment(
        assessmentData
      );

      const elapsed = Date.now() - startedAt;
      const minimumDisplayTime = 1200;

      if (elapsed < minimumDisplayTime) {
        await wait(minimumDisplayTime - elapsed);
      }

      clearInterval(progressTimer);
      clearInterval(stageTimer);

      setAnalysisProgress(100);
      setAnalysisStage(3);

      await wait(250);

      setPredictionResult(result);
      setShowAnalysis(false);
      setShowResult(true);
    } catch (error) {
      clearInterval(progressTimer);
      clearInterval(stageTimer);

      console.error(
        "OsteoAI prediction request failed:",
        error
      );

      setShowAnalysis(false);

      setPredictionError(
        error?.message ||
        "Unable to complete the assessment. Please try again."
      );
    }
  };

  // ---------------------------------------------------------
  // RESULT ACTIONS
  // ---------------------------------------------------------

  const handleEditAssessment = () => {
    setShowResult(false);
    setPredictionError("");
  };

  const handleRetakeAssessment = () => {
    resetAssessment();

    setActiveStep(0);
    setShowAnalysis(false);
    setShowResult(false);

    setAnalysisProgress(0);
    setAnalysisStage(0);

    setPredictionResult(null);
    setPredictionError("");
  };

  // ---------------------------------------------------------
  // SCROLL BEHAVIOR
  // ---------------------------------------------------------

  // When the assessment page first opens.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Whenever the user moves between assessment steps.
  useEffect(() => {
    if (showAnalysis || showResult) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeStep, showAnalysis, showResult]);

  // Analysis screen.
  useEffect(() => {
    if (!showAnalysis) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [showAnalysis]);

  // Result screen.
  useEffect(() => {
    if (!showResult) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [showResult]);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

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
          {predictionError && (
            <Alert
              severity="error"
              onClose={() => setPredictionError("")}
              sx={{
                mb: 2,
                borderRadius: 3,
              }}
            >
              {predictionError}
            </Alert>
          )}

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
                      predictionResult={predictionResult}
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
                          Step {activeStep + 1} of {steps.length} •{" "}
                          {currentStepName}
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
                      onSubmit={handleSubmit}
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