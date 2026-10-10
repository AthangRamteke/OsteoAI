import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import ScienceIcon from "@mui/icons-material/Science";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

import PageShell from "../../components/common/PageShell";
import { useLanguage } from "../../context/LanguageContext";
import { buildPredictionPayload } from "../../services/predictionService";
import { simulateChanges } from "../../services/simulationService";
import {
  formatDate,
  getHistory,
  riskColor,
} from "../../services/historyStore";

/*
 * What-if Health Simulator.
 *
 * Adjustable inputs are lifestyle-style only: age, gender and family
 * history are fixed, because a simulation of those would be meaningless.
 * The result is a comparison of two model estimates, never a promise
 * about real-world health outcomes.
 */
const TOGGLES = [
  { key: "walk_or_bicycle", labelKey: "simulator.toggleWalk" },
  { key: "moderate_recreation", labelKey: "simulator.toggleModerateRecreation" },
  { key: "vigorous_recreation", labelKey: "simulator.toggleVigorousRecreation" },
  { key: "moderate_work_activity", labelKey: "simulator.toggleModerateWork" },
  { key: "smoked_100_cigarettes", labelKey: "simulator.toggleSmoking", inverse: true },
];

function RiskDial({ label, percent, level, muted }) {
  const color = riskColor(level);

  return (
    <Stack sx={{ alignItems: "center", flex: 1 }}>
      <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>
        {label}
      </Typography>
      <Box
        sx={{
          mt: 1,
          width: 104,
          height: 104,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: muted ? 0.75 : 1,
          background: `conic-gradient(${color.main} ${percent * 3.6}deg, ${color.soft} 0deg)`,
        }}
      >
        <Box
          sx={{
            width: 82,
            height: 82,
            borderRadius: "50%",
            bgcolor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: color.main }}>
            {percent.toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            {level}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}

function SimulatorPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const history = useMemo(() => getHistory(), []);
  const latest = history[0] || null;

  const basePayload = useMemo(
    () => (latest ? buildPredictionPayload(latest.assessmentData) : null),
    [latest]
  );

  const initialChanges = useCallback(() => {
    if (!basePayload) {
      return {};
    }

    const changes = {};
    TOGGLES.forEach(({ key }) => {
      changes[key] = basePayload[key] ?? 0;
    });
    changes.sedentary_minutes = basePayload.sedentary_minutes ?? 300;
    changes.weight_kg = basePayload.weight_kg ?? 60;
    return changes;
  }, [basePayload]);

  const [changes, setChanges] = useState(initialChanges);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dirty = useMemo(() => {
    if (!basePayload) {
      return false;
    }

    return Object.entries(changes).some(
      ([key, value]) => Number(basePayload[key] ?? 0) !== Number(value)
    );
  }, [changes, basePayload]);

  // Re-run the model shortly after the sliders settle.
  useEffect(() => {
    if (!basePayload || !dirty) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        setResult(await simulateChanges({ basePayload, changes }));
      } catch (simulationError) {
        setError(simulationError.message);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [changes, basePayload, dirty]);

  const update = (key, value) =>
    setChanges((previous) => ({ ...previous, [key]: value }));

  // Reset hides the old comparison without clearing state in an effect.
  const shown = dirty ? result : null;

  const baselinePercent =
    (shown?.baseline.probability ??
      latest?.predictionResult?.osteoporosis_probability ??
      0) * 100;
  const simulatedPercent = (shown?.simulated.probability ?? 0) * 100;
  const deltaPoints = shown?.delta_points ?? 0;
  const flat = Math.abs(deltaPoints) < 0.05;
  const DeltaIcon = flat
    ? TrendingFlatIcon
    : deltaPoints < 0
      ? TrendingDownIcon
      : TrendingUpIcon;
  const deltaColor = flat ? "#64748B" : deltaPoints < 0 ? "#16A34A" : "#DC2626";

  if (!latest) {
    return (
      <PageShell
        icon={<ScienceIcon />}
        title={t("simulator.pageTitle")}
        subtitle={t("simulator.pageSubtitle")}
      >
        <Card sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: "center" }}>
          <ScienceIcon sx={{ fontSize: 48, color: "#93C5FD" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
            {t("simulator.emptyTitle")}
          </Typography>
          <Typography sx={{ color: "#64748B", mt: 0.5, mb: 3 }}>
            {t("simulator.emptyDesc")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/assessment")}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 3, boxShadow: "none" }}
          >
            {t("simulator.emptyButton")}
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={<ScienceIcon />}
      title={t("simulator.pageTitle")}
      subtitle={t("simulator.pageSubtitle")}
      actions={
        <Button
          startIcon={<RestartAltIcon />}
          onClick={() => setChanges(initialChanges())}
          disabled={!dirty}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {t("simulator.resetButton")}
        </Button>
      }
    >
      <Grid container spacing={3}>
        {/* ---------------- Controls ---------------- */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "none" }}>
            <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
              {t("simulator.controlsTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              {t("simulator.controlsDesc", { date: formatDate(latest.savedAt) })}
            </Typography>

            <Stack divider={<Box sx={{ borderTop: "1px solid #F1F5F9" }} />}>
              {TOGGLES.map(({ key, labelKey, inverse }) => {
                // Smoking reads better as "quit", so the switch is inverted.
                const raw = Number(changes[key] ?? 0) === 1;
                const checked = inverse ? !raw : raw;

                return (
                  <Stack
                    key={key}
                    direction="row"
                    sx={{ alignItems: "center", justifyContent: "space-between", py: 1 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                      {t(labelKey)}
                    </Typography>
                    <Switch
                      checked={checked}
                      onChange={(event) =>
                        update(
                          key,
                          inverse
                            ? event.target.checked
                              ? 0
                              : 1
                            : event.target.checked
                              ? 1
                              : 0
                        )
                      }
                    />
                  </Stack>
                );
              })}

              <Box sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    {t("simulator.sliderSedentary")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563EB" }}>
                    {Math.round(changes.sedentary_minutes)} {t("simulator.minutesPerDay")}
                  </Typography>
                </Stack>
                <Slider
                  value={Number(changes.sedentary_minutes) || 0}
                  onChange={(_, value) => update("sedentary_minutes", value)}
                  min={0}
                  max={960}
                  step={15}
                />
              </Box>

              <Box sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    {t("simulator.sliderWeight")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563EB" }}>
                    {Math.round(changes.weight_kg)} kg
                  </Typography>
                </Stack>
                <Slider
                  value={Number(changes.weight_kg) || 0}
                  onChange={(_, value) => update("weight_kg", value)}
                  min={35}
                  max={150}
                  step={1}
                />
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  {t("simulator.weightNote")}
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
              {t("simulator.fixedInputsNote")}
            </Alert>
          </Card>
        </Grid>

        {/* ---------------- Outcome ---------------- */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              boxShadow: "none",
              position: { md: "sticky" },
              top: { md: 24 },
            }}
          >
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
                {t("simulator.outcomeTitle")}
              </Typography>
              {loading && <CircularProgress size={18} />}
            </Stack>

            {!dirty ? (
              <Typography variant="body2" sx={{ color: "#64748B", mt: 1.5 }}>
                {t("simulator.outcomeIdle")}
              </Typography>
            ) : (
              <>
                <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                  <RiskDial
                    label={t("simulator.labelNow")}
                    percent={baselinePercent}
                    level={shown?.baseline.risk_level || "Unknown"}
                    muted
                  />
                  <RiskDial
                    label={t("simulator.labelWhatIf")}
                    percent={simulatedPercent}
                    level={shown?.simulated.risk_level || "Unknown"}
                  />
                </Stack>

                {shown && (
                  <>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: "center", justifyContent: "center", mt: 2, color: deltaColor }}
                    >
                      <DeltaIcon />
                      <Typography sx={{ fontWeight: 800 }}>
                        {flat
                          ? t("simulator.deltaNone")
                          : t("simulator.deltaPoints", {
                              value: `${deltaPoints > 0 ? "+" : ""}${deltaPoints.toFixed(1)}`,
                            })}
                      </Typography>
                    </Stack>

                    {shown.baseline.risk_level !== shown.simulated.risk_level && (
                      <Chip
                        label={t("simulator.riskLevelChanged", {
                          from: shown.baseline.risk_level,
                          to: shown.simulated.risk_level,
                        })}
                        sx={{ mt: 1.5, width: "100%", fontWeight: 700 }}
                      />
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() =>
                        navigate(
                          `/assistant?q=${encodeURIComponent(
                            t("simulator.askAiQuestion", {
                              value: `${deltaPoints > 0 ? "+" : ""}${deltaPoints.toFixed(1)}`,
                            })
                          )}`
                        )
                      }
                      sx={{ mt: 2, textTransform: "none", fontWeight: 700, borderRadius: 3, boxShadow: "none" }}
                    >
                      {t("simulator.askAiButton")}
                    </Button>
                  </>
                )}
              </>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 2, lineHeight: 1.6 }}>
              {t("simulator.disclaimer")}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </PageShell>
  );
}

export default SimulatorPage;
