import { useEffect, useRef, useState } from "react";

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
import AssessmentEntryChoice from "../../components/assessment/AssessmentEntryChoice";

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
  const [entryMode, setEntryMode] = useState("choice");

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState(0);

  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState("");

  const analysisRef = useRef(null);

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

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const hasValue = (value) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "";

  const isValidNumber = (value, min, max) => {
    if (!hasValue(value)) {
      return false;
    }

    const number = Number(value);

    return (
      Number.isFinite(number) &&
      number >= min &&
      number <= max
    );
  };

  // ---------------------------------------------------------
  // PROGRESS
  // ---------------------------------------------------------

  const getProgressPercentage = () => {
    const {
      personal,
      lifestyle,
      medicalHistory,
    } = assessmentData;

    const personalFields = [
      hasValue(personal.name),
      hasValue(personal.gender),
      hasValue(personal.raceEthnicity),
      isValidNumber(personal.age, 18, 120),
      isValidNumber(personal.height, 50, 250),
      isValidNumber(personal.weight, 20, 300),
      isValidNumber(personal.waist, 40, 200),
      isValidNumber(personal.hip, 40, 200),
    ];

    const lifestyleFields = [
      hasValue(lifestyle.smoked100Cigarettes),
      hasValue(lifestyle.alcoholEver),
      hasValue(lifestyle.alcoholFrequency),
      hasValue(lifestyle.vigorousWorkActivity),
      hasValue(lifestyle.moderateWorkActivity),
      hasValue(lifestyle.walkOrBicycle),
      hasValue(lifestyle.vigorousRecreation),
      hasValue(lifestyle.moderateRecreation),
      isValidNumber(
        lifestyle.sedentaryMinutes,
        0,
        1440
      ),
    ];

    const medicalFields = [
      hasValue(
        medicalHistory.otherBoneFractureAfter20
      ),
      hasValue(
        medicalHistory.longTermSteroidUse
      ),
      hasValue(
        medicalHistory.parentOsteoporosisHistory
      ),
      hasValue(
        medicalHistory.motherHipFracture
      ),
      hasValue(
        medicalHistory.fatherHipFracture
      ),
    ];

    const totalFields =
      personalFields.length +
      lifestyleFields.length +
      medicalFields.length;

    const completedFields =
      personalFields.filter(Boolean).length +
      lifestyleFields.filter(Boolean).length +
      medicalFields.filter(Boolean).length;

    return totalFields
      ? Math.round(
          (completedFields / totalFields) * 100
        )
      : 0;
  };

  const progressPercentage =
    getProgressPercentage();

  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  const isStepValid = () => {
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

      return (
        hasValue(name) &&
        hasValue(gender) &&
        hasValue(raceEthnicity) &&
        isValidNumber(age, 18, 120) &&
        isValidNumber(height, 50, 250) &&
        isValidNumber(weight, 20, 300) &&
        isValidNumber(waist, 40, 200) &&
        isValidNumber(hip, 40, 200)
      );
    }

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

      return (
        hasValue(smoked100Cigarettes) &&
        hasValue(alcoholEver) &&
        hasValue(alcoholFrequency) &&
        hasValue(vigorousWorkActivity) &&
        hasValue(moderateWorkActivity) &&
        hasValue(walkOrBicycle) &&
        hasValue(vigorousRecreation) &&
        hasValue(moderateRecreation) &&
        isValidNumber(
          sedentaryMinutes,
          0,
          1440
        )
      );
    }

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
  // SUBMIT
  // ---------------------------------------------------------

  const wait = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });

  const handleSubmit = async () => {
    if (
      showAnalysis ||
      !isStepValid()
    ) {
      return;
    }

    setPredictionError("");
    setPredictionResult(null);

    // IMPORTANT:
    // Show Analysis BEFORE starting the API request.
    setShowResult(false);
    setShowAnalysis(true);

    setAnalysisProgress(0);
    setAnalysisStage(0);

    const startedAt = Date.now();

    let progressTimer = null;
    let stageTimer = null;

    try {
      // Animate the Analysis UI.
      progressTimer = setInterval(() => {
        setAnalysisProgress((previous) => {
          if (previous >= 92) {
            return previous;
          }

          return Math.min(
            previous + 4,
            92
          );
        });
      }, 160);

      stageTimer = setInterval(() => {
        setAnalysisStage((previous) =>
          Math.min(previous + 1, 3)
        );
      }, 800);

      // Give React a moment to render the Analysis screen
      // before starting the request.
      await wait(120);

      const result = await predictAssessment(
        assessmentData
      );

      // Keep Analysis visible for at least 3 seconds.
      const minimumDisplayTime = 3000;

      const elapsed =
        Date.now() - startedAt;

      if (
        elapsed <
        minimumDisplayTime
      ) {
        await wait(
          minimumDisplayTime - elapsed
        );
      }

      clearInterval(progressTimer);
      clearInterval(stageTimer);

      setAnalysisProgress(100);
      setAnalysisStage(3);

      await wait(250);

      const dashboardRecord = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        savedAt: new Date().toISOString(),
        assessmentData,
        predictionResult: result,
      };

      try {
        localStorage.setItem(
          "osteoai_latest_assessment",
          JSON.stringify(dashboardRecord)
        );

        const storedHistory =
          localStorage.getItem(
            "osteoai_assessment_history"
          );

        let history = [];

        try {
          const parsedHistory = storedHistory
            ? JSON.parse(storedHistory)
            : [];

          history = Array.isArray(parsedHistory)
            ? parsedHistory
            : [];
        } catch (historyError) {
          console.warn(
            "OsteoAI assessment history could not be parsed:",
            historyError
          );
          history = [];
        }

        const updatedHistory = [
          dashboardRecord,
          ...history,
        ].slice(0, 25);

        localStorage.setItem(
          "osteoai_assessment_history",
          JSON.stringify(updatedHistory)
        );

        window.dispatchEvent(
          new Event("osteoai:assessment-updated")
        );
      } catch (storageError) {
        console.warn(
          "OsteoAI dashboard storage unavailable:",
          storageError
        );
      }

      setPredictionResult(result);
      setShowAnalysis(false);
      setShowResult(true);
    } catch (error) {
      if (progressTimer) {
        clearInterval(progressTimer);
      }

      if (stageTimer) {
        clearInterval(stageTimer);
      }

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
  // ASSESSMENT ENTRY MODE
  // ---------------------------------------------------------

  const handleSelfFill = () => {
    setEntryMode("self");
    setActiveStep(0);
    setPredictionError("");
  };

  const handleAIAutofill = () => {
    setEntryMode("ai");
    setPredictionError("");
  };

  const handleBackToEntryChoice = () => {
    setEntryMode("choice");
    setPredictionError("");
  };

  // ---------------------------------------------------------
  // EDIT / RETAKE
  // ---------------------------------------------------------

  const handleEditAssessment = () => {
    setEntryMode("self");
    setActiveStep(0);
    setShowResult(false);
    setPredictionError("");
  };

  const handleRetakeAssessment = () => {
    resetAssessment();

    setActiveStep(0);
    setEntryMode("choice");

    setShowAnalysis(false);
    setShowResult(false);

    setAnalysisProgress(0);
    setAnalysisStage(0);

    setPredictionResult(null);
    setPredictionError("");
  };

  // ---------------------------------------------------------
  // NORMAL FORM SCROLLING
  // DO NOT CHANGE NAVBAR BEHAVIOR
  // ---------------------------------------------------------

  useEffect(() => {
    if (
      showAnalysis ||
      showResult
    ) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [
    activeStep,
    showAnalysis,
    showResult,
  ]);

  // ---------------------------------------------------------
  // ANALYSIS-ONLY SCROLL
  // Navbar itself is NOT modified.
  // ---------------------------------------------------------

  useEffect(() => {
    if (!showAnalysis) {
      return;
    }

    const timer = setTimeout(() => {
      const element = analysisRef.current;

      if (!element) {
        return;
      }

      // Put the Analysis screen near the top of the content,
      // but leave enough space for the existing Navbar.
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);

    return () => {
      clearTimeout(timer);
    };
  }, [showAnalysis]);

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
          py: {
            xs: 3,
            md: 5,
          },
          background:
            "radial-gradient(1200px circle at 50% 0%, rgba(37, 99, 235, 0.06) 0%, #F8FAFC 100%)",
        }}
      >
        <Container maxWidth="md">
          {predictionError && (
            <Alert
              severity="error"
              onClose={() =>
                setPredictionError("")
              }
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
              borderRadius: {
                xs: 3,
                md: 5,
              },
              border:
                "1px solid #E2E8F0",
              bgcolor:
                "rgba(255,255,255,0.94)",
              backdropFilter:
                "blur(10px)",
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  sm: 4,
                  md: 5,
                },
              }}
            >
              <AnimatePresence mode="wait">
                {showAnalysis ? (
                  <motion.div
                    key="analysis"
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -12,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >
                    <Box
                      ref={analysisRef}
                      sx={{
                        width: "100%",
                        scrollMarginTop: {
                          xs: "80px",
                          md: "95px",
                        },
                      }}
                    >
                      <AnalysisScreen
                        progress={
                          analysisProgress
                        }
                        currentStep={
                          analysisStage
                        }
                      />
                    </Box>
                  </motion.div>
                ) : showResult ? (
                  <motion.div
                    key="result"
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -12,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  >
                    <AssessmentResult
                      predictionResult={
                        predictionResult
                      }
                      onEdit={
                        handleEditAssessment
                      }
                      onRetake={
                        handleRetakeAssessment
                      }
                    />
                  </motion.div>
                ) : entryMode === "choice" ? (
                  <motion.div
                    key="entry-choice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AssessmentEntryChoice
                      onSelfFill={handleSelfFill}
                      onAIAutofill={handleAIAutofill}
                    />
                  </motion.div>
                ) : entryMode === "ai" ? (
                  <motion.div
                    key="ai-entry"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AssessmentEntryChoice
                      mode="ai"
                      onSelfFill={handleSelfFill}
                      onAIAutofill={handleAIAutofill}
                      onBack={handleBackToEntryChoice}
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
                    <Box
                      sx={{
                        textAlign: "center",
                        mb: {
                          xs: 3,
                          md: 4,
                        },
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
                          letterSpacing:
                            "-0.02em",
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
                        border:
                          "1px solid #E2E8F0",
                        bgcolor:
                          "#F8FAFC",
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: 2,
                          mb: 1,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={
                            700
                          }
                        >
                          Step{" "}
                          {activeStep +
                            1}{" "}
                          of{" "}
                          {
                            steps.length
                          }{" "}
                          •{" "}
                          {
                            currentStepName
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={
                            700
                          }
                          color="primary"
                        >
                          {
                            progressPercentage
                          }
                          % Complete
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={
                          progressPercentage
                        }
                        sx={{
                          height: 8,
                          borderRadius:
                            999,
                          bgcolor:
                            "#E2E8F0",
                          "& .MuiLinearProgress-bar":
                            {
                              borderRadius:
                                999,
                            },
                        }}
                      />
                    </Box>

                    <AssessmentStepper
                      activeStep={
                        activeStep
                      }
                    />

                    <Box
                      sx={{
                        mt: 4,
                        overflow:
                          "hidden",
                      }}
                    >
                      <AnimatePresence
                        mode="wait"
                        initial={
                          false
                        }
                      >
                        <motion.div
                          key={
                            activeStep
                          }
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
                          }}
                        >
                          {
                            steps[
                              activeStep
                            ]
                          }
                        </motion.div>
                      </AnimatePresence>
                    </Box>

                    <NavigationButtons
                      activeStep={
                        activeStep
                      }
                      setActiveStep={
                        setActiveStep
                      }
                      totalSteps={
                        steps.length
                      }
                      isStepValid={isStepValid()}
                      onSubmit={
                        handleSubmit
                      }
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