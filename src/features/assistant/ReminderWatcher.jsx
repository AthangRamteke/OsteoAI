import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Button, Snackbar } from "@mui/material";

import { useLanguage } from "../../context/LanguageContext";
import {
  REMINDERS_UPDATED_EVENT,
  getDueReminders,
  markReminderNotified,
  notificationPermission,
} from "../../services/reminderStore";

// How often to look for reminders that have come due.
const CHECK_INTERVAL_MS = 30_000;

/*
 * Announces reminders when their time arrives.
 *
 * Mounted once for the whole app, so an alert appears on any page.
 * It shows an in-app banner always, and a desktop notification as
 * well when the user has allowed them.
 */
function ReminderWatcher() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [due, setDue] = useState(null);

  const check = useCallback(() => {
    const [next] = getDueReminders();

    if (!next) {
      return;
    }

    setDue(next);
    markReminderNotified(next.id);

    if (notificationPermission() === "granted") {
      try {
        const notification = new Notification(t("assistant.notifyTitle"), {
          body: next.title,
          tag: next.id,
        });

        notification.onclick = () => {
          window.focus();
          navigate("/assistant");
        };
      } catch {
        // Desktop notification unavailable; the in-app banner still shows.
      }
    }
  }, [navigate, t]);

  useEffect(() => {
    // Slight delay so the first check happens after the page settles,
    // not during the mount render.
    const firstCheck = setTimeout(check, 1500);
    const timer = setInterval(check, CHECK_INTERVAL_MS);

    // A reminder set for a minute from now should fire without waiting
    // for the next poll after the list changes.
    window.addEventListener(REMINDERS_UPDATED_EVENT, check);

    return () => {
      clearTimeout(firstCheck);
      clearInterval(timer);
      window.removeEventListener(REMINDERS_UPDATED_EVENT, check);
    };
  }, [check]);

  return (
    <Snackbar
      open={Boolean(due)}
      onClose={() => setDue(null)}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ maxWidth: 420 }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={() => setDue(null)}
        action={
          <Button
            size="small"
            sx={{ color: "#FFFFFF", fontWeight: 700, textTransform: "none" }}
            onClick={() => {
              setDue(null);
              navigate("/assistant");
            }}
          >
            {t("assistant.notifyOpen")}
          </Button>
        }
        sx={{ borderRadius: 3, alignItems: "center" }}
      >
        {t("assistant.notifyBody", { title: due?.title || "" })}
      </Alert>
    </Snackbar>
  );
}

export default ReminderWatcher;
