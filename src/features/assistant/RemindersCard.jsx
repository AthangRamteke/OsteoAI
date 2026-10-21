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
  acknowledgeAllReminders,
  acknowledgeReminder,
  deleteReminder,
  getReminders,
  isOverdue,
  isUnread,
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

  const unreadCount = reminders.filter(isUnread).length;
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
    <Card sx={{ p: 2.5, borderRadius: 4, border: "1px solid var(--oa-border-1)", boxShadow: "none" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
        <NotificationsActiveIcon sx={{ color: "var(--oa-brand)", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
          {t("assistant.remindersTitle")}
        </Typography>
        {reminders.length > 0 && (
          <Chip
            size="small"
            label={reminders.filter((item) => !item.done).length}
          />
        )}

        {unreadCount > 0 && (
          <Chip
            size="small"
            label={t("assistant.remindersPendingCount", { count: unreadCount })}
            onClick={() => setReminders(acknowledgeAllReminders())}
            sx={{ fontWeight: 800, bgcolor: "var(--oa-warn-soft)", color: "var(--oa-warn-deep)" }}
          />
        )}
      </Stack>

      {!reminders.length ? (
        <Typography variant="body2" sx={{ color: "var(--oa-text-500)" }}>
          {t("assistant.remindersEmpty")}
        </Typography>
      ) : (
        <Stack sx={{ mt: 1 }}>
          {reminders.map((reminder, index) => {
            const overdue = isOverdue(reminder);
            const unread = isUnread(reminder);

            return (
              <Stack
                key={reminder.id}
                direction="row"
                spacing={0.5}
                onClick={() =>
                  unread && setReminders(acknowledgeReminder(reminder.id))
                }
                sx={{
                  alignItems: "center",
                  py: 0.75,
                  px: unread ? 1 : 0,
                  mx: unread ? -1 : 0,
                  borderRadius: 2,
                  cursor: unread ? "pointer" : "default",
                  bgcolor: unread ? "var(--oa-warn-soft-2)" : "transparent",
                  borderTop: index ? "1px solid var(--oa-border-5)" : "none",
                }}
              >
                <Checkbox
                  size="small"
                  checked={Boolean(reminder.done)}
                  onChange={() => setReminders(toggleReminderDone(reminder.id))}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    {unread && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "var(--oa-warn)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        display: unread ? "block" : "none",
                        fontWeight: 800,
                        color: "var(--oa-warn-deep)",
                        letterSpacing: 0.4,
                      }}
                    >
                      {t("assistant.remindersPending")}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: reminder.done ? "var(--oa-text-400)" : "var(--oa-text-900)",
                      textDecoration: reminder.done ? "line-through" : "none",
                    }}
                  >
                    {reminder.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: overdue ? "var(--oa-danger)" : "var(--oa-text-500)",
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
                    sx={{ display: "block", color: "var(--oa-text-400)" }}
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
              bgcolor: backgroundReady ? "var(--oa-success-bright)" : "var(--oa-warn)",
            }}
          />
          <Typography variant="caption" sx={{ color: "var(--oa-text-500)" }}>
            {backgroundReady
              ? t("assistant.notifyBackgroundOn")
              : t("assistant.notifyBackgroundOff")}
          </Typography>
        </Stack>
      )}

      {permission === "denied" && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 1.5 }}>
          <NotificationsOffIcon sx={{ fontSize: 16, color: "var(--oa-text-400)" }} />
          <Typography variant="caption" sx={{ color: "var(--oa-text-400)" }}>
            {t("assistant.notifyBlocked")}
          </Typography>
        </Stack>
      )}

      <Typography variant="caption" sx={{ display: "block", color: "var(--oa-text-400)", mt: 1.5 }}>
        {t("assistant.remindersHint")}
      </Typography>
    </Card>
  );
}

export default RemindersCard;
