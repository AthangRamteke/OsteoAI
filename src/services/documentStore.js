/*
 * Documents the user has uploaded and accepted for autofill.
 *
 * Only a compact record is kept (filename, date, extracted field
 * summary) so the dashboard can list them and the Agent can talk
 * about them. The file itself is never stored.
 */

const DOCUMENTS_KEY = "osteoai_documents";

export const DOCUMENTS_UPDATED_EVENT = "osteoai:documents-updated";

function read() {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((item) => item?.id) : [];
  } catch {
    return [];
  }
}

/** Newest first. */
export function getDocuments() {
  return read().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export function addDocument(extraction, fileName) {
  if (!extraction) {
    return getDocuments();
  }

  const fields = Array.isArray(extraction.fields) ? extraction.fields : [];

  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename: extraction.filename || fileName || "document",
    savedAt: new Date().toISOString(),
    extractionMethod: extraction.extraction_method || "",
    foundCount: fields.filter((field) => field.status === "found").length,
    reviewCount: fields.filter((field) => field.status !== "found").length,
    // Keep the field summary so the Agent can answer questions later.
    fields: fields.map((field) => ({
      label: field.label,
      value: field.value,
      status: field.status,
      confidence: field.confidence,
    })),
  };

  try {
    localStorage.setItem(
      DOCUMENTS_KEY,
      JSON.stringify([record, ...read()].slice(0, 10))
    );
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
  } catch (error) {
    console.warn("Unable to save OsteoAI document record:", error);
  }

  return getDocuments();
}

export function deleteDocument(id) {
  try {
    localStorage.setItem(
      DOCUMENTS_KEY,
      JSON.stringify(read().filter((item) => item.id !== id))
    );
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
  } catch (error) {
    console.warn("Unable to update OsteoAI documents:", error);
  }

  return getDocuments();
}

/* ---------------------------------------------------------
   Generated health summary
   --------------------------------------------------------- */

const SUMMARY_KEY = "osteoai_health_summary";

export function getHealthSummary() {
  try {
    const raw = localStorage.getItem(SUMMARY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveHealthSummary(text) {
  const summary = { text, createdAt: new Date().toISOString() };

  try {
    localStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
  } catch (error) {
    console.warn("Unable to save OsteoAI health summary:", error);
  }

  return summary;
}

export function clearHealthSummary() {
  try {
    localStorage.removeItem(SUMMARY_KEY);
  } catch (error) {
    console.warn("Unable to clear OsteoAI health summary:", error);
  }
}
