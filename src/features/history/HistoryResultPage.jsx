import { useParams, useNavigate } from "react-router-dom";

import { Button, Card, Chip, Stack, Typography } from "@mui/material";

import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";

import PageShell from "../../components/common/PageShell";
import AssessmentResult from "../../components/assessment/AssessmentResult";
import { AssessmentProvider } from "../../context/AssessmentContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate, getHistoryRecord } from "../../services/historyStore";

/*
 * Re-opens a saved assessment on the standard result screen,
 * including SHAP factors and the Ask OsteoAI assistant.
 */
function HistoryResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const record = getHistoryRecord(id);

  if (!record) {
    return (
      <PageShell
        icon={<HistoryIcon />}
        title={t("history.notFoundTitle")}
        subtitle={t("history.notFoundSubtitle")}
      >
        <Card sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/history")}
            sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none" }}
          >
            {t("history.backToHistoryButton")}
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={<AssessmentIcon />}
      title={t("history.pastAssessmentTitle")}
      subtitle={t("history.savedOnSubtitle", { date: formatDate(record.savedAt, true) })}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip label={t("history.readOnlyChip")} size="small" />
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate("/history")}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3 }}
          >
            {t("history.allAssessmentsButton")}
          </Button>
        </Stack>
      }
    >
      <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
        {t("history.viewingSavedNote")}
      </Typography>

      <AssessmentProvider initialData={record.assessmentData}>
        <AssessmentResult
          predictionResult={record.predictionResult}
          onRetake={() => navigate("/assessment")}
        />
      </AssessmentProvider>
    </PageShell>
  );
}

export default HistoryResultPage;
