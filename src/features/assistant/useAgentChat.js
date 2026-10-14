import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { streamAgentMessage } from "../../services/agentService";
import { addReminder } from "../../services/reminderStore";
import { useLanguage } from "../../context/LanguageContext";
import {
  archiveChat,
  clearChat,
  deleteArchivedChat,
  loadChat,
  saveChat,
} from "../../services/chatStore";

// Pages the Agent is allowed to open.
export const ALLOWED_PATHS = [
  "/",
  "/dashboard",
  "/assessment",
  "/history",
  "/assistant",
  "/knowledge",
  "/simulator",
];

/*
 * Streaming chat state for the OsteoAI Agent.
 *
 * `getContext()` is read at send time so the latest selected
 * assessment and history are always sent with each message.
 *
 * Pass `storageKey` to keep the transcript across page changes: the
 * messages and the backend conversation id are restored on mount, so
 * leaving the page and coming back continues the same conversation.
 */
export default function useAgentChat(getContext, storageKey) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Read the saved transcript once, when the hook first mounts.
  const [restored] = useState(() => (storageKey ? loadChat(storageKey) : null));

  const [messages, setMessages] = useState(() => restored?.messages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conversationIdRef = useRef(null);
  const loadingRef = useRef(false);

  // Continue the same backend conversation as before the page change.
  useEffect(() => {
    if (restored?.conversationId) {
      conversationIdRef.current = restored.conversationId;
    }
  }, [restored]);

  // Persist after each turn, once streaming has settled.
  useEffect(() => {
    if (!storageKey || loading) {
      return;
    }

    saveChat(storageKey, messages, conversationIdRef.current);
  }, [messages, loading, storageKey]);

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
        const { predictionResult, assessmentHistory, documentExtraction } =
          getContext();

        await streamAgentMessage({
          message,
          predictionResult,
          assessmentHistory,
          documentExtraction,
          conversationId: conversationIdRef.current,
          language,
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
          finalMessage || streamedText || t("assistant.noResponse"),
          false
        );

        // The backend only sends this after the user confirmed the
        // reminder it showed them in the previous turn.
        if (action?.type === "create_reminder" && action.reminder) {
          addReminder(action.reminder);
        }

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
        setError(agentError?.message || t("assistant.connectionError"));
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [getContext, navigate, t, language]
  );

  const reset = () => {
    // Keep the finished conversation so it can be reopened later.
    if (storageKey && messages.length) {
      archiveChat(messages, conversationIdRef.current);
    }

    conversationIdRef.current = null;
    setMessages([]);
    setError("");

    if (storageKey) {
      clearChat(storageKey);
    }
  };

  /** Reopen a past conversation in place of the current one. */
  const restoreConversation = (entry) => {
    // Park whatever is open now...
    if (storageKey && messages.length) {
      archiveChat(messages, conversationIdRef.current);
    }

    // ...and take the chosen one out of the archive, since it becomes
    // the active conversation. Leaving it there would archive it again
    // on the next switch, duplicating the entry each time.
    deleteArchivedChat(entry.id);

    conversationIdRef.current = entry.conversationId || null;
    setMessages(entry.messages.map((message) => ({ ...message, streaming: false })));
    setError("");
  };

  return { messages, loading, error, send, reset, restoreConversation };
}
