/*
 * Reminders created by the Agent, stored in this browser.
 *
 * A reminder is only written here after the user has explicitly
 * confirmed it in the chat, matching the Agent's rule that
 * read/explain/navigate is free but write/create needs confirmation.
 */

import { userKey } from "./userStorage";

const REMINDERS_KEY = "osteoai_reminders";

export const REMINDERS_UPDATED_EVENT = "osteoai:reminders-updated";

function read() {
  try {
    const raw = localStorage.getItem(userKey(REMINDERS_KEY));
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.id && item?.title && item?.dueAt)
      : [];
  } catch {
    return [];
  }
}

function write(reminders) {
  try {
    localStorage.setItem(userKey(REMINDERS_KEY), JSON.stringify(reminders));
    window.dispatchEvent(new Event(REMINDERS_UPDATED_EVENT));
  } catch (error) {
    console.warn("Unable to save OsteoAI reminders:", error);
  }

  return reminders;
}

/** Soonest first, with completed ones last. */
export function getReminders() {
  return read().sort((a, b) => {
    if (Boolean(a.done) !== Boolean(b.done)) {
      return a.done ? 1 : -1;
    }

    if (isUnread(a) !== isUnread(b)) {
      return isUnread(a) ? -1 : 1;
    }

    return new Date(a.dueAt) - new Date(b.dueAt);
  });
}

/** Store a reminder the user confirmed in the chat. */
export function addReminder({
  title,
  due_at: dueAt,
  due_text: dueText,
  created_at: createdAt,
}) {
  if (!title || !dueAt) {
    return getReminders();
  }

  const reminder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    dueAt,
    dueText: dueText || "",
    createdAt: createdAt || new Date().toISOString(),
    done: false,
  };

  write([...read(), reminder].slice(-50));

  return getReminders();
}

export function toggleReminderDone(id) {
  write(
    read().map((item) =>
      item.id === id
        ? {
            ...item,
            done: !item.done,
            acknowledgedAt: item.acknowledgedAt || new Date().toISOString(),
          }
        : item
    )
  );

  return getReminders();
}

export function deleteReminder(id) {
  write(read().filter((item) => item.id !== id));

  return getReminders();
}

export function isOverdue(reminder) {
  return !reminder.done && new Date(reminder.dueAt) < new Date();
}

/**
 * Announced but not looked at yet.
 *
 * A reminder stays "unread" from the moment its alert fires until the
 * user opens or ticks it, so one missed notification does not mean the
 * reminder is silently gone.
 */
export function isUnread(reminder) {
  return Boolean(reminder.notifiedAt) && !reminder.acknowledgedAt && !reminder.done;
}

export function unreadReminderCount() {
  return read().filter(isUnread).length;
}

/** Clear the unread state once the user has seen it. */
export function acknowledgeReminder(id) {
  write(
    read().map((item) =>
      item.id === id
        ? { ...item, acknowledgedAt: new Date().toISOString() }
        : item
    )
  );

  return getReminders();
}

export function acknowledgeAllReminders() {
  const now = new Date().toISOString();

  write(
    read().map((item) =>
      isUnread(item) ? { ...item, acknowledgedAt: now } : item
    )
  );

  return getReminders();
}

/**
 * "in 2 minutes" / "in 3 days" / "2 hours ago", in the user's language.
 *
 * Uses the browser's own relative-time formatting, so no translation
 * strings are needed.
 */
export function relativeDue(dueAt, language = "en") {
  const target = new Date(dueAt);

  if (Number.isNaN(target.getTime())) {
    return "";
  }

  const diffMinutes = Math.round((target - new Date()) / 60000);

  const [value, unit] =
    Math.abs(diffMinutes) < 60
      ? [diffMinutes, "minute"]
      : Math.abs(diffMinutes) < 1440
        ? [Math.round(diffMinutes / 60), "hour"]
        : [Math.round(diffMinutes / 1440), "day"];

  try {
    return new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(
      value,
      unit
    );
  } catch {
    return "";
  }
}

/* ---------------------------------------------------------
   Notifications
   --------------------------------------------------------- */

/** Reminders whose time has arrived and that have not been announced. */
export function getDueReminders() {
  const now = new Date();

  return read().filter(
    (reminder) =>
      !reminder.done && !reminder.notifiedAt && new Date(reminder.dueAt) <= now
  );
}

/** Mark a reminder as announced so it is not shown again. */
export function markReminderNotified(id) {
  write(
    read().map((item) =>
      item.id === id
        ? { ...item, notifiedAt: new Date().toISOString() }
        : item
    )
  );

  return getReminders();
}

export function notificationPermission() {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }

  return Notification.permission;
}

/** Ask the browser for permission. Must be called from a user action. */
export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}
