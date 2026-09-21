"""Tool handlers for the initial OsteoAI Agent foundation."""

from __future__ import annotations

from typing import Any


def explain_result(context: dict[str, Any]) -> dict[str, Any]:
    result = context.get("prediction_result") or {}

    probability = result.get("osteoporosis_probability")
    risk_level = result.get("risk_level")
    threshold = result.get("threshold_used")
    model_version = result.get("model_version")

    if probability is None and risk_level is None:
        return {
            "message": (
                "I can explain your OsteoAI result, but the current chat "
                "request did not include a prediction result. Open your "
                "completed result and ask me again."
            ),
            "data": {},
        }

    parts: list[str] = []

    if probability is not None:
        try:
            parts.append(
                "The model's estimated probability for the positive "
                f"osteoporosis class is {float(probability) * 100:.1f}%."
            )
        except (TypeError, ValueError):
            parts.append("The model returned a probability value.")

    if risk_level:
        parts.append(
            f"The application displays this assessment as {risk_level} risk."
        )

    if threshold is not None:
        parts.append(
            f"The prediction flag used a model decision threshold of {threshold}."
        )

    shap_items = result.get("shap_explanations") or []

    if isinstance(shap_items, list) and shap_items:
        parts.append(
            "The result also includes patient-specific SHAP explanations "
            "showing which model inputs contributed to the model output; "
            "they explain the prediction rather than changing it."
        )

    if model_version:
        parts.append(f"Model version: {model_version}.")

    parts.append(
        "This is a research/prototype risk-assessment explanation, "
        "not a medical diagnosis or a substitute for professional medical care."
    )

    return {
        "message": " ".join(parts),
        "data": {
            "probability": probability,
            "risk_level": risk_level,
            "threshold_used": threshold,
            "model_version": model_version,
        },
    }


def assessment_help(message: str) -> dict[str, Any]:
    text = message.lower()

    if "smoking" in text:
        answer = (
            "The smoking question asks about your smoking history because "
            "smoking is one of the inputs included in this OsteoAI model. "
            "Choose the option that matches your history rather than guessing."
        )

    elif "alcohol" in text:
        answer = (
            "The alcohol section records alcohol-related information used "
            "by the assessment. For frequency, select the option that most "
            "accurately matches your own history."
        )

    elif "sedentary" in text:
        answer = (
            "Sedentary time refers to the amount of time you typically spend "
            "sitting or otherwise inactive during a day. Enter your best "
            "estimate in minutes per day."
        )

    elif "medical history" in text:
        answer = (
            "Medical-history questions are used as model inputs. Select the "
            "answer that best reflects your own history; do not guess when "
            "you are unsure."
        )

    else:
        answer = (
            "I can help explain an assessment question or what a field means. "
            "Tell me the field name, such as smoking, alcohol, sedentary time, "
            "or family history."
        )

    return {
        "message": answer,
        "data": {},
    }


def knowledge_answer(message: str) -> dict[str, Any]:
    text = message.lower()

    if "dexa" in text:
        answer = (
            "DEXA is an imaging test used to measure bone mineral density. "
            "OsteoAI is a risk-assessment prototype and does not replace "
            "clinical testing or diagnosis."
        )

    elif "fracture" in text:
        answer = (
            "A fracture is a break or crack in a bone. Osteoporosis can "
            "increase fracture susceptibility, but this assistant should "
            "not be used to diagnose osteoporosis or determine treatment."
        )

    else:
        answer = (
            "Osteoporosis is a condition in which bones become less dense "
            "and more fragile, which can increase fracture risk. OsteoAI is "
            "designed as a research/prototype risk-assessment system and "
            "does not provide a medical diagnosis."
        )

    return {
        "message": answer,
        "data": {},
    }


def navigation_answer(message: str) -> dict[str, Any]:
    text = message.lower()

    if "dashboard" in text:
        path = "/dashboard"
        label = "Dashboard"

    elif "history" in text:
        path = "/history"
        label = "Assessment History"

    elif any(word in text for word in ("knowledge", "support", "help center")):
        path = "/knowledge"
        label = "Knowledge & Support"

    elif "assessment" in text:
        path = "/assessment"
        label = "Assessment"

    else:
        path = "/"
        label = "Home"

    return {
        "message": f"Opening {label}.",
        "data": {},
        "action": {
            "type": "navigate",
            "path": path,
        },
    }


def document_assistant_answer() -> dict[str, Any]:
    return {
        "message": (
            "The document assistant is planned as an Agent tool. The "
            "existing document-extraction endpoint already handles "
            "candidate extraction and review; the Agent will connect "
            "to that workflow after the core chat layer is stable."
        ),
        "data": {},
        "action": {
            "type": "planned_tool",
            "tool": "document_assistant",
        },
    }


def notification_answer() -> dict[str, Any]:
    return {
        "message": (
            "The notification tool will let the Agent create reminders "
            "after the user explicitly confirms the reminder details. "
            "That tool is not enabled in this foundation milestone yet."
        ),
        "data": {},
        "action": {
            "type": "planned_tool",
            "tool": "notification_manager",
        },
    }