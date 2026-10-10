"""Core orchestration layer for the OsteoAI Agent foundation."""

from __future__ import annotations

import logging
from typing import Any, Iterator

from app.agent.conversation import get_or_create_conversation
from app.agent.intent import detect_intent
from app.agent.llm import ProviderError, generate, generate_stream
from app.agent.reminders import (
    cancelled_text,
    confirm_text,
    created_text,
    format_due,
    is_affirmative,
    is_negative,
    need_time_text,
    parse_reminder,
)
from app.agent.prompt import (
    EMERGENCY_NOTICE,
    build_system_prompt,
    clean_reply,
    is_possible_emergency,
)
from app.agent.tools import (
    assessment_help,
    document_assistant_answer,
    explain_result,
    knowledge_answer,
    navigation_answer,
    notification_answer,
)


logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {"en", "hi", "mr"}


def normalize_language(language: str | None) -> str:
    value = (language or "en").strip().lower()
    return value if value in SUPPORTED_LANGUAGES else "en"


def _greeting(language: str) -> str:
    if language == "hi":
        return (
            "नमस्ते! मैं OsteoAI Assistant हूँ। "
            "मैं आपके assessment, result और osteoporosis से जुड़े "
            "सामान्य सवालों में मदद कर सकता हूँ।"
        )

    if language == "mr":
        return (
            "नमस्कार! मी OsteoAI Assistant आहे. "
            "मी तुमच्या assessment, result आणि osteoporosis संबंधित "
            "सामान्य प्रश्नांमध्ये मदत करू शकतो."
        )

    return (
        "Hello! I'm the OsteoAI Assistant. "
        "I can help with your assessment, result, and general "
        "osteoporosis questions."
    )


def _unknown(language: str) -> str:
    if language == "hi":
        return (
            "मैं आपकी मदद कर सकता हूँ। आप अपने result की explanation, "
            "assessment question, osteoporosis के बारे में जानकारी "
            "या app navigation के बारे में पूछ सकते हैं।"
        )

    if language == "mr":
        return (
            "मी मदत करू शकतो. तुम्ही result explanation, assessment "
            "question, osteoporosis माहिती किंवा app navigation बद्दल "
            "विचारू शकता."
        )

    return (
        "I can help with your result, an assessment question, "
        "general osteoporosis information, or navigating the "
        "OsteoAI app."
    )


# Intents that trigger an app action stay deterministic so the frontend only
# ever receives whitelisted actions. Everything else is answered by the LLM.
_ACTION_INTENTS = {"navigation", "notification"}


def _reminder_turn(
    conversation,
    message: str,
    intent: str,
    language: str,
) -> dict[str, Any] | None:
    """Handle the reminder request/confirm/cancel exchange.

    Creating a reminder changes stored data, so it only happens after the
    user explicitly confirms the exact reminder the Agent showed them.
    Returns None when this turn is not about reminders.
    """
    pending = conversation.pending_reminder

    if pending:
        if is_affirmative(message):
            conversation.pending_reminder = None
            return {
                "message": created_text(
                    pending["title"], pending["due_text"], language
                ),
                "data": {},
                "action": {"type": "create_reminder", "reminder": pending},
            }

        if is_negative(message):
            conversation.pending_reminder = None
            return {"message": cancelled_text(language), "data": {}}

        # Anything else: drop the pending reminder and answer normally,
        # rather than holding the conversation hostage to a yes/no.
        conversation.pending_reminder = None

    if intent != "notification":
        return None

    parsed = parse_reminder(message)

    if not parsed["has_time"]:
        return {"message": need_time_text(parsed["title"], language), "data": {}}

    reminder = {
        "title": parsed["title"],
        "due_at": parsed["due_at"],
        "due_text": format_due(parsed["due_at"], language),
    }
    conversation.pending_reminder = reminder

    return {
        "message": confirm_text(reminder["title"], reminder["due_text"], language),
        "data": {},
        "action": {"type": "reminder_preview", "reminder": reminder},
        "needs_confirmation": True,
    }


def _deterministic_answer(
    intent: str,
    message: str,
    language: str,
    context: dict[str, Any],
) -> dict[str, Any]:
    if intent == "greeting":
        return {"message": _greeting(language), "data": {}}
    if intent == "explain_result":
        return explain_result(context)
    if intent == "assessment_help":
        return assessment_help(message)
    if intent == "knowledge":
        return knowledge_answer(message)
    if intent == "navigation":
        return navigation_answer(message)
    if intent == "document_assistant":
        return document_assistant_answer(context)
    if intent == "notification":
        return notification_answer()
    return {"message": _unknown(language), "data": {}}


def _llm_messages(
    conversation,
    message: str,
    language: str,
    context: dict[str, Any],
) -> list[dict[str, str]]:
    messages = [
        {"role": "system", "content": build_system_prompt(context, language, message)}
    ]
    messages += [
        {"role": t["role"], "content": t["content"]}
        for t in conversation.turns
        if t["role"] in ("user", "assistant")
    ]
    messages.append({"role": "user", "content": message})
    return messages


def _llm_answer(
    conversation,
    message: str,
    language: str,
    context: dict[str, Any],
) -> dict[str, Any] | None:
    messages = _llm_messages(conversation, message, language, context)

    try:
        reply, provider = generate(messages)
    except ProviderError:
        logger.exception("All LLM providers failed; using deterministic answer")
        return None
    return {"message": clean_reply(reply), "data": {"provider": provider}}


def _emergency_prefix(message: str, language: str) -> str:
    if is_possible_emergency(message):
        return f"{EMERGENCY_NOTICE[language]}\n\n"
    return ""


def _save_turns(conversation, message: str, reply: str, intent: str) -> None:
    conversation.add_turn("user", message, intent=intent)
    conversation.add_turn("assistant", reply, intent=intent)


def handle_message_stream(
    *,
    message: str,
    language: str | None,
    conversation_id: str | None,
    context: dict[str, Any] | None,
) -> Iterator[dict[str, Any]]:
    """Yield Agent events: one "meta", zero or more "delta", then "done".

    The final "done" event carries the cleaned full reply, which the
    frontend should display in place of the streamed text.
    """
    language_code = normalize_language(language)
    conversation = get_or_create_conversation(conversation_id, language_code)
    intent = detect_intent(message)
    safe_context = context if isinstance(context, dict) else {}

    result = _reminder_turn(conversation, message, intent, language_code)

    if result is None and intent in _ACTION_INTENTS:
        result = _deterministic_answer(intent, message, language_code, safe_context)

    yield {
        "type": "meta",
        "conversation_id": conversation.conversation_id,
        "intent": intent,
        "language": language_code,
        "action": (result or {}).get("action"),
        "needs_confirmation": bool((result or {}).get("needs_confirmation")),
    }

    prefix = _emergency_prefix(message, language_code)
    if prefix:
        yield {"type": "delta", "text": prefix}

    if result is None:
        # Snapshot history before this turn is stored.
        messages = _llm_messages(conversation, message, language_code, safe_context)
        parts: list[str] = []
        try:
            for text, _provider in generate_stream(messages):
                parts.append(text)
                yield {"type": "delta", "text": text}
            result = {"message": clean_reply("".join(parts))}
        except ProviderError:
            logger.exception("All LLM providers failed; using deterministic answer")
            if parts:
                result = {"message": clean_reply("".join(parts))}
            else:
                result = _deterministic_answer(
                    intent, message, language_code, safe_context
                )

    reply = prefix + result["message"]
    _save_turns(conversation, message, reply, intent)

    yield {"type": "done", "message": reply}


def handle_message(
    *,
    message: str,
    language: str | None,
    conversation_id: str | None,
    context: dict[str, Any] | None,
) -> dict[str, Any]:
    language_code = normalize_language(language)

    conversation = get_or_create_conversation(
        conversation_id,
        language_code,
    )

    intent = detect_intent(message)

    safe_context = context if isinstance(context, dict) else {}

    tool_result = _reminder_turn(conversation, message, intent, language_code)

    if tool_result is None and intent not in _ACTION_INTENTS:
        tool_result = _llm_answer(
            conversation, message, language_code, safe_context
        )
    if tool_result is None:
        tool_result = _deterministic_answer(
            intent, message, language_code, safe_context
        )

    if is_possible_emergency(message):
        notice = EMERGENCY_NOTICE[language_code]
        if notice not in tool_result["message"]:
            tool_result["message"] = f"{notice}\n\n{tool_result['message']}"

    conversation.add_turn(
        "user",
        message,
        intent=intent,
    )

    conversation.add_turn(
        "assistant",
        tool_result["message"],
        intent=intent,
    )

    return {
        "conversation_id": conversation.conversation_id,
        "intent": intent,
        "language": language_code,
        "message": tool_result["message"],
        "action": tool_result.get("action"),
        "needs_confirmation": bool(tool_result.get("needs_confirmation")),
    }
