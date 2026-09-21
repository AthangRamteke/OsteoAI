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
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
};

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
  const color = riskColor(level);

  return (
    <Chip
      size="small"
      label={`${level} risk`}
      sx={{ fontWeight: 700, color: color.main, bgcolor: color.soft }}
    />
  );
}

function DeltaBadge({ delta }) {
  if (delta === null) {
    return (
      <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
        First assessment
      </Typography>
    );
  }

  const flat = Math.abs(delta) < 0.1;
  const down = delta < 0;
  const Icon = flat ? TrendingFlatIcon : down ? TrendingDownIcon : TrendingUpIcon;
  const color = flat ? "#64748B" : down ? "#16A34A" : "#DC2626";

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color }}>
      <Icon fontSize="small" />
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {flat ? "No change" : `${down ? "" : "+"}${delta.toFixed(1)} pts vs previous`}
      </Typography>
    </Stack>
  );
}

function StatCard({ label, value, hint, color = "#0F172A" }) {
  return (
    <Card sx={{ ...cardSx, p: 2.25, height: "100%" }}>
      <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 800, color, mt: 0.5 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
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
  const data = [...history].reverse().map((record, index) => ({
    name: `#${index + 1}`,
    date: formatDate(record.savedAt),
    probability: Number((probabilityPercent(record) ?? 0).toFixed(1)),
    risk: riskLevel(record),
  }));

  return (
    <Card sx={{ ...cardSx, p: { xs: 2, md: 3 } }}>
      <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
        Bone-risk trend
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
        Model probability for each assessment, oldest to newest.
      </Typography>

      <Box sx={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "#64748B" }}
            />
            <ChartTooltip
              formatter={(value) => [`${value}%`, "Probability"]}
              labelFormatter={(_, payload) =>
                payload?.[0]
                  ? `${payload[0].payload.date} · ${payload[0].payload.risk} risk`
                  : ""
              }
            />
            <ReferenceLine y={50} stroke="#CBD5E1" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="#2563EB"
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

  // Oldest first so "before → after" reads naturally.
  const [before, after] = [...records].sort(
    (a, b) => new Date(a.savedAt) - new Date(b.savedAt)
  );

  const rows = [
    {
      label: "Probability",
      get: (record) => `${probabilityPercent(record)?.toFixed(1) ?? "-"}%`,
    },
    { label: "Risk level", get: (record) => riskLevel(record) },
    { label: "Age", get: (record) => record.assessmentData?.personal?.age || "-" },
    {
      label: "BMI",
      get: (record) => computeBmi(record.assessmentData?.personal)?.toFixed(1) ?? "-",
    },
    {
      label: "Weight (kg)",
      get: (record) => record.assessmentData?.personal?.weight || "-",
    },
    {
      label: "Sedentary (min/day)",
      get: (record) => record.assessmentData?.lifestyle?.sedentaryMinutes || "-",
    },
    {
      label: "Top factors raising",
      get: (record) =>
        topFactors(record, 2)
          .raising.map((item) => item.label)
          .join(", ") || "-",
    },
  ];

  const delta =
    (probabilityPercent(after) ?? 0) - (probabilityPercent(before) ?? 0);

  return (
    <Card sx={{ ...cardSx, p: { xs: 2, md: 3 }, borderColor: "#BFDBFE" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", gap: 1, mb: 2 }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
            Comparison
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            {formatDate(before.savedAt)} → {formatDate(after.savedAt)} ·{" "}
            <b style={{ color: delta <= 0 ? "#16A34A" : "#DC2626" }}>
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} percentage points
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
            Ask AI to explain
          </Button>
          <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
            Clear
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
              borderBottom: "1px solid #F1F5F9",
              textAlign: "left",
              fontSize: 14,
            },
            "& th": { color: "#64748B", fontWeight: 700 },
          }}
        >
          <thead>
            <tr>
              <th />
              <th>Before · {formatDate(before.savedAt)}</th>
              <th>After · {formatDate(after.savedAt)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const a = String(row.get(before));
              const b = String(row.get(after));

              return (
                <tr key={row.label}>
                  <td style={{ color: "#475569", fontWeight: 600 }}>{row.label}</td>
                  <td>{a}</td>
                  <td
                    style={{
                      fontWeight: a !== b ? 800 : 400,
                      color: a !== b ? "#2563EB" : "inherit",
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

      <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1.5 }}>
        Changed values are highlighted. A different model estimate is a hypothetical
        comparison, not proof of a change in bone health.
      </Typography>
    </Card>
  );
}

/* ---------------------------------------------------------
   Page
   --------------------------------------------------------- */

function HistoryPage() {
  const navigate = useNavigate();

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
      title="Assessment History"
      subtitle="Your bone-health timeline: every assessment, how it changed, and why."
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/assessment")}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3, boxShadow: "none" }}
        >
          New assessment
        </Button>
      }
    >
      {!history.length ? (
        <Card sx={{ ...cardSx, p: { xs: 4, md: 6 }, textAlign: "center" }}>
          <HistoryIcon sx={{ fontSize: 48, color: "#93C5FD" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            No assessments yet
          </Typography>
          <Typography sx={{ color: "#64748B", mt: 0.5, mb: 3 }}>
            Complete your first assessment to start your bone-health timeline.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/assessment")}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3, boxShadow: "none" }}
          >
            Start assessment
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Assessments" value={history.length} hint="Saved on this device" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label="Latest estimate"
                value={`${stats.latest.toFixed(1)}%`}
                hint={`${stats.latestRisk} risk`}
                color={riskColor(stats.latestRisk).main}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                label="Change since first"
                value={
                  stats.change === null
                    ? "-"
                    : `${stats.change > 0 ? "+" : ""}${stats.change.toFixed(1)}`
                }
                hint="Percentage points"
                color={
                  stats.change === null
                    ? "#0F172A"
                    : stats.change <= 0
                      ? "#16A34A"
                      : "#DC2626"
                }
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Lowest estimate" value={`${stats.lowest.toFixed(1)}%`} hint="Across all assessments" />
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
                Tick any two assessments below to compare them side by side.
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
                bgcolor: "#DBEAFE",
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
                        left: { xs: -22, md: -30 },
                        top: 22,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: color.main,
                        border: "3px solid #FFFFFF",
                        boxShadow: `0 0 0 2px ${color.soft}`,
                      }}
                    />

                    <Card
                      sx={{
                        ...cardSx,
                        p: { xs: 2, md: 2.5 },
                        borderColor: isSelected ? "#2563EB" : "#E2E8F0",
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
                                bgcolor: "#FFFFFF",
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
                              <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
                                {formatDate(record.savedAt, true)}
                              </Typography>
                              <RiskChip level={level} />
                              {index === 0 && (
                                <Chip size="small" label="Latest" color="primary" variant="outlined" />
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
                                  sx={{ bgcolor: "#FEF2F2", color: "#B91C1C", fontWeight: 600 }}
                                />
                              ))}
                              {lowering.map((item) => (
                                <Chip
                                  key={`down-${item.feature}`}
                                  size="small"
                                  label={`↓ ${item.label}`}
                                  sx={{ bgcolor: "#F0FDF4", color: "#15803D", fontWeight: 600 }}
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
                            <Tooltip title="Select to compare">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleSelected(record.id)}
                                icon={<CompareArrowsIcon />}
                                checkedIcon={<CompareArrowsIcon />}
                                sx={{
                                  "&.Mui-checked": {
                                    color: "#FFFFFF",
                                    bgcolor: "#2563EB",
                                    "&:hover": { bgcolor: "#1D4ED8" },
                                  },
                                }}
                              />
                            </Tooltip>
                          )}
                          <Tooltip title="Ask AI about this assessment">
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
                          <Tooltip title="Delete">
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
                            View result
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
        <DialogTitle sx={{ fontWeight: 800 }}>Delete this assessment?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569" }}>
            The assessment from {pendingDelete && formatDate(pendingDelete.savedAt, true)} will
            be removed from this device. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}

export default HistoryPage;
