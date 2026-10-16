/*
 * Keeps the browser copy of the signed-in user's assessment history in
 * step with the server, so history follows the account to any browser
 * or device and a brand-new account starts empty.
 *
 * The browser copy (see historyStore.js) is what the pages read; this
 * module fills it from the server after sign-in and sends new or
 * deleted records the other way. Failures are silent on purpose: the
 * app keeps working from the browser copy and the next sign-in retries.
 */

import {
  getToken,
  getUserId,
  historyKey,
  latestKey,
} from "./userStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const UPDATED_EVENT = "osteoai:assessment-updated";
const MAX_LOCAL_RECORDS = 25;

async function call(path, { method = "GET", body } = {}) {
  const token = getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`History request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

function readLocal(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const isValid = (record) =>
  record?.id && record?.assessmentData && record?.predictionResult;

/** Pull the user's history from the server and merge it into the browser copy. */
export async function syncHistoryFromServer() {
  const userId = getUserId();
  const data = await call("/api/history");

  // Signed out, or a different user signed in, while the request ran.
  if (!data || getUserId() !== userId) {
    return;
  }

  const server = (data.records || []).filter(isValid);
  const local = readLocal(historyKey()).filter(isValid);

  const merged = new Map();

  for (const record of [...server, ...local]) {
    if (!merged.has(record.id)) {
      merged.set(record.id, record);
    }
  }

  const history = [...merged.values()]
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    .slice(0, MAX_LOCAL_RECORDS);

  try {
    localStorage.setItem(historyKey(), JSON.stringify(history));

    if (history[0]) {
      localStorage.setItem(latestKey(), JSON.stringify(history[0]));
    } else {
      localStorage.removeItem(latestKey());
    }
  } catch {
    return;
  }

  window.dispatchEvent(new Event(UPDATED_EVENT));

  // Anything saved here while the server was unreachable goes up now.
  const onServer = new Set(server.map((record) => record.id));

  for (const record of local) {
    if (!onServer.has(record.id)) {
      pushHistoryRecord(record);
    }
  }
}

export function pushHistoryRecord(record) {
  call("/api/history", { method: "POST", body: record }).catch(() => {});
}

export function deleteHistoryRecordRemote(id) {
  call(`/api/history/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
    () => {}
  );
}
