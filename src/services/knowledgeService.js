const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/** Knowledge & Support content (articles, myths, glossary, FAQs). */
export async function fetchKnowledge() {
  const response = await fetch(`${API_BASE_URL}/api/knowledge`);

  if (!response.ok) {
    throw new Error("Unable to load Knowledge & Support content.");
  }

  return response.json();
}
