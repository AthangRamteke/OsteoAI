import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageShell from "../../components/common/PageShell";
import { useLanguage } from "../../context/LanguageContext";
import {
  HISTORY_UPDATED_EVENT,
  computeBmi,
  deleteHistoryRecord,
  formatDate,
  getHistory,
  probabilityPercent,
  riskColor,
  riskLevel,
  topFactors,
} from "../../services/historyStore";

const cardSx = {
  borderRadius: 4,
  border: "1px solid var(--oa-border-1)",
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
};

// Model risk levels ("High"/"Moderate"/"Low") come back in English;
// translate for display while keeping the raw value for color/logic.
const translateRiskLevel = (t, level) => t(`common.riskLevels.${level}`) || level;

function askAssistant(navigate, question, recordId) {
  const params = new URLSearchParams({ q: question });

  if (recordId) {
    params.set("record", recordId);
  }

  navigate(`/assistant?${params.toString()}`);
}

/* ---------------------------------------------------------
   Small building blocks
   --------------------------------------------------------- */

function RiskChip({ level }) {
  const { t } = useLanguage();
  const color = riskColor(level);

  return (
    <Chip
      size="small"
      label={t("history.statRiskSuffix", { level: translateRiskLevel(t, level) })}
      sx={{ fontWeight: 700, color: color.main, bgcolor: color.soft }}
    />
  );
}

function DeltaBadge({ delta }) {
  const { t } = useLanguage();

  if (delta === null) {
    return (
      <Typography variant="caption" sx={{ color: "var(--oa-text-400)", fontWeight: 600 }}>
        {t("history.firstAssessment")}
      </Typography>
    );
  }

  const flat = Math.abs(delta) < 0.1;
  const down = delta < 0;
  const Icon = flat ? TrendingFlatIcon : down ? TrendingDownIcon : TrendingUpIcon;
  const color = flat ? "var(--oa-text-500)" : down ? "var(--oa-success)" : "var(--oa-danger)";

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color }}>
      <Icon fontSize="small" />
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {flat
          ? t("history.noChange")
          : t("history.deltaVsPrevious", {
              value: `${down ? "" : "+"}${delta.toFixed(1)}`,
            })}
      </Typography>
    </Stack>
  );
}

function StatCard({ label, value, hint, color = "var(--oa-text-900)" }) {
  return (
    <Card sx={{ ...cardSx, p: 2.25, height: "100%" }}>
      <Typography variant="body2" sx={{ color: "var(--oa-text-500)", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 800, color, mt: 0.5 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: "var(--oa-text-400)" }}>
          {hint}
        </Typography>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------
   Trend chart
   --------------------------------------------------------- */

function TrendChart({ history }) {
  const { t } = useLanguage();

  const data = [...history].reverse().map((record, index) => ({
    name: `#${index + 1}`,
    date: formatDate(record.savedAt),
    probability: Number((probabilityPercent(record) ?? 0).toFixed(1)),
    risk: riskLevel(record),
  }));

  return (
    <Card sx={{ ...cardSx, p: { xs: 2, md: 3 } }}>
      <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
        {t("history.trendTitle")}
      </Typography>
      <Typography variant="body2" sx={{ color: "var(--oa-text-500)", mb: 2 }}>
        {t("history.trendDesc")}
      </Typography>

      <Box sx={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--oa-brand)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--oa-brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--oa-border-1)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--oa-text-500)" }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "var(--oa-text-500)" }}
            />
            <ChartTooltip
              formatter={(value) => [`${value}%`, t("history.chartProbabilityLabel")]}
              labelFormatter={(_, payload) =>
                payload?.[0]
                  ? `${payload[0].payload.date} · ${t("history.statRiskSuffix", {
                      level: translateRiskLevel(t, payload[0].payload.risk),
                    })}`
                  : ""
              }
            />
            <ReferenceLine y={50} stroke="var(--oa-border-4)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="var(--oa-brand)"
              strokeWidth={2.5}
              fill="url(#riskFill)"
              dot={({ cx, cy, payload }) => (
                <circle
                  key={payload.name}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={riskColor(payload.risk).main}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}

/* ---------------------------------------------------------
   Compare two assessments
   --------------------------------------------------------- */

function ComparePanel({ records, onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Oldest first so "before → after" reads naturally.
  const [before, after] = [...records].sort(
    (a, b) => new Date(a.savedAt) - new Date(b.savedAt)
  );

  const rows = [
    {
      label: t("history.tableRowProbability"),
      get: (record) => `${probabilityPercent(record)?.toFixed(1) ?? "-"}%`,
    },
    {
      label: t("history.tableRowRiskLevel"),
      get: (record) => translateRiskLevel(t, riskLevel(record)),
    },
    { label: t("history.tableRowAge"), get: (record) => record.assessmentData?.personal?.age || "-" },
    {
      label: t("history.tableRowBmi"),
      get: (record) => computeBmi(record.assessmentData?.personal)?.toFixed(1) ?? "-",
    },
    {
      label: t("history.tableRowWeight"),
      get: (record) => record.assessmentData?.personal?.weight || "-",
    },
    {
      label: t("history.tableRowSedentary"),
      get: (record) => record.assessmentData?.lifestyle?.sedentaryMinutes || "-",
    },
    {
      label: t("history.tableRowTopFactorsRaising"),
      get: (record) =>
        topFactors(record, 2)
          .raising.map((item) => item.label)
          .join(", ") || "-",
    },
  ];

  const delta =
    (probabilityPercent(after) ?? 0) - (probabilityPercent(before) ?? 0);

  return (
    <Card sx={{ ...cardSx, p: { xs: 2, md: 3 }, borderColor: "var(--oa-border-brand)" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", gap: 1, mb: 2 }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
            {t("history.comparisonTitle")}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--oa-text-500)" }}>
            {formatDate(before.savedAt)} → {formatDate(after.savedAt)} ·{" "}
            <b style={{ color: delta <= 0 ? "var(--oa-success)" : "var(--oa-danger)" }}>
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} {t("history.percentagePoints")}
            </b>
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() =>
              askAssistant(
                navigate,
                `Compare my assessment from ${formatDate(before.savedAt)} with ${formatDate(after.savedAt)}. What changed?`,
                after.id
              )
            }
            sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none", borderRadius: 2.5 }}
          >
            {t("history.askAiExplain")}
          </Button>
          <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
            {t("history.clear")}
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& td, & th": {
              py: 1.25,
              px: 1.5,
              borderBottom: "1px solid var(--oa-border-5)",
              textAlign: "left",
              fontSize: 14,
            },
            "& th": { color: "var(--oa-text-500)", fontWeight: 700 },
          }}
        >
          <thead>
            <tr>
              <th />
              <th>{t("history.tableBefore")} · {formatDate(before.savedAt)}</th>
              <th>{t("history.tableAfter")} · {formatDate(after.savedAt)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const a = String(row.get(before));
              const b = String(row.get(after));

              return (
                <tr key={row.label}>
                  <td style={{ color: "var(--oa-text-600)", fontWeight: 600 }}>{row.label}</td>
                  <td>{a}</td>
                  <td
                    style={{
                      fontWeight: a !== b ? 800 : 400,
                      color: a !== b ? "var(--oa-brand)" : "inherit",
                    }}
                  >
                    {b}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ display: "block", color: "var(--oa-text-400)", mt: 1.5 }}>
        {t("history.comparisonCaption")}
      </Typography>
    </Card>
  );
}

