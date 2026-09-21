"""Deterministic intent router used by the OsteoAI Agent foundation."""

from __future__ import annotations

import re


SUPPORTED_INTENTS = {
    "greeting",
    "explain_result",
    "assessment_help",
    "knowledge",
    "navigation",
    "document_assistant",
    "notification",
    "unknown",
}


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _contains_word(text: str, word: str) -> bool:
    """
    Check for a complete word instead of substring matching.

    This prevents words such as "this" from being interpreted
    as the greeting "hi".
    """
    return re.search(
        rf"\b{re.escape(word)}\b",
        text,
    ) is not None


def detect_intent(message: str) -> str:
    text = _normalize(message)

    if not text:
        return "unknown"

    # ---------------------------------------------------------
    # Result explanation
    # ---------------------------------------------------------
    #
    # This is intentionally checked before greeting because
    # questions such as "Why did I get this result?" contain
    # words that could otherwise trigger unrelated intents.
    #
    if any(
        phrase in text
        for phrase in (
            "explain my result",
            "explain my assessment",
            "explain my prediction",
            "why did i get this result",
            "why did i get this risk",
            "why is my risk",
            "why is my result",
            "what does my result mean",
            "what does my risk mean",
            "what does my risk level mean",
            "what does the risk level mean",
            "what does this result mean",
            "what influenced my result",
            "what factors influenced my result",
            "what factors affected my result",
            "which factors affected my result",
            "why is my risk high",
            "why is my risk low",
            "why is my risk moderate",
            "risk result",
            "risk score",
            "risk percentage",
            "prediction result",
            "model result",
            "my prediction",
            "shap",
            "परिणाम",
            "रिजल्ट",
            "जोखिम",
            "निकाल",
        )
    ):
        return "explain_result"

    # ---------------------------------------------------------
    # Greeting
    # ---------------------------------------------------------
    #
    # Use complete words rather than "hi" in text.
    #
    if (
        _contains_word(text, "hello")
        or _contains_word(text, "hi")
        or _contains_word(text, "hey")
        or _contains_word(text, "namaste")
        or "नमस्ते" in text
        or "नमस्कार" in text
        or "हाय" in text
        or "हॅलो" in text
    ):
        return "greeting"

    # ---------------------------------------------------------
    # Assessment help
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in (
            "assessment question",
            "assessment form",
            "help me fill",
            "help with my assessment",
            "what does this question mean",
            "what does this field mean",
            "smoking question",
            "alcohol question",
            "sedentary",
            "medical history question",
            "lifestyle question",
            "family history question",
            "फॉर्म",
            "असेसमेंट",
        )
    ):
        return "assessment_help"

    # ---------------------------------------------------------
    # Document assistant
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in (
            "upload document",
            "upload report",
            "upload pdf",
            "read my document",
            "read my report",
            "fill from document",
            "document autofill",
            "analyze my document",
            "analyze my report",
        )
    ):
        return "document_assistant"

    # ---------------------------------------------------------
    # Notifications
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in (
            "remind me",
            "set a reminder",
            "notification",
            "reminder",
            "याद दिलाना",
            "रिमाइंडर",
        )
    ):
        return "notification"

    # ---------------------------------------------------------
    # Navigation
    # ---------------------------------------------------------
    navigation_phrases = {
        "dashboard": "/dashboard",
        "open dashboard": "/dashboard",
        "go to dashboard": "/dashboard",
        "assessment": "/assessment",
        "new assessment": "/assessment",
        "start assessment": "/assessment",
        "home": "/",
        "go home": "/",
        "homepage": "/",
        "history": "/history",
        "assessment history": "/history",
        "knowledge": "/knowledge",
        "knowledge and support": "/knowledge",
        "support": "/knowledge",
    }

    if text in navigation_phrases:
        return "navigation"

    # Avoid treating a normal question containing "assessment"
    # as navigation.
    if text.startswith(("open ", "go to ", "take me to ", "show my ")):
        if any(
            page in text
            for page in (
                "dashboard",
                "assessment",
                "home",
                "history",
                "knowledge",
                "support",
                "help center",
            )
        ):
            return "navigation"

    # ---------------------------------------------------------
    # General osteoporosis knowledge
    # ---------------------------------------------------------
    if any(
        phrase in text
        for phrase in (
            "what is osteoporosis",
            "what are osteoporosis",
            "tell me about osteoporosis",
            "osteoporosis basics",
            "bone health",
            "what is a fracture",
            "what are fractures",
            "what is dexa",
            "what does dexa mean",
            "osteoporosis kya hai",
            "ऑस्टियोपोरोसिस",
            "हड्डियों",
        )
    ):
        return "knowledge"

    # ---------------------------------------------------------
    # Unknown
    # ---------------------------------------------------------
    return "unknown"