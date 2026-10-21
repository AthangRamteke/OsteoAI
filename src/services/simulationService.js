const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Re-run the model on a copy of the patient's inputs with selected
 * lifestyle values changed. Returns baseline vs hypothetical estimates.
 */
export async function simulateChanges({ basePayload, changes }) {
  const response = await fetch(`${API_BASE_URL}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base_payload: basePayload,
      changes,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The OsteoAI API returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Simulation request failed."
    );
  }

  return data;
}
