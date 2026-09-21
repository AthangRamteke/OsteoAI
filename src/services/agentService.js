const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export async function sendAgentMessage({
  message,
  predictionResult,
  conversationId = null,
  language = "en",
}) {
  if (!message || !message.trim()) {
    throw new Error("Please enter a message.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/agent/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        language,
        conversation_id: conversationId,
        context: {
          prediction_result: predictionResult || {},
        },
      }),
    }
  );

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.detail ||
        "Unable to contact the OsteoAI Assistant."
    );
  }

  return payload;
}

export default sendAgentMessage;

/**
 * Streaming version of sendAgentMessage.
 *
 * The backend sends newline-delimited JSON events:
 *   { type: "meta", conversation_id, intent, language, action }
 *   { type: "delta", text }            (zero or more)
 *   { type: "done", message }          (cleaned full reply)
 *   { type: "error", detail }
 *
 * `onEvent` is called for every event as it arrives.
 */
export async function streamAgentMessage({
  message,
  predictionResult,
  assessmentHistory = [],
  conversationId = null,
  language = "en",
  onEvent,
}) {
  if (!message || !message.trim()) {
    throw new Error("Please enter a message.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/agent/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        language,
        conversation_id: conversationId,
        context: {
          prediction_result: predictionResult || {},
          assessment_history: assessmentHistory,
        },
      }),
    }
  );

  if (!response.ok || !response.body) {
    let detail;

    try {
      detail = (await response.json())?.detail;
    } catch {
      // Non-JSON error body; use the generic message.
    }

    throw new Error(
      detail || "Unable to contact the OsteoAI Assistant."
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const event = JSON.parse(line);

      if (event.type === "error") {
        throw new Error(event.detail);
      }

      onEvent?.(event);
    }
  }
}
