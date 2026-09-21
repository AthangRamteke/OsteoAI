/*
 * Assessment history stored in the browser.
 *
 * Assessment.jsx writes records shaped like:
 *   { id, savedAt, assessmentData, predictionResult }
 */

const HISTORY_KEY = "osteoai_assessment_history";
const LATEST_KEY = "osteoai_latest_assessment";

export const HISTORY_UPDATED_EVENT = "osteoai:assessment-updated";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** All valid records, newest first. */
export function getHistory() {
  const history = readJson(HISTORY_KEY, []);

  return Array.isArray(history)
    ? history.filter(
        (item) =>
          item?.id &&
          item?.assessmentData &&
          item?.predictionResult
      )
    : [];
}

export function getHistoryRecord(id) {
  return getHistory().find((item) => item.id === id) || null;
}

export function deleteHistoryRecord(id) {
  const remaining = getHistory().filter((item) => item.id !== id);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));

    const latest = readJson(LATEST_KEY, null);

    if (latest?.id === id) {
      if (remaining[0]) {
        localStorage.setItem(LATEST_KEY, JSON.stringify(remaining[0]));
      } else {
        localStorage.removeItem(LATEST_KEY);
      }
    }

    window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
  } catch (error) {
    console.warn("Unable to update OsteoAI history:", error);
  }

  return remaining;
}

/* ---------------------------------------------------------
   Formatting helpers shared by History and Assistant pages
   --------------------------------------------------------- */

export function probabilityPercent(record) {
  const value = Number(record?.predictionResult?.osteoporosis_probability);
  return Number.isFinite(value) ? value * 100 : null;
}

export function riskLevel(record) {
  return record?.predictionResult?.risk_level || "Unknown";
}

export function computeBmi(personal = {}) {
  const height = Number(personal.height) / 100;
  const weight = Number(personal.weight);

  if (!height || !weight) {
    return null;
  }

  return weight / (height * height);
}

/** SHAP factors sorted by influence, split by direction. */
export function topFactors(record, limit = 3) {
  const items = [
    ...(record?.predictionResult?.shap_explanations || []),
  ].sort(
    (a, b) => Math.abs(b.shap_value || 0) - Math.abs(a.shap_value || 0)
  );

  return {
    raising: items
      .filter((item) => item.direction === "increases_model_output")
      .slice(0, limit),
    lowering: items
      .filter((item) => item.direction === "decreases_model_output")
      .slice(0, limit),
  };
}

export function formatDate(iso, withTime = false) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Compact history summary the Agent uses for progress questions. */
export function historyForAgent(history = getHistory()) {
  return history.slice(0, 10).map((record) => ({
    date: (record.savedAt || "").slice(0, 10),
    probability: record.predictionResult?.osteoporosis_probability,
    risk_level: riskLevel(record),
    top_factors: topFactors(record, 2).raising.map(
      (item) => item.label || item.feature
    ),
  }));
}

export const RISK_COLORS = {
  Low: { main: "#16A34A", soft: "#DCFCE7" },
  Moderate: { main: "#D97706", soft: "#FEF3C7" },
  High: { main: "#DC2626", soft: "#FEE2E2" },
  Unknown: { main: "#64748B", soft: "#F1F5F9" },
};

export function riskColor(level) {
  return RISK_COLORS[level] || RISK_COLORS.Unknown;
}
