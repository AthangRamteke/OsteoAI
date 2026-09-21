import { useParams, useNavigate } from "react-router-dom";

import { Button, Card, Chip, Stack, Typography } from "@mui/material";

import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";

import PageShell from "../../components/common/PageShell";
import AssessmentResult from "../../components/assessment/AssessmentResult";
import { AssessmentProvider } from "../../context/AssessmentContext";
import { formatDate, getHistoryRecord } from "../../services/historyStore";

/*
 * Re-opens a saved assessment on the standard result screen,
 * including SHAP factors and the Ask OsteoAI assistant.
 */
function HistoryResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = getHistoryRecord(id);

  if (!record) {
    return (
      <PageShell
        icon={<HistoryIcon />}
        title="Assessment not found"
        subtitle="It may have been deleted or saved on another device."
      >
        <Card sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/history")}
            sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none" }}
          >
            Back to history
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={<AssessmentIcon />}
      title="Past assessment"
      subtitle={`Saved ${formatDate(record.savedAt, true)}`}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip label="Read-only" size="small" />
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate("/history")}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3 }}
          >
            All assessments
          </Button>
        </Stack>
      }
    >
      <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
        This is the result exactly as it was saved. Start a new assessment to get an
        updated estimate.
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
