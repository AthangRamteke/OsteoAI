/*
 * OsteoAI reminder service worker.
 *
 * The page hands over the reminder schedule; this worker then shows a
 * notification when one comes due, including when the OsteoAI tab is
 * no longer open, for as long as the browser keeps the worker alive.
 *
 * It fires on three occasions:
 *   - a timer, while the worker is running
 *   - any wake-up (a message, a page load, a periodic sync), which
 *     catches anything that came due while the worker was asleep
 *   - the page itself, which shows an in-app banner when it is open
 *
 * Notifications are tagged with the reminder id, so the page and the
 * worker can never stack two alerts for the same reminder.
 */

const DB_NAME = "osteoai-reminders";
const STORE = "scheduled";
const CHECK_WINDOW_MS = 60_000;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* ---------------------------------------------------------
   Tiny IndexedDB helpers (the schedule must outlive the worker)
   --------------------------------------------------------- */

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, run) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const result = run(transaction.objectStore(STORE));

    transaction.oncomplete = () => resolve(result?.result ?? result);
    transaction.onerror = () => reject(transaction.error);
  });
}

const readAll = () => withStore("readonly", (store) => store.getAll());

async function replaceAll(reminders) {
  await withStore("readwrite", (store) => {
    store.clear();
    reminders.forEach((reminder) => store.put(reminder));
  });
}

const markShown = (id) =>
  withStore("readwrite", (store) => {
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        store.put({ ...request.result, shown: true });
      }
    };
  });

/* ---------------------------------------------------------
   Showing reminders
   --------------------------------------------------------- */

async function showDueReminders() {
  let scheduled = [];

  try {
    scheduled = (await readAll()) || [];
  } catch {
    return;
  }

  const now = Date.now();

  for (const reminder of scheduled) {
    if (reminder.shown || new Date(reminder.dueAt).getTime() > now) {
      continue;
    }

    await self.registration.showNotification(reminder.notifyTitle || "OsteoAI reminder", {
      body: reminder.title,
      tag: reminder.id,
      requireInteraction: true,
      data: { url: "/assistant" },
    });

    await markShown(reminder.id);

    // Let any open tab mark it as announced too.
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) =>
      client.postMessage({ type: "REMINDER_SHOWN", id: reminder.id })
    );
  }

  scheduleNextCheck(scheduled, now);
}

let checkTimer = null;

/** Keep a timer for the next reminder while the worker is alive. */
function scheduleNextCheck(scheduled, now) {
  const upcoming = scheduled
    .filter((reminder) => !reminder.shown)
    .map((reminder) => new Date(reminder.dueAt).getTime() - now)
    .filter((delay) => delay > 0);

  if (!upcoming.length) {
    return;
  }

  clearTimeout(checkTimer);
  checkTimer = setTimeout(
    showDueReminders,
    Math.min(Math.min(...upcoming) + 1000, CHECK_WINDOW_MS)
  );
}

/* ---------------------------------------------------------
   Events
   --------------------------------------------------------- */

self.addEventListener("message", (event) => {
  const { type, reminders } = event.data || {};

  if (type === "SYNC_REMINDERS") {
    event.waitUntil(replaceAll(reminders || []).then(showDueReminders));
  }

  if (type === "CHECK_REMINDERS") {
    event.waitUntil(showDueReminders());
  }
});

// Any page load wakes the worker, which catches missed reminders.
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.waitUntil(showDueReminders());
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "osteoai-reminders") {
    event.waitUntil(showDueReminders());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = event.notification.data?.url || "/assistant";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate?.(target);
            return client.focus();
          }
        }

        return self.clients.openWindow(target);
      })
  );
});
