/*
 * Who is signed in, for anything the app keeps in the browser.
 *
 * Browser storage is shared by every account that uses the same browser,
 * so each user's data is stored under a key that includes their id. A
 * new account therefore starts empty, and one person's history, chats or
 * documents are never shown to another.
 *
 * AuthProvider calls setSession() whenever the signed-in user changes.
 */

let session = { userId: null, token: null };

export function setSession(userId, token) {
  session = { userId: userId ?? null, token: token ?? null };
}

export function getUserId() {
  return session.userId;
}

export function getToken() {
  return session.token;
}

/** "osteoai_chat_x" -> "osteoai_chat_x:u42" for the signed-in user. */
export function userKey(base) {
  return session.userId ? `${base}:u${session.userId}` : base;
}

const HISTORY_BASE = "osteoai_assessment_history";
const LATEST_BASE = "osteoai_latest_assessment";

export const historyKey = () => userKey(HISTORY_BASE);
export const latestKey = () => userKey(LATEST_BASE);
