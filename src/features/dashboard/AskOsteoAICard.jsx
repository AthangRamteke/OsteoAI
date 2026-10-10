import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ScienceIcon from "@mui/icons-material/Science";

import { useLanguage } from "../../context/LanguageContext";
import {
  REMINDERS_UPDATED_EVENT,
  getReminders,
  isOverdue,
} from "../../services/reminderStore";

/*
 * Dashboard entry point to the local AI assistant.
 *
 * Typing here hands the question to the Assistant page, which runs it
 * against the local model with the user's result and history.
 */
function AskOsteoAICard({ surfaceSx }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [question, setQuestion] = useState("");
  const [reminders, setReminders] = useState(getReminders);

  useEffect(() => {
    const refresh = () => setReminders(getReminders());

    window.addEventListener(REMINDERS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(REMINDERS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const ask = (text = question) => {
    const trimmed = text.trim();

    navigate(
      trimmed ? `/assistant?q=${encodeURIComponent(trimmed)}` : "/assistant"
    );
  };

  const suggestions = [
    t("dashboard.askSuggestionResult"),
    t("dashboard.askSuggestionImprove"),
    t("dashboard.askSuggestionProgress"),
  ];

  const openReminders = reminders.filter((item) => !item.done).slice(0, 3);

  return (
    <Box sx={{ ...surfaceSx, p: { xs: 2.5, md: 3 }, height: "100%" }}>
      <Stack
        direction="row"
        spacing={1.3}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              background: "linear-gradient(135deg, #2563EB, #14B8A6)",
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
              {t("dashboard.askTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              {t("dashboard.askSubtitle")}
            </Typography>
          </Box>
        </Stack>

        <Chip
          icon={<LockIcon sx={{ fontSize: 15 }} />}
          label={t("dashboard.askLocalChip")}
          size="small"
          sx={{ fontWeight: 700, bgcolor: "#ECFDF5", color: "#047857" }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2.4, alignItems: "center" }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("dashboard.askPlaceholder")}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              ask();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "#F8FAFC",
            },
          }}
        />
        <IconButton
          onClick={() => ask()}
          sx={{
            bgcolor: "#2563EB",
            color: "#FFFFFF",
            borderRadius: 2.5,
            "&:hover": { bgcolor: "#1D4ED8" },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.8, mt: 1.6 }}>
        {suggestions.map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            onClick={() => ask(suggestion)}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, borderRadius: 99 }}
          />
        ))}
        <Chip
          icon={<ScienceIcon sx={{ fontSize: 16 }} />}
          label={t("dashboard.askOpenSimulator")}
          onClick={() => navigate("/simulator")}
          size="small"
          sx={{ fontWeight: 700, borderRadius: 99, bgcolor: "#EEF4FF", color: "#2563EB" }}
        />
      </Stack>

      {/* Reminders created through the assistant */}
      <Box
        sx={{
          mt: 2.4,
          p: 2,
          borderRadius: 3.5,
          bgcolor: "#F8FAFC",
          border: "1px solid #EDF2F7",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: openReminders.length ? 1.2 : 0 }}>
          <NotificationsActiveIcon sx={{ fontSize: 18, color: "#2563EB" }} />
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#334155" }}>
            {t("dashboard.askRemindersTitle")}
          </Typography>
        </Stack>

        {openReminders.length ? (
          <Stack spacing={0.9}>
            {openReminders.map((reminder) => (
              <Stack
                key={reminder.id}
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600 }}>
                  {reminder.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isOverdue(reminder) ? "#DC2626" : "#64748B",
                    fontWeight: isOverdue(reminder) ? 700 : 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {reminder.dueText}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: "#94A3B8" }}>
            {t("dashboard.askRemindersEmpty")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default AskOsteoAICard;
