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
import { formatDate } from "../../services/historyStore";
import {
  REMINDERS_UPDATED_EVENT,
  getReminders,
  isOverdue,
  isUnread,
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
  const pendingCount = reminders.filter(isUnread).length;

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
              background: "var(--oa-brand-gradient)",
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
              {t("dashboard.askTitle")}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--oa-text-500)" }}>
              {t("dashboard.askSubtitle")}
            </Typography>
          </Box>
        </Stack>

        <Chip
          icon={<LockIcon sx={{ fontSize: 15 }} />}
          label={t("dashboard.askLocalChip")}
          size="small"
          sx={{ fontWeight: 700, bgcolor: "var(--oa-success-soft)", color: "var(--oa-success-strong)" }}
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
              bgcolor: "var(--oa-surface-2)",
            },
          }}
        />
        <IconButton
          onClick={() => ask()}
          sx={{
            bgcolor: "var(--oa-brand-solid)",
            color: "#FFFFFF",
            borderRadius: 2.5,
            "&:hover": { bgcolor: "var(--oa-brand-solid-strong)" },
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
          sx={{ fontWeight: 700, borderRadius: 99, bgcolor: "var(--oa-brand-soft)", color: "var(--oa-brand)" }}
        />
      </Stack>

      {/* Reminders created through the assistant */}
      <Box
        sx={{
          mt: 2.4,
          p: 2,
          borderRadius: 3.5,
          bgcolor: "var(--oa-surface-2)",
          border: "1px solid var(--oa-border-2)",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: openReminders.length ? 1.2 : 0 }}>
          <NotificationsActiveIcon sx={{ fontSize: 18, color: "var(--oa-brand)" }} />
          <Typography variant="body2" sx={{ fontWeight: 800, color: "var(--oa-text-700)" }}>
            {t("dashboard.askRemindersTitle")}
          </Typography>

          {pendingCount > 0 && (
            <Chip
              size="small"
              label={t("assistant.remindersPendingCount", { count: pendingCount })}
              onClick={() => navigate("/assistant")}
              sx={{ fontWeight: 800, bgcolor: "var(--oa-warn-soft)", color: "var(--oa-warn-deep)" }}
            />
          )}
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
                <Typography variant="body2" sx={{ color: "var(--oa-text-700)", fontWeight: 600 }}>
                  {reminder.title}
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: isOverdue(reminder) ? "var(--oa-danger)" : "var(--oa-text-500)",
                      fontWeight: isOverdue(reminder) ? 700 : 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {reminder.dueText}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--oa-text-400)", whiteSpace: "nowrap" }}
                  >
                    {t("dashboard.askRemindersSet", {
                      time: formatDate(reminder.createdAt, true),
                    })}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: "var(--oa-text-400)" }}>
            {t("dashboard.askRemindersEmpty")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default AskOsteoAICard;
