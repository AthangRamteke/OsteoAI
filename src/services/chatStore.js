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

const PREFIX = "osteoai_chat_";
const MAX_MESSAGES = 60;

// Transcripts older than this are treated as a finished conversation.
const MAX_AGE_HOURS = 12;

export function loadChat(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);

    if (!raw) {
      return null;
    }

    const saved = JSON.parse(raw);
    const ageHours =
      (Date.now() - new Date(saved.updatedAt).getTime()) / 3_600_000;

    if (!Array.isArray(saved.messages) || ageHours > MAX_AGE_HOURS) {
      localStorage.removeItem(PREFIX + key);
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
      localStorage.removeItem(PREFIX + key);
      return;
    }

    localStorage.setItem(
      PREFIX + key,
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
    localStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.warn("Unable to clear OsteoAI chat:", error);
  }
}