/* ---------------------------------------------------------
   Page
   --------------------------------------------------------- */

function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [history, setHistory] = useState(getHistory);
  const [selected, setSelected] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const refresh = () => setHistory(getHistory());

    window.addEventListener(HISTORY_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const stats = useMemo(() => {
    if (!history.length) {
      return null;
    }

    const values = history.map((record) => probabilityPercent(record) ?? 0);
    const latest = values[0];
    const first = values[values.length - 1];

    return {
      latest,
      latestRisk: riskLevel(history[0]),
      change: history.length > 1 ? latest - first : null,
      lowest: Math.min(...values),
    };
  }, [history]);

  const toggleSelected = (id) => {
    setSelected((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      // Keep the two most recent picks.
      return [...previous, id].slice(-2);
    });
  };

  const confirmDelete = () => {
    setHistory(deleteHistoryRecord(pendingDelete.id));
    setSelected((previous) => previous.filter((id) => id !== pendingDelete.id));
    setPendingDelete(null);
  };

  const selectedRecords = history.filter((record) => selected.includes(record.id));

  return (
    <PageShell
      icon={<HistoryIcon />}
      title={t("history.pageTitle")}
      subtitle={t("history.pageSubtitle")}
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/assessment")}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3, boxShadow: "none" }}
        >
          {t("history.newAssessmentButton")}
        </Button>
      }
    >
      {!history.length ? (
        <Card sx={{ ...cardSx, p: { xs: 4, md: 6 }, textAlign: "center" }}>
          <HistoryIcon sx={{ fontSize: 48, color: "var(--oa-brand-200)" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            {t("history.emptyTitle")}
          </Typography>
          <Typography sx={{ color: "var(--oa-text-500)", mt: 0.5, mb: 3 }}>
            {t("history.emptyDesc")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/assessment")}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3, boxShadow: "none" }}
          >
            {t("history.startAssessmentButton")}
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t("history.statAssessments")}
                value={history.length}
                hint={t("history.statAssessmentsHint")}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t("history.statLatestEstimate")}
                value={`${stats.latest.toFixed(1)}%`}
                hint={t("history.statRiskSuffix", { level: translateRiskLevel(t, stats.latestRisk) })}
                color={riskColor(stats.latestRisk).main}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t("history.statChangeSinceFirst")}
                value={
                  stats.change === null
                    ? "-"
                    : `${stats.change > 0 ? "+" : ""}${stats.change.toFixed(1)}`
                }
                hint={t("history.statChangeHint")}
                color={
                  stats.change === null
                    ? "var(--oa-text-900)"
                    : stats.change <= 0
                      ? "var(--oa-success)"
                      : "var(--oa-danger)"
                }
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label={t("history.statLowestEstimate")}
                value={`${stats.lowest.toFixed(1)}%`}
                hint={t("history.statLowestHint")}
              />
            </Grid>
          </Grid>

          {history.length > 1 && <TrendChart history={history} />}

          {selectedRecords.length === 2 ? (
            <ComparePanel records={selectedRecords} onClose={() => setSelected([])} />
          ) : (
            history.length > 1 && (
              <Alert
                icon={<CompareArrowsIcon />}
                severity="info"
                sx={{ borderRadius: 3 }}
              >
                {t("history.compareInfoAlert")}
              </Alert>
            )
          )}

          <Box sx={{ position: "relative", pl: { xs: 2.5, md: 4 } }}>
            {/* Timeline rail */}
            <Box
              sx={{
                position: "absolute",
                left: { xs: 7, md: 13 },
                top: 12,
                bottom: 12,
                width: 2,
                bgcolor: "var(--oa-border-brand-soft)",
              }}
            />

            <Stack spacing={2}>
              {history.map((record, index) => {
                const level = riskLevel(record);
                const color = riskColor(level);
                const percent = probabilityPercent(record);
                const previous = history[index + 1];
                const delta =
                  previous && percent !== null
                    ? percent - (probabilityPercent(previous) ?? 0)
                    : null;
                const { raising, lowering } = topFactors(record, 2);
                const isSelected = selected.includes(record.id);

                return (
                  <Box key={record.id} sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: { xs: -19, md: -25 },
                        top: 22,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: color.main,
                        border: "3px solid var(--oa-surface)",
                        boxShadow: `0 0 0 2px ${color.soft}`,
                      }}
                    />

                    <Card
                      sx={{
                        ...cardSx,
                        p: { xs: 2, md: 2.5 },
                        borderColor: isSelected ? "var(--oa-brand)" : "var(--oa-border-1)",
                        transition: "border-color 0.2s, transform 0.2s",
                        "&:hover": { transform: "translateY(-2px)" },
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 72,
                              height: 72,
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: `conic-gradient(${color.main} ${(percent ?? 0) * 3.6}deg, ${color.soft} 0deg)`,
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                bgcolor: "var(--oa-surface)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography sx={{ fontWeight: 800, fontSize: 15, color: color.main }}>
                                {percent?.toFixed(1) ?? "-"}%
                              </Typography>
                            </Box>
                          </Box>

                          <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                              <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
                                {formatDate(record.savedAt, true)}
                              </Typography>
                              <RiskChip level={level} />
                              {index === 0 && (
                                <Chip size="small" label={t("history.latestChip")} color="primary" variant="outlined" />
                              )}
                            </Stack>

                            <Box sx={{ mt: 0.75 }}>
                              <DeltaBadge delta={delta} />
                            </Box>

                            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                              {raising.map((item) => (
                                <Chip
                                  key={`up-${item.feature}`}
                                  size="small"
                                  label={`↑ ${item.label}`}
                                  sx={{ bgcolor: "var(--oa-danger-soft)", color: "var(--oa-danger-strong)", fontWeight: 600 }}
                                />
                              ))}
                              {lowering.map((item) => (
                                <Chip
                                  key={`down-${item.feature}`}
                                  size="small"
                                  label={`↓ ${item.label}`}
                                  sx={{ bgcolor: "var(--oa-success-soft)", color: "var(--oa-success-strong)", fontWeight: 600 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ alignItems: "center", alignSelf: { xs: "flex-end", md: "center" } }}
                        >
                          {history.length > 1 && (
                            <Tooltip title={t("history.selectToCompareTooltip")}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleSelected(record.id)}
                                icon={<CompareArrowsIcon />}
                                checkedIcon={<CompareArrowsIcon />}
                                sx={{
                                  "&.Mui-checked": {
                                    color: "#FFFFFF",
                                    bgcolor: "var(--oa-brand-solid)",
                                    "&:hover": { bgcolor: "var(--oa-brand-solid-strong)" },
                                  },
                                }}
                              />
                            </Tooltip>
                          )}
                          <Tooltip title={t("history.askAiTooltip")}>
                            <IconButton
                              color="primary"
                              onClick={() =>
                                askAssistant(
                                  navigate,
                                  `Explain my assessment from ${formatDate(record.savedAt)}.`,
                                  record.id
                                )
                              }
                            >
                              <AutoAwesomeIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("history.deleteTooltip")}>
                            <IconButton onClick={() => setPendingDelete(record)}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/history/${record.id}`)}
                            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, ml: 0.5 }}
                          >
                            {t("history.viewResultButton")}
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      )}

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle sx={{ fontWeight: 800 }}>{t("history.deleteDialogTitle")}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "var(--oa-text-600)" }}>
            {t("history.deleteDialogBody", {
              date: pendingDelete ? formatDate(pendingDelete.savedAt, true) : "",
            })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} sx={{ textTransform: "none" }}>
            {t("common.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none" }}
          >
            {t("history.deleteButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}

export default HistoryPage;
