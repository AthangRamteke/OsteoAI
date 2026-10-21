const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Knowledge & Support content (articles, myths, glossary, FAQs).
 *
 * `lang` selects which translated copy of the content the backend
 * returns (en/hi/mr); it falls back to English server-side for
 * anything unsupported.
 */
export async function fetchKnowledge(lang) {
  const language = lang || localStorage.getItem("osteoai-language") || "en";
  const response = await fetch(
    `${API_BASE_URL}/api/knowledge?lang=${encodeURIComponent(language)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load Knowledge & Support content.");
  }

  return response.json();
}
