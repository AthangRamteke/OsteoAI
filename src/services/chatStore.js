/*
 * Chat transcripts kept in the browser.
 *
 * The backend keeps conversation context in memory against a
 * conversation id, so storing that id with the messages lets a
 * conversation continue after the user visits another page.
 *
 * Each surface (the Assistant page, the result-screen assistant)
 * keeps its own transcript under its own key.
 */

import { userKey } from "./userStorage";

const PREFIX = "osteoai_chat_";
const MAX_MESSAGES = 60;

// Transcripts older than this are treated as a finished conversation.
const MAX_AGE_HOURS = 12;

export function loadChat(key) {
  try {
    const raw = localStorage.getItem(userKey(PREFIX + key));

    if (!raw) {
      return null;
    }

    const saved = JSON.parse(raw);
    const ageHours =
      (Date.now() - new Date(saved.updatedAt).getTime()) / 3_600_000;

    if (!Array.isArray(saved.messages) || ageHours > MAX_AGE_HOURS) {
      localStorage.removeItem(userKey(PREFIX + key));
      return null;
    }

    return {
      // A reply interrupted by a page change must not stay "streaming".
      messages: saved.messages.map((message) => ({
        ...message,
        streaming: false,
      })),
      conversationId: saved.conversationId || null,
    };
  } catch {
    return null;
  }
}

export function saveChat(key, messages, conversationId) {
  try {
    if (!messages.length) {
      localStorage.removeItem(userKey(PREFIX + key));
      return;
    }

    localStorage.setItem(
      userKey(PREFIX + key),
      JSON.stringify({
        messages: messages.slice(-MAX_MESSAGES),
        conversationId,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.warn("Unable to save OsteoAI chat:", error);
  }
}

export function clearChat(key) {
  try {
    localStorage.removeItem(userKey(PREFIX + key));
  } catch (error) {
    console.warn("Unable to clear OsteoAI chat:", error);
  }
}

/* ---------------------------------------------------------
   Past conversations
   --------------------------------------------------------- */

const ARCHIVE_KEY = "osteoai_chat_archive";
const MAX_ARCHIVED = 15;

function readArchive() {
  try {
    const raw = localStorage.getItem(userKey(ARCHIVE_KEY));
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((item) => item?.id) : [];
  } catch {
    return [];
  }
}

function writeArchive(items) {
  try {
    localStorage.setItem(userKey(ARCHIVE_KEY), JSON.stringify(items.slice(0, MAX_ARCHIVED)));
  } catch (error) {
    console.warn("Unable to save OsteoAI chat archive:", error);
  }
}

/** Past conversations, newest first. */
export function listArchivedChats() {
  return readArchive();
}

/**
 * Keep the current transcript before it is cleared, so starting a new
 * conversation never throws the old one away.
 */
export function archiveChat(messages, conversationId) {
  const real = messages.filter((message) => message.content?.trim());

  if (real.length < 2) {
    return listArchivedChats();
  }

  const existing = readArchive();

  // Reopening a conversation and putting it back must not create a
  // second copy of the same transcript.
  const fingerprint = (list) =>
    list.map((message) => `${message.role}:${message.content}`).join("|");

  const transcript = fingerprint(real);

  if (existing.some((item) => fingerprint(item.messages || []) === transcript)) {
    return existing;
  }

  const firstQuestion = real.find((message) => message.role === "user");

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: (firstQuestion?.content || real[0].content).slice(0, 80),
    savedAt: new Date().toISOString(),
    messageCount: real.length,
    messages: real.map(({ role, content }) => ({ role, content })),
    conversationId,
  };

  writeArchive([entry, ...existing]);

  return listArchivedChats();
}

export function deleteArchivedChat(id) {
  writeArchive(readArchive().filter((item) => item.id !== id));

  return listArchivedChats();
}
