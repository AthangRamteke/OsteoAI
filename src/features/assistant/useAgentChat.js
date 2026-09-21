import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { streamAgentMessage } from "../../services/agentService";

// Pages the Agent is allowed to open.
export const ALLOWED_PATHS = [
  "/",
  "/dashboard",
  "/assessment",
  "/history",
  "/assistant",
  "/knowledge",
];

/*
 * Streaming chat state for the OsteoAI Agent.
 *
 * `getContext()` is read at send time so the latest selected
 * assessment and history are always sent with each message.
 */
export default function useAgentChat(getContext) {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conversationIdRef = useRef(null);
  const loadingRef = useRef(false);

  const showAssistantText = (content, streaming = true) => {
    setMessages((previous) => {
      const last = previous[previous.length - 1];
      const next = { role: "assistant", content, streaming };

      return last?.streaming
        ? [...previous.slice(0, -1), next]
        : [...previous, next];
    });
  };

  const send = useCallback(
    async (text) => {
      const message = text.trim();

      if (!message || loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError("");
      setMessages((previous) => [...previous, { role: "user", content: message }]);

      let action = null;
      let finalMessage = "";
      let streamedText = "";

      try {
        const { predictionResult, assessmentHistory } = getContext();

        await streamAgentMessage({
          message,
          predictionResult,
          assessmentHistory,
          conversationId: conversationIdRef.current,
          language: localStorage.getItem("osteoai-language") || "en",
          onEvent: (event) => {
            if (event.type === "meta") {
              conversationIdRef.current = event.conversation_id;
              action = event.action;
            }

            if (event.type === "delta") {
              streamedText += event.text;
              showAssistantText(streamedText);
            }

            if (event.type === "done") {
              finalMessage = event.message;
            }
          },
        });

        showAssistantText(
          finalMessage || streamedText || "I was unable to generate a response.",
          false
        );

        if (action?.type === "navigate" && ALLOWED_PATHS.includes(action.path)) {
          setTimeout(() => {
            if (action.path === "/assessment") {
              // Full load resets the shared assessment/result route.
              window.location.assign("/assessment");
              return;
            }

            navigate(action.path);
          }, 450);
        }
      } catch (agentError) {
        console.error("OsteoAI Agent request failed:", agentError);
        setError(agentError?.message || "Unable to connect to the OsteoAI Assistant.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [getContext, navigate]
  );

  const reset = () => {
    conversationIdRef.current = null;
    setMessages([]);
    setError("");
  };

  return { messages, loading, error, send, reset };
}
