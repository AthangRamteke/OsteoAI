"""Reminder parsing and confirmation copy for the OsteoAI Agent.

Reminders are a write action, so the Agent never creates one directly:
it parses the request, shows exactly what will be created, and waits for
an explicit confirmation. Parsing is deterministic rather than model-based
so the date shown to the user is always the date that gets stored.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any


# Part-of-day -> hour used when the user gives no clock time.
_DAY_PARTS = {
    "morning": 9,
    "afternoon": 15,
    "evening": 18,
    "tonight": 20,
    "night": 20,
    "सुबह": 9,
    "दोपहर": 15,
    "शाम": 18,
    "रात": 20,
    "सकाळी": 9,
    "दुपारी": 15,
    "संध्याकाळी": 18,
    "रात्री": 20,
}

_WEEKDAYS = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}

# Hindi/Marathi day names, matched as stems so locative forms
# such as "सोमवारी" also work.
_WEEKDAYS_DEV = {
    "सोमवार": 0, "मंगलवार": 1, "मंगळवार": 1, "बुधवार": 2,
    "गुरुवार": 3, "गुरूवार": 3, "बृहस्पतिवार": 3,
    "शुक्रवार": 4, "शनिवार": 5, "रविवार": 6, "इतवार": 6,
}

_DEFAULT_HOUR = 9

# Phrases stripped from the start of a request to leave the task itself.
_TASK_PREFIXES = [
    r"^(please\s+)?remind me to\s+",
    r"^(please\s+)?remind me\s+",
    r"^(please\s+)?set (a|an)? ?reminder to\s+",
    r"^(please\s+)?set (a|an)? ?reminder for\s+",
    r"^(please\s+)?set (a|an)? ?reminder\s+",
    r"^(please\s+)?create (a|an)? ?reminder to\s+",
    r"^(please\s+)?create (a|an)? ?reminder\s+",
    r"^मुझे\s+",
    r"^मला\s+",
]

_TASK_SUFFIXES = [
    r"\s*(की|का|के)?\s*याद दिलाना.*$",
    r"\s*रिमाइंडर.*$",
    r"\s*आठवण करून दे.*$",
    r"\s*स्मरणपत्र.*$",
]

_AFFIRMATIVE = {
    "yes", "y", "yeah", "yep", "yup", "sure", "ok", "okay", "confirm",
    "confirmed", "please do", "go ahead", "do it", "create it", "save it",
    "haan", "han", "ha", "हाँ", "हां", "ठीक है", "बनाओ", "हो", "होय", "ठीक आहे",
}

_NEGATIVE = {
    "no", "n", "nope", "cancel", "don't", "dont", "do not", "stop",
    "nevermind", "never mind", "not now", "nahi", "नहीं", "नको", "रद्द",
}


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def is_affirmative(message: str) -> bool:
    text = _normalize(message).strip(" .!")
    return text in _AFFIRMATIVE or text.startswith(("yes ", "yeah ", "sure ", "ok "))


def is_negative(message: str) -> bool:
    text = _normalize(message).strip(" .!")
    return text in _NEGATIVE or text.startswith(("no ", "cancel", "don't", "dont "))


def _clock_time(text: str) -> tuple[int, int] | None:
    """Explicit clock time such as "7pm", "7:30 pm" or "19:00"."""
    match = re.search(r"\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", text)
    if match:
        hour = int(match.group(1)) % 12
        if match.group(3) == "pm":
            hour += 12
        return hour, int(match.group(2) or 0)

    match = re.search(r"\b(?:at\s+)?(\d{1,2}):(\d{2})\b", text)
    if match:
        hour, minute = int(match.group(1)), int(match.group(2))
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return hour, minute
    return None


def _day_part_hour(text: str) -> int | None:
    for word, hour in _DAY_PARTS.items():
        if word in text:
            return hour
    return None


def _resolve_datetime(text: str, now: datetime) -> datetime | None:
    """Resolve a due date/time from the phrase, or None if none is given."""
    clock = _clock_time(text)
    part_hour = _day_part_hour(text)
    base_hour = clock[0] if clock else (part_hour if part_hour is not None else _DEFAULT_HOUR)
    base_minute = clock[1] if clock else 0

    def at(day: datetime) -> datetime:
        return day.replace(hour=base_hour, minute=base_minute, second=0, microsecond=0)

    # "in 10 minutes" / "in 3 days" / "after 2 hours" / "in a week"
    match = re.search(
        r"\b(?:in|after)\s+(a|an|\d+)\s*"
        r"(min|mins|minute|minutes|hour|hours|hr|hrs|day|days|week|weeks|month|months)\b",
        text,
    )
    if match:
        amount = 1 if match.group(1) in ("a", "an") else int(match.group(1))
        unit = match.group(2)
        if unit.startswith("min"):
            return (now + timedelta(minutes=amount)).replace(second=0, microsecond=0)
        if unit.startswith(("hour", "hr")):
            return (now + timedelta(hours=amount)).replace(second=0, microsecond=0)
        days = amount * (7 if unit.startswith("week") else 30 if unit.startswith("month") else 1)
        return at(now + timedelta(days=days))

    if "day after tomorrow" in text or "परसों" in text or "परवा" in text:
        return at(now + timedelta(days=2))

    if "tomorrow" in text or "कल" in text or "उद्या" in text:
        return at(now + timedelta(days=1))

    if "next week" in text or "अगले हफ्ते" in text or "पुढच्या आठवड्यात" in text:
        return at(now + timedelta(days=7))

    if "next month" in text or "अगले महीने" in text or "पुढच्या महिन्यात" in text:
        return at(now + timedelta(days=30))

    for name, weekday in _WEEKDAYS.items():
        if re.search(rf"\b{name}\b", text):
            ahead = (weekday - now.weekday()) % 7 or 7
            return at(now + timedelta(days=ahead))

    for name, weekday in _WEEKDAYS_DEV.items():
        if name in text:
            ahead = (weekday - now.weekday()) % 7 or 7
            return at(now + timedelta(days=ahead))

    if "today" in text or "tonight" in text or "आज" in text:
        candidate = at(now)
        return candidate if candidate > now else (now + timedelta(hours=1)).replace(second=0, microsecond=0)

    # A bare time ("remind me at 7pm") means the next time it comes around.
    if clock or part_hour is not None:
        candidate = at(now)
        return candidate if candidate > now else at(now + timedelta(days=1))

    return None


def _extract_task(message: str) -> str:
    task = message.strip()
    for pattern in _TASK_PREFIXES:
        task = re.sub(pattern, "", task, flags=re.IGNORECASE)
    for pattern in _TASK_SUFFIXES:
        task = re.sub(pattern, "", task)

    # Drop the timing words; what remains is the task itself.
    timing = [
        r"\bday after tomorrow\b", r"\btomorrow\b", r"\btonight\b", r"\btoday\b",
        r"\bnext week\b", r"\bnext month\b",
        r"\b(in|after)\s+(a|an|\d+)\s*"
        r"(min|mins|minute|minutes|hour|hours|hr|hrs|day|days|week|weeks|month|months)\b",
        r"\b(on|next|this|coming)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b", r"\b\d{1,2}:\d{2}\b",
        r"\b(this|in the)\s+(morning|afternoon|evening|night)\b",
        r"\b(morning|afternoon|evening|night)\b",
        # No \b for Devanagari: a trailing vowel sign is not a word
        # character, so a word boundary would never match after it.
        r"कल", r"आज", r"परसों", r"उद्या", r"परवा",
        r"(सुबह|दोपहर|शाम|रात्री|रात|सकाळी|दुपारी|संध्याकाळी)",
        r"(अगले|अगली|पुढच्या|पुढील|येत्या)?\s*(सोमवार|मंगलवार|मंगळवार|बुधवार|गुरुवार|गुरूवार|बृहस्पतिवार|शुक्रवार|शनिवार|रविवार|इतवार)\S*",
        r"(अगले हफ्ते|अगले महीने|पुढच्या आठवड्यात|पुढच्या महिन्यात)",
    ]
    for pattern in timing:
        task = re.sub(pattern, " ", task, flags=re.IGNORECASE)

    task = re.sub(r"\s+", " ", task).strip(" ,.;:-")
    # Timing words can leave a dangling "to"/"that" at the start.
    task = re.sub(r"^(to|that|about)\s+", "", task, flags=re.IGNORECASE)
    return task.strip(" ,.;:-")


def parse_reminder(message: str, now: datetime | None = None) -> dict[str, Any] | None:
    """Return {title, due_at, has_time} for a reminder request.

    `due_at` is None when the user gave no timing; the Agent then asks for one.
    """
    now = now or datetime.now()
    text = _normalize(message)

    due_at = _resolve_datetime(text, now)
    title = _extract_task(message) or "Bone-health reminder"

    return {
        "title": title[:120],
        "due_at": due_at.isoformat(timespec="minutes") if due_at else None,
        "has_time": due_at is not None,
    }


# ---------------------------------------------------------------------------
# Localized copy (deterministic, so it never depends on the model)
# ---------------------------------------------------------------------------

_MONTHS = {
    "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "hi": ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्ट", "नव", "दिस"],
    "mr": ["जान", "फेब्रु", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑग", "सप्टें", "ऑक्टो", "नोव्हें", "डिसें"],
}


def format_due(due_at: str, language: str) -> str:
    moment = datetime.fromisoformat(due_at)
    month = _MONTHS.get(language, _MONTHS["en"])[moment.month - 1]
    hour = moment.hour % 12 or 12
    suffix = "AM" if moment.hour < 12 else "PM"
    return f"{moment.day} {month} {moment.year}, {hour}:{moment.minute:02d} {suffix}"


def confirm_text(title: str, due_text: str, language: str) -> str:
    if language == "hi":
        return (
            f"मैं यह रिमाइंडर बनाऊँगा:\n- काम: {title}\n- समय: {due_text}\n\n"
            "क्या मैं इसे बना दूँ? \"हाँ\" लिखें।"
        )
    if language == "mr":
        return (
            f"मी हे स्मरणपत्र तयार करेन:\n- काम: {title}\n- वेळ: {due_text}\n\n"
            "मी ते तयार करू का? \"होय\" लिहा."
        )
    return (
        f"I'll create this reminder:\n- Task: {title}\n- When: {due_text}\n\n"
        "Shall I create it? Reply \"yes\" to confirm."
    )


def need_time_text(title: str, language: str) -> str:
    if language == "hi":
        return (
            f"मैं \"{title}\" का रिमाइंडर बना सकता हूँ, पर समय चाहिए। "
            "जैसे: \"कल शाम\" या \"3 दिन में\"।"
        )
    if language == "mr":
        return (
            f"मी \"{title}\" चे स्मरणपत्र तयार करू शकतो, पण वेळ हवी. "
            "उदा.: \"उद्या संध्याकाळी\" किंवा \"3 दिवसांत\"."
        )
    return (
        f"I can set a reminder for \"{title}\", but I need a time. "
        "For example: \"tomorrow evening\" or \"in 3 days\"."
    )


def created_text(title: str, due_text: str, language: str) -> str:
    if language == "hi":
        return f"रिमाइंडर बन गया: {title} — {due_text}. आप इसे AI असिस्टेंट पेज पर देख सकते हैं।"
    if language == "mr":
        return f"स्मरणपत्र तयार झाले: {title} — {due_text}. ते तुम्ही AI असिस्टंट पेजवर पाहू शकता."
    return f"Reminder created: {title} — {due_text}. You can see it on the AI Assistant page."


def cancelled_text(language: str) -> str:
    if language == "hi":
        return "ठीक है, मैंने कोई रिमाइंडर नहीं बनाया।"
    if language == "mr":
        return "ठीक आहे, मी कोणतेही स्मरणपत्र तयार केले नाही."
    return "Okay, I haven't created the reminder."
