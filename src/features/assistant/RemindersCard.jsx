import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

import { useLanguage } from "../../context/LanguageContext";
import { reminderWorkerActive } from "../../services/notificationService";
import { formatDate } from "../../services/historyStore";
import {
  REMINDERS_UPDATED_EVENT,
  deleteReminder,
  getReminders,
  isOverdue,
  notificationPermission,
  relativeDue,
  requestNotificationPermission,
  toggleReminderDone,
} from "../../services/reminderStore";

/*
 * Reminders the user confirmed in the chat. Creating one happens in the
 * conversation; this card is where they live afterwards.
 */
function RemindersCard() {
  const { t, language } = useLanguage();
  const [reminders, setReminders] = useState(getReminders);
  const [permission, setPermission] = useState(notificationPermission);
  const [backgroundReady, setBackgroundReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = () =>
      reminderWorkerActive().then((active) => {
        if (!cancelled) {
          setBackgroundReady(active);
        }
      });

    check();

    // The worker may finish registering after this card has rendered.
    const supported =
      typeof navigator !== "undefined" && "serviceWorker" in navigator;

    if (supported) {
      navigator.serviceWorker.addEventListener("controllerchange", check);
    }

    return () => {
      cancelled = true;

      if (supported) {
        navigator.serviceWorker.removeEventListener("controllerchange", check);
      }
    };
  }, []);

  useEffect(() => {
    const refresh = () => setReminders(getReminders());

    window.addEventListener(REMINDERS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(REMINDERS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Card sx={{ p: 2.5, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "none" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
        <NotificationsActiveIcon sx={{ color: "#2563EB", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
          {t("assistant.remindersTitle")}
        </Typography>
        {reminders.length > 0 && (
          <Chip size="small" label={reminders.filter((item) => !item.done).length} />
        )}
      </Stack>

      {!reminders.length ? (
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          {t("assistant.remindersEmpty")}
        </Typography>
      ) : (
        <Stack sx={{ mt: 1 }}>
          {reminders.map((reminder, index) => {
            const overdue = isOverdue(reminder);

            return (
              <Stack
                key={reminder.id}
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: "center",
                  py: 0.75,
                  borderTop: index ? "1px solid #F1F5F9" : "none",
                }}
              >
                <Checkbox
                  size="small"
                  checked={Boolean(reminder.done)}
                  onChange={() => setReminders(toggleReminderDone(reminder.id))}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: reminder.done ? "#94A3B8" : "#0F172A",
                      textDecoration: reminder.done ? "line-through" : "none",
                    }}
                  >
                    {reminder.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: overdue ? "#DC2626" : "#64748B",
                      fontWeight: overdue ? 700 : 400,
                    }}
                  >
                    {t("assistant.remindersDueLabel", {
                      time: reminder.dueText,
                    })}
                    {reminder.done
                      ? ""
                      : ` · ${relativeDue(reminder.dueAt, language)}`}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "#94A3B8" }}
                  >
                    {t("assistant.remindersCreatedLabel", {
                      time: formatDate(reminder.createdAt, true),
                    })}
                  </Typography>
                </Box>

                <Tooltip title={t("assistant.remindersDelete")}>
                  <IconButton
                    size="small"
                    onClick={() => setReminders(deleteReminder(reminder.id))}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          })}
        </Stack>
      )}

      {permission === "default" && (
        <Button
          fullWidth
          size="small"
          startIcon={<NotificationsActiveIcon sx={{ fontSize: 17 }} />}
          onClick={async () => setPermission(await requestNotificationPermission())}
          sx={{ mt: 1.5, textTransform: "none", fontWeight: 700, borderRadius: 2.5 }}
          variant="outlined"
        >
          {t("assistant.notifyEnable")}
        </Button>
      )}

      {permission === "granted" && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: backgroundReady ? "#22C55E" : "#F59E0B",
            }}
          />
          <Typography variant="caption" sx={{ color: "#64748B" }}>
            {backgroundReady
              ? t("assistant.notifyBackgroundOn")
              : t("assistant.notifyBackgroundOff")}
          </Typography>
        </Stack>
      )}

      {permission === "denied" && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 1.5 }}>
          <NotificationsOffIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
          <Typography variant="caption" sx={{ color: "#94A3B8" }}>
            {t("assistant.notifyBlocked")}
          </Typography>
        </Stack>
      )}

      <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1.5 }}>
        {t("assistant.remindersHint")}
      </Typography>
    </Card>
  );
}

export default RemindersCard;
