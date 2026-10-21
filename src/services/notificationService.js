/*
 * Service-worker side of reminder alerts.
 *
 * The worker keeps its own copy of the schedule, so a reminder can
 * still be announced after the OsteoAI tab is closed, for as long as
 * the browser keeps the worker alive. The in-app banner stays the
 * primary path while a tab is open.
 */

const SW_URL = "/sw.js";

export function serviceWorkerSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export async function registerReminderWorker() {
  if (!serviceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: "/",
    });

    // Best effort: lets the browser wake the worker on its own schedule.
    // Only granted for installed apps in some browsers, so failure is fine.
    try {
      const status = await navigator.permissions?.query({
        name: "periodic-background-sync",
      });

      if (status?.state === "granted" && registration.periodicSync) {
        await registration.periodicSync.register("osteoai-reminders", {
          minInterval: 15 * 60 * 1000,
        });
      }
    } catch {
      // Periodic sync unavailable; timers and page loads still work.
    }

    return registration;
  } catch (error) {
    console.warn("OsteoAI reminder worker could not be registered:", error);
    return null;
  }
}

/** Hand the worker the reminders it should announce. */
export async function syncRemindersToWorker(reminders, notifyTitle) {
  if (!serviceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    registration.active?.postMessage({
      type: "SYNC_REMINDERS",
      reminders: reminders
        .filter((reminder) => !reminder.done)
        .map((reminder) => ({
          id: reminder.id,
          title: reminder.title,
          dueAt: reminder.dueAt,
          notifyTitle,
          shown: Boolean(reminder.notifiedAt),
        })),
    });
  } catch (error) {
    console.warn("Unable to sync reminders to the worker:", error);
  }
}

/** Called when the worker announced a reminder itself. */
export function onWorkerReminderShown(handler) {
  if (!serviceWorkerSupported()) {
    return () => {};
  }

  const listener = (event) => {
    if (event.data?.type === "REMINDER_SHOWN") {
      handler(event.data.id);
    }
  };

  navigator.serviceWorker.addEventListener("message", listener);

  return () => navigator.serviceWorker.removeEventListener("message", listener);
}

/**
 * True once the reminder worker is running.
 *
 * Waits for `serviceWorker.ready` rather than reading the registration
 * immediately: registration is still in flight when the page first
 * renders, which would otherwise report "not active" forever.
 */
export async function reminderWorkerActive() {
  if (!serviceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);

    return Boolean(registration?.active);
  } catch {
    return false;
  }
}
