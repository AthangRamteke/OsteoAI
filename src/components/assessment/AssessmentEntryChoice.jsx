import { useRef, useState } from "react";
import { useAssessment } from "../../context/AssessmentContext";

import CircularProgress from "@mui/material/CircularProgress";
import AutofillReview from "./AutofillReview";
import { extractAssessmentDocument } from "../../services/documentExtractionService";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

const ChoiceIcon = ({ type }) => {
  if (type === "ai") {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 9.5C8 7.57 9.57 6 11.5 6H12.5C14.43 6 16 7.57 16 9.5V14.5C16 16.43 14.43 18 12.5 18H11.5C9.57 18 8 16.43 8 14.5V9.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M6 11V14M18 11V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 2V6M14 2V6M10 18V22M14 18V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10.5" cy="12" r="0.8" fill="currentColor" />
        <circle cx="13.5" cy="12" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4.5C6 3.67 6.67 3 7.5 3H16.5C17.33 3 18 3.67 18 4.5V19.5C18 20.33 17.33 21 16.5 21H7.5C6.67 21 6 20.33 6 19.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 8H15M9 12H15M9 16H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

const UploadIcon = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 16V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8 8L12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 13V18.5C5 19.33 5.67 20 6.5 20H17.5C18.33 20 19 19.33 19 18.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M11 6L5 12L11 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 3.5H13.5L18 8V20.5H7C5.9 20.5 5 19.6 5 18.5V5.5C5 4.4 5.9 3.5 7 3.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M13 3.5V8.5H18" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M8 12H15M8 15.5H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const RemoveIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 7H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 7V5H15V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7L8.7 19H15.3L16 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10.5 10.5V16M13.5 10.5V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function ChoiceCard({ iconType, title, description, eyebrow, actionLabel, onClick, muted = false }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: muted ? "1px dashed #CBD5E1" : "1px solid #DBEAFE",
        bgcolor: muted ? "#F8FAFC" : "white",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": muted
          ? undefined
          : {
              transform: "translateY(-3px)",
              borderColor: "#93C5FD",
              boxShadow: "0 16px 34px rgba(37,99,235,0.10)",
            },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.25 } }}>
        <Stack spacing={2.3} sx={{ height: "100%" }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: muted ? "#64748B" : "#2563EB",
              bgcolor: muted ? "#EEF2F7" : "#EEF4FF",
            }}
          >
            <ChoiceIcon type={iconType} />
          </Box>

          <Box>
            <Typography
              variant="overline"
              sx={{
                color: muted ? "#94A3B8" : "#2563EB",
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mt: 0.35,
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.8,
                color: "#64748B",
                lineHeight: 1.7,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Box sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant={muted ? "outlined" : "contained"}
              disabled={muted}
              onClick={onClick}
              endIcon={!muted ? <ArrowIcon /> : undefined}
              sx={{
                py: 1.15,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {actionLabel}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function AssessmentEntryChoice({ mode = "choice", onSelfFill, onAIAutofill, onBack }) {
  const { updatePersonal, updateLifestyle, updateMedicalHistory } = useAssessment();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMessage, setFileMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);

  if (mode === "ai") {
    const handleFileChange = (event) => {
      const file = event.target.files?.[0] || null;
      setFileMessage("");

      if (!file) {
        return;
      }

      setSelectedFile(file);
      event.target.value = "";
    };

    const handleRemoveFile = () => {
      setSelectedFile(null);
      setFileMessage("");
      setExtractionResult(null);
    };

    const handleConfirmAutofill = () => {
      const extracted = extractionResult?.assessment_data;

      if (!extracted) {
        setFileMessage(
          "No assessment data was returned from the document."
        );
        return;
      }

      try {
        // The document extractor stores model-friendly binary values as
        // "1" / "0", while the assessment cards use "Yes" / "No".
        // Normalize those values here at the AI -> form boundary so the
        // existing Lifestyle and Medical forms can show the correct
        // selected card without changing their working UI.
        const binaryKeys = new Set([
          "smoked100Cigarettes",
          "alcoholEver",
          "vigorousWorkActivity",
          "moderateWorkActivity",
          "walkOrBicycle",
          "vigorousRecreation",
          "moderateRecreation",
          "otherBoneFractureAfter20",
          "longTermSteroidUse",
          "parentOsteoporosisHistory",
          "motherHipFracture",
          "fatherHipFracture",
        ]);

        const normalizeBinaryChoice = (value, fieldValue) => {
          const candidates = [fieldValue, value];

          for (const candidate of candidates) {
            if (candidate === null || candidate === undefined) {
              continue;
            }

            const normalized = String(candidate).trim().toLowerCase();

            if (["yes", "y", "true", "1"].includes(normalized)) {
              return "Yes";
            }

            if (["no", "n", "false", "0"].includes(normalized)) {
              return "No";
            }
          }

          return null;
        };

        const safeSection = (section = {}, fields = []) =>
          fields.reduce((approved, field) => {
            const status = field?.status;

            if (
              status === "manual_mapping_required" ||
              status === "reference_only"
            ) {
              return approved;
            }

            const key = field?.key;

            if (!key || !Object.prototype.hasOwnProperty.call(section, key)) {
              return approved;
            }

            const rawValue = section[key];

            if (
              rawValue === null ||
              rawValue === undefined ||
              String(rawValue).trim() === ""
            ) {
              return approved;
            }

            if (binaryKeys.has(key)) {
              const binaryValue = normalizeBinaryChoice(rawValue, field?.value);

              // Never insert an ambiguous binary value. The user can choose
              // it manually in the assessment form instead.
              if (binaryValue !== null) {
                approved[key] = binaryValue;
              }

              return approved;
            }

            approved[key] = rawValue;
            return approved;
          }, {});

        const fields = Array.isArray(extractionResult?.fields)
          ? extractionResult.fields
          : [];

        const personalFields = fields.filter(
          (field) => field.section === "personal"
        );
        const lifestyleFields = fields.filter(
          (field) => field.section === "lifestyle"
        );
        const medicalFields = fields.filter(
          (field) => field.section === "medical"
        );

        const personal = safeSection(
          extracted.personal,
          personalFields
        );
        const lifestyle = safeSection(
          extracted.lifestyle,
          lifestyleFields
        );
        const medicalHistory = safeSection(
          extracted.medicalHistory,
          medicalFields
        );

        if (
          Object.keys(personal).length > 0 &&
          typeof updatePersonal === "function"
        ) {
          updatePersonal(personal);
        }

        if (
          Object.keys(lifestyle).length > 0 &&
          typeof updateLifestyle === "function"
        ) {
          updateLifestyle(lifestyle);
        }

        if (
          Object.keys(medicalHistory).length > 0 &&
          typeof updateMedicalHistory === "function"
        ) {
          updateMedicalHistory(medicalHistory);
        }

        onSelfFill?.();
      } catch (error) {
        console.error(
          "OsteoAI autofill confirmation failed:",
          error
        );

        setFileMessage(
          "The extracted information could not be added to the assessment. Please use Self-Fill."
        );
      }
    };

    const handleSelectDocument = () => {
      setFileMessage("");
      fileInputRef.current?.click();
    };

    const handleAnalyze = async () => {
      if (!selectedFile) {
        setFileMessage("Please choose a document first.");
        return;
      }

      setFileMessage("");
      setExtractionResult(null);
      setIsAnalyzing(true);

      try {
        const result = await extractAssessmentDocument(selectedFile);
        setExtractionResult(result);
      } catch (error) {
        console.error(
          "OsteoAI document extraction failed:",
          error
        );
        setFileMessage(
          error?.message ||
            "Unable to analyze this document. Please try again."
        );
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (extractionResult) {
      return (
        <AutofillReview
          result={extractionResult}
          fileName={selectedFile?.name || "selected document"}
          onBack={() => setExtractionResult(null)}
          onContinue={handleConfirmAutofill}
        />
      );
    }

    return (
      <Box>
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Chip
            label="AI ASSISTANT"
            size="small"
            sx={{
              mb: 1.2,
              fontWeight: 800,
              color: "#1D4ED8",
              bgcolor: "#EEF4FF",
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: { xs: "2rem", sm: "2.4rem", md: "2.8rem" },
            }}
          >
            Autofill your assessment
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1, lineHeight: 1.7, maxWidth: 700, mx: "auto" }}
          >
            Upload a health report or document. The AI Assistant will extract relevant information,
            show you what it found, and let you confirm the values before they are used in the assessment.
          </Typography>
        </Box>

        <Box
          sx={{
            border: "1.5px dashed #93C5FD",
            borderRadius: 4,
            bgcolor: "#F8FBFF",
            p: { xs: 3, md: 4 },
            textAlign: "center",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />

          {!selectedFile ? (
            <>
              <Box
                sx={{
                  mx: "auto",
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563EB",
                  bgcolor: "#EEF4FF",
                }}
              >
                <UploadIcon />
              </Box>

              <Typography sx={{ mt: 2, fontWeight: 800, color: "#0F172A" }}>
                Choose a document
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.6, color: "#64748B" }}>
                PDF, DOC, DOCX, JPG, JPEG, or PNG
              </Typography>

              <Button
                variant="contained"
                onClick={handleSelectDocument}
                sx={{
                  mt: 2.2,
                  px: 2.6,
                  py: 1.15,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Select Document
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: "left" }}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1.3,
                  color: "#475569",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Selected document
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.7,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid #DBEAFE",
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563EB",
                    bgcolor: "#EEF4FF",
                  }}
                >
                  <FileIcon />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: "#0F172A",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1.6 }}>
                <Button
                  variant="outlined"
                  onClick={handleSelectDocument}
                  startIcon={<UploadIcon size={18} />}
                  sx={{
                    flex: 1,
                    py: 1.05,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Change Document
                </Button>
                <Button
                  variant="text"
                  onClick={handleRemoveFile}
                  startIcon={<RemoveIcon />}
                  sx={{
                    minWidth: { sm: 135 },
                    py: 1.05,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                    color: "#64748B",
                    "&:hover": {
                      color: "#DC2626",
                      bgcolor: "#FEF2F2",
                    },
                  }}
                >
                  Remove
                </Button>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                startIcon={
                  isAnalyzing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <UploadIcon size={18} />
                  )
                }
                sx={{
                  mt: 1.6,
                  py: 1.15,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                {isAnalyzing ? "Analyzing Document..." : "Analyze Document"}
              </Button>
            </Box>
          )}
        </Box>

        <Alert severity="info" icon={false} sx={{ mt: 2.2, borderRadius: 3 }}>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            AI-assisted values will be shown for your review before they are used. Document extraction
            does not run the osteoporosis prediction model.
          </Typography>
        </Alert>

        {fileMessage && (
          <Alert
            severity="info"
            icon={false}
            sx={{
              mt: 1.4,
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
              {fileMessage}
            </Typography>
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={onBack}
            sx={{
              flex: 1,
              py: 1.15,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            onClick={onSelfFill}
            sx={{
              flex: 1,
              py: 1.15,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Continue with Self-Fill
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: { xs: 3.5, md: 4.5 } }}>
        <Chip
          label="BEFORE YOU START"
          size="small"
          sx={{
            mb: 1.2,
            fontWeight: 800,
            color: "#1D4ED8",
            bgcolor: "#EEF4FF",
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          How would you like to fill your assessment?
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 1, lineHeight: 1.7, maxWidth: 700, mx: "auto" }}
        >
          Choose the way that is easiest for you. You can always review and edit the information
          before OsteoAI runs the assessment.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.2}
        sx={{ alignItems: "stretch" }}
      >
        <Box sx={{ flex: 1 }}>
          <ChoiceCard
            iconType="ai"
            eyebrow="SMART OPTION"
            title="AI Assistant Autofill"
            description="Upload a health report or document and use the AI Assistant to extract relevant assessment information for your review."
            actionLabel="Use AI Autofill"
            onClick={onAIAutofill}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <ChoiceCard
            iconType="self"
            eyebrow="MANUAL OPTION"
            title="Fill It Myself"
            description="Enter your information yourself through the normal OsteoAI assessment. You remain in control of every value."
            actionLabel="Fill It Myself"
            onClick={onSelfFill}
          />
        </Box>
      </Stack>

      <Box
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: 3,
          bgcolor: "#F8FAFC",
          border: "1px solid #E2E8F0",
        }}
      >
        <Typography variant="caption" sx={{ color: "#64748B", lineHeight: 1.7 }}>
          AI-assisted entries will be reviewed by you before they are used. The assessment remains a
          research/prototype risk estimate and is not a medical diagnosis.
        </Typography>
      </Box>
    </Box>
  );
}

export default AssessmentEntryChoice;
