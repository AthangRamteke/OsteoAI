import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import { useLanguage } from "../../context/LanguageContext";
import { streamAgentMessage } from "../../services/agentService";
import {
  DOCUMENTS_UPDATED_EVENT,
  deleteDocument,
  getDocuments,
  getHealthSummary,
  saveHealthSummary,
} from "../../services/documentStore";
import { formatDate, historyForAgent } from "../../services/historyStore";

/*
 * Reports & Documents.
 *
 * Two real capabilities: the documents the user has accepted for
 * autofill, and an AI-written health summary they can copy or download
 * to take to a doctor.
 */
function ReportsDocumentsCard({ surfaceSx, latestAssessment, assessmentHistory }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [documents, setDocuments] = useState(getDocuments);
  const [summary, setSummary] = useState(getHealthSummary);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setDocuments(getDocuments());

    window.addEventListener(DOCUMENTS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(DOCUMENTS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const generateSummary = useCallback(async () => {
    setGenerating(true);
    setError("");

    let text = "";

    try {
      await streamAgentMessage({
        message: t("dashboard.summaryPrompt"),
        predictionResult: latestAssessment?.predictionResult || {},
        assessmentHistory: historyForAgent(assessmentHistory),
        language,
        onEvent: (event) => {
          if (event.type === "done") {
            text = event.message;
          }
        },
      });

      setSummary(saveHealthSummary(text));
    } catch (summaryError) {
      setError(summaryError?.message || t("dashboard.summaryFailed"));
    } finally {
      setGenerating(false);
    }
  }, [latestAssessment, assessmentHistory, language, t]);

  const downloadSummary = () => {
    const header = `OsteoAI ${t("dashboard.generatedSummaryTitle")}\n${formatDate(
      summary.createdAt,
      true
    )}\n\n`;

    const blob = new Blob([header + summary.text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "osteoai-health-summary.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  const hasResult = Boolean(latestAssessment?.predictionResult);

  return (
    <Box sx={{ ...surfaceSx, p: { xs: 2.5, md: 3 }, height: "100%" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#EEF4FF",
            color: "#2563EB",
          }}
        >
          <DescriptionIcon />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
            {t("dashboard.reportsDocsTitle")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            {t("dashboard.reportsDocsSubtitle")}
          </Typography>
        </Box>
      </Stack>

      {/* ---------- Uploaded documents ---------- */}
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mt: 2.4, mb: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 800, color: "#334155" }}>
          {t("dashboard.documentIntelligenceTitle")}
        </Typography>
        <Button
          size="small"
          startIcon={<UploadFileIcon sx={{ fontSize: 17 }} />}
          onClick={() => navigate("/assessment")}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {t("dashboard.documentsUpload")}
        </Button>
      </Stack>

      {documents.length ? (
        <Stack spacing={1}>
          {documents.slice(0, 3).map((document) => (
            <Stack
              key={document.id}
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                p: 1.5,
                borderRadius: 3,
                bgcolor: "#F8FAFC",
                border: "1px solid #EDF2F7",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "#0F172A",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {document.filename}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  {formatDate(document.savedAt)} ·{" "}
                  {t("dashboard.documentsFound", { count: document.foundCount })}
                  {document.reviewCount
                    ? ` · ${t("dashboard.documentsReview", {
                        count: document.reviewCount,
                      })}`
                    : ""}
                </Typography>
              </Box>

              <Tooltip title={t("dashboard.documentsAskAi")}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    navigate(
                      `/assistant?q=${encodeURIComponent(
                        t("dashboard.documentsAskQuestion", {
                          name: document.filename,
                        })
                      )}`
                    )
                  }
                >
                  <AutoAwesomeIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={t("dashboard.documentsDelete")}>
                <IconButton
                  size="small"
                  onClick={() => setDocuments(deleteDocument(document.id))}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#F8FAFC",
            border: "1px dashed #CBD5E1",
          }}
        >
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            {t("dashboard.documentsEmpty")}
          </Typography>
        </Box>
      )}

      {/* ---------- Generated health summary ---------- */}
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mt: 2.6, mb: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 800, color: "#334155" }}>
          {t("dashboard.generatedSummaryTitle")}
        </Typography>
        {summary && (
          <Chip
            size="small"
            label={formatDate(summary.createdAt)}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>

      {summary ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#F8FAFC",
            border: "1px solid #EDF2F7",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#334155",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              maxHeight: 190,
              overflowY: "auto",
            }}
          >
            {summary.text}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
            <Button
              size="small"
              startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigator.clipboard?.writeText(summary.text)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {t("dashboard.summaryCopy")}
            </Button>
            <Button
              size="small"
              startIcon={<DownloadIcon sx={{ fontSize: 17 }} />}
              onClick={downloadSummary}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {t("dashboard.summaryDownload")}
            </Button>
            <Button
              size="small"
              disabled={generating}
              onClick={generateSummary}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {t("dashboard.summaryRegenerate")}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#F8FAFC",
            border: "1px solid #EDF2F7",
          }}
        >
          <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 1.3 }}>
            {hasResult
              ? t("dashboard.summaryIntro")
              : t("dashboard.summaryNeedsAssessment")}
          </Typography>

          <Button
            variant="contained"
            size="small"
            disabled={!hasResult || generating}
            startIcon={
              generating ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <AutoAwesomeIcon sx={{ fontSize: 17 }} />
              )
            }
            onClick={generateSummary}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, boxShadow: "none" }}
          >
            {generating
              ? t("dashboard.summaryGenerating")
              : t("dashboard.summaryGenerate")}
          </Button>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1.5 }}>
        {t("dashboard.summaryDisclaimer")}
      </Typography>
    </Box>
  );
}

export default ReportsDocumentsCard;
