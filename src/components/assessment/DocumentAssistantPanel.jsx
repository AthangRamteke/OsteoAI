import { useCallback, useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";

import useAgentChat from "../../features/assistant/useAgentChat";
import { useLanguage } from "../../context/LanguageContext";

/*
 * Conversational layer over the document extraction review.
 *
 * The Agent receives the extracted fields as context, so it can say what
 * was found and what still needs review without inventing values. It
 * never changes the extracted data: the user confirms that themselves.
 */
function DocumentAssistantPanel({ result }) {
  const { t } = useLanguage();

  const getContext = useCallback(
    () => ({
      predictionResult: {},
      assessmentHistory: [],
      documentExtraction: {
        filename: result?.filename,
        extraction_method: result?.extraction_method,
        warnings: result?.warnings,
        fields: result?.fields,
      },
    }),
    [result]
  );

  const { messages, loading, error, send } = useAgentChat(getContext);

  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const submit = (text = input) => {
    send(text);
    setInput("");
  };

  const prompts = [
    t("assessment.documentAssistant.promptFound"),
    t("assessment.documentAssistant.promptReview"),
    t("assessment.documentAssistant.promptMissing"),
  ];

  return (
    <Box
      sx={{
        mt: 2.2,
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            background: "linear-gradient(135deg, #2563EB, #14B8A6)",
          }}
        >
          <SmartToyIcon sx={{ fontSize: 17 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: 15 }}>
            {t("assessment.documentAssistant.title")}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            {t("assessment.documentAssistant.subtitle")}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
        {prompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            size="small"
            variant="outlined"
            onClick={() => !loading && submit(prompt)}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Stack>

      {messages.length > 0 && (
        <Box
          ref={scrollRef}
          sx={{ maxHeight: 260, overflowY: "auto", mt: 1.75, pr: 0.5 }}
        >
          <Stack spacing={1.25}>
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";

              return (
                <Box
                  key={`${message.role}-${index}`}
                  sx={{
                    alignSelf: isAssistant ? "flex-start" : "flex-end",
                    maxWidth: "88%",
                    px: 1.6,
                    py: 1.1,
                    borderRadius: 2.5,
                    bgcolor: isAssistant ? "#F8FAFC" : "#EEF4FF",
                    border: `1px solid ${isAssistant ? "#E2E8F0" : "#D7E3F4"}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap" }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              );
            })}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            )}
          </Stack>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center" }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("assessment.documentAssistant.placeholder")}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
        />
        <IconButton
          color="primary"
          onClick={() => submit()}
          disabled={loading || !input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Stack>

      <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1 }}>
        {t("assessment.documentAssistant.note")}
      </Typography>
    </Box>
  );
}

export default DocumentAssistantPanel;
