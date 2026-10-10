/*
 * Reminders created by the Agent, stored in this browser.
 *
 * A reminder is only written here after the user has explicitly
 * confirmed it in the chat, matching the Agent's rule that
 * read/explain/navigate is free but write/create needs confirmation.
 */

const REMINDERS_KEY = "osteoai_reminders";

export const REMINDERS_UPDATED_EVENT = "osteoai:reminders-updated";

function read() {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
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
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
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

    return new Date(a.dueAt) - new Date(b.dueAt);
  });
}

/** Store a reminder the user confirmed in the chat. */
export function addReminder({ title, due_at: dueAt, due_text: dueText }) {
  if (!title || !dueAt) {
    return getReminders();
  }

  const reminder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    dueAt,
    dueText: dueText || "",
    createdAt: new Date().toISOString(),
    done: false,
  };

  write([...read(), reminder].slice(-50));

  return getReminders();
}

export function toggleReminderDone(id) {
  write(
    read().map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
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
