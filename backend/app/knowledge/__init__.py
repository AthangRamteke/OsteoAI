"""OsteoAI Knowledge & Support content.

One JSON file is the single source of truth: the Knowledge & Support page
renders it, and the Agent retrieves matching articles to ground its answers.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


_CONTENT_PATH = Path(__file__).with_name("content.json")

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "what", "why", "how", "does", "do",
    "i", "my", "me", "to", "of", "in", "on", "for", "and", "or", "it", "this",
    "that", "can", "with", "about", "be", "should", "will", "you", "your",
}

SUPPORTED_LANGUAGES = ("en", "hi", "mr")
DEFAULT_LANGUAGE = "en"


@lru_cache(maxsize=1)
def _load_all_content() -> dict[str, Any]:
    """The content file has one top-level key per supported language."""
    return json.loads(_CONTENT_PATH.read_text(encoding="utf-8"))


def load_content(lang: str | None = None) -> dict[str, Any]:
    """Content for one language, falling back to English for anything
    unsupported or missing."""
    all_content = _load_all_content()
    normalized = (lang or DEFAULT_LANGUAGE).strip().lower()

    if normalized not in SUPPORTED_LANGUAGES:
        normalized = DEFAULT_LANGUAGE

    return all_content.get(normalized) or all_content[DEFAULT_LANGUAGE]


def _words(text: str) -> set[str]:
    return {
        w for w in re.findall(r"[a-z0-9\-]+", text.lower()) if w not in _STOPWORDS
    }


def search_articles(query: str, limit: int = 2) -> list[dict[str, Any]]:
    """Rank articles by simple keyword overlap (tags weigh most)."""
    query_words = _words(query)
    query_text = query.lower()
    if not query_words:
        return []

    scored = []
    for article in load_content()["articles"]:
        score = 0
        for tag in article["tags"]:
            if tag in query_text:
                score += 3
            elif _words(tag) & query_words:
                score += 1
        score += 2 * len(_words(article["title"]) & query_words)
        if score >= 2:
            scored.append((score, article))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [article for _, article in scored[:limit]]


def knowledge_context(query: str) -> str:
    articles = search_articles(query)
    if not articles:
        return ""
    lines = ["OsteoAI Knowledge & Support excerpts (prefer these facts when relevant):"]
    for article in articles:
        lines.append(f"[{article['title']}] " + " ".join(article["body"]))
    return "\n".join(lines)
