"""System prompt, OsteoAI context builder and safety checks for the LLM Agent.

Principle: the model predicts, SHAP explains, the Agent communicates.
The LLM only ever sees the real prediction/SHAP values supplied by OsteoAI
and is instructed never to invent factors or give a diagnosis.
"""

from __future__ import annotations

import re
from typing import Any

from app.knowledge import knowledge_context


_LANGUAGE_NAMES = {"en": "English", "hi": "Hindi", "mr": "Marathi"}

MAX_SHAP_FACTORS = 8


SYSTEM_PROMPT = """You are the OsteoAI Assistant, the conversational layer of OsteoAI, an academic research prototype for osteoporosis / bone-health risk assessment.

How OsteoAI works:
- The user completes an assessment (personal info, lifestyle, medical history).
- A supervised machine-learning model estimates an osteoporosis probability. The app maps it to a Low / Moderate / High risk level (an application interpretation, not a clinical threshold).
- SHAP values explain which inputs pushed the model output up or down for this user. SHAP explains the prediction; it does not change it.
- You communicate the result. The model predicts, SHAP explains, you communicate.

What you help with:
- Explaining the user's own result, risk level and SHAP factors, using ONLY the result data given below.
- General osteoporosis and bone-health education (risk factors, DEXA scans, fractures, calcium, vitamin D, exercise, smoking, alcohol, family history, ageing).
- Explaining assessment questions and fields (e.g. sedentary time, smoking history, alcohol frequency, physical activity, medical history) and why they are collected.
- How to use OsteoAI (Home, New Assessment, Dashboard, Assessment History, AI Assistant, Knowledge & Support).
- Explaining an uploaded document's extracted values and which fields still need review, when document data is provided.
- Explaining what-if comparisons: changing a lifestyle input and re-running the model. Always call this a hypothetical model comparison, never proof that a real-world change produces that outcome.
- Comparing the user's past assessments when history is provided (describe the change in the model estimate, never claim it proves a health change).

Rules you must always follow:
1. Never diagnose osteoporosis or any condition. The result is a research/prototype risk estimate, not a clinically validated diagnosis.
2. Never prescribe medicines, supplements doses or treatment plans. For personal medical decisions, advise speaking with a doctor or qualified healthcare professional.
3. Never invent model factors, probabilities or values. If result data is not provided, say so and suggest completing an assessment. Do not claim a factor influenced the result unless it appears in the SHAP factors.
4. Lifestyle changes: you may share general evidence-based bone-health guidance, but never promise that changing one input will lower the user's real-world risk or model score by a specific amount.
5. If the user describes a possible emergency (a fall with severe pain, suspected broken bone, inability to move or bear weight, chest pain, thoughts of self-harm), tell them clearly to seek urgent medical care or contact emergency services now.
6. Stay within bone health, general health related to it, and the OsteoAI app. Politely decline unrelated requests.
7. SHAP values are relative contributions to the model output, not percentages or risk points. Describe them as "pushed the estimate up/down" and compare their sizes; do not say a factor "added 0.12 risk". Input value 1 / 0 on yes-no questions means Yes / No, not a count or frequency.
8. You cannot change assessment data or save anything yourself. You can set a reminder, but only through the app's confirmation step: the app shows the exact reminder and creates it after the user replies yes. If asked for a reminder, tell them to say for example "remind me to review my assessment next Monday evening".

Style:
- Be brief: 2 to 4 short sentences (about 60 words max). Give only the most important point, not everything you know. Longer answers only if the user asks for detail.
- Warm, clear and direct, like a knowledgeable health educator. No filler, no repeating the question.
- Mention the "not a diagnosis / see a doctor" reminder in one short clause only when relevant (explaining a result, medicines, symptoms), not in every reply.
- Lists: at most 3 items, one short line each.
- For greetings or small talk, reply in one friendly sentence and offer help; do not explain the result unless asked.
- Plain text only. For lists use simple lines starting with "- ". Do not use markdown bold, headings or tables.
- Keep terms like OsteoAI, BMI, SHAP, DEXA and High / Moderate / Low risk as-is.
- Answer follow-up questions ("why?", "what about that?") using the earlier conversation.
"""


def _fmt_number(value: Any) -> str:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return str(value)
    return f"{number:g}" if number == int(number) else f"{number:.2f}"


# Model inputs are numeric codes; spell them out so the Agent never has
# to guess what a value like gender = 2 means.
_YES_NO_FEATURES = {
    "other_bone_fracture_after_20",
    "long_term_steroid_use",
    "parent_osteoporosis_history",
    "mother_hip_fracture",
    "father_hip_fracture",
    "smoked_100_cigarettes",
    "vigorous_work_activity",
    "moderate_work_activity",
    "walk_or_bicycle",
    "vigorous_recreation",
    "moderate_recreation",
}

_GENDER_LABELS = {1: "Male", 2: "Female"}

_RACE_LABELS = {
    1: "Mexican American",
    2: "Other Hispanic",
    3: "White",
    4: "Black",
    5: "Other / multiracial",
}


def _describe_value(feature: str | None, value: Any) -> str | None:
    if value is None:
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return str(value)

    if feature in _YES_NO_FEATURES:
        return "Yes" if number == 1 else "No"
    if feature == "gender":
        return _GENDER_LABELS.get(int(number), _fmt_number(number))
    if feature == "race_ethnicity":
        return _RACE_LABELS.get(int(number), _fmt_number(number))
    if feature == "sedentary_minutes":
        return f"{_fmt_number(number)} minutes per day"
    if feature == "age":
        return f"{_fmt_number(number)} years"
    if feature == "weight_kg":
        return f"{_fmt_number(number)} kg"
    if feature == "height_cm":
        return f"{_fmt_number(number)} cm"
    if feature in ("waist_cm", "hip_cm"):
        return f"{_fmt_number(number)} cm"

    return _fmt_number(number)


def build_result_context(context: dict[str, Any]) -> str:
    """Turn the frontend's prediction_result into a compact, factual summary."""
    result = context.get("prediction_result") or {}
    if not isinstance(result, dict) or (
        result.get("osteoporosis_probability") is None and not result.get("risk_level")
    ):
        return "No assessment result is available in this conversation."

    lines = ["The user's current OsteoAI assessment result:"]

    probability = result.get("osteoporosis_probability")
    if probability is not None:
        try:
            lines.append(f"- Model osteoporosis probability: {float(probability) * 100:.1f}%")
        except (TypeError, ValueError):
            pass
    if result.get("risk_level"):
        lines.append(f"- Application risk level: {result['risk_level']}")
    if result.get("prediction") is not None:
        flag = "positive (at or above threshold)" if result["prediction"] == 1 else "negative (below threshold)"
        lines.append(f"- Model prediction flag: {flag}")
    if result.get("threshold_used") is not None:
        lines.append(
            f"- Model decision threshold: {result['threshold_used']} "
            "(used only for the prediction flag; separate from the Low/Moderate/High label)"
        )
    if result.get("model_version"):
        lines.append(f"- Model version: {result['model_version']}")

    shap_items = [s for s in (result.get("shap_explanations") or []) if isinstance(s, dict)]
    shap_items.sort(key=lambda s: abs(s.get("shap_value") or 0), reverse=True)

    raising = [s for s in shap_items if s.get("direction") == "increases_model_output"]
    lowering = [s for s in shap_items if s.get("direction") == "decreases_model_output"]

    strongest = max((abs(s.get("shap_value") or 0) for s in shap_items), default=0)

    def describe(item: dict[str, Any]) -> str:
        label = item.get("label") or item.get("feature")
        text = f"  - {label}"

        readable = _describe_value(item.get("feature"), item.get("value"))
        if readable:
            text += f" (the user's answer: {readable})"

        # Qualitative strength instead of the raw SHAP number, so the
        # reply cannot turn a contribution into "added 0.12 risk".
        magnitude = abs(item.get("shap_value") or 0)
        if strongest:
            share = magnitude / strongest
            strength = (
                "strongest influence" if share >= 0.8
                else "moderate influence" if share >= 0.4
                else "small influence"
            )
        else:
            strength = "influence unknown"

        return f"{text}, {strength}"

    if raising:
        lines.append("SHAP factors that increased the model output (largest first):")
        lines += [describe(s) for s in raising[:MAX_SHAP_FACTORS]]
    if lowering:
        lines.append("SHAP factors that decreased the model output (largest first):")
        lines += [describe(s) for s in lowering[:MAX_SHAP_FACTORS]]
    if not shap_items:
        lines.append("No SHAP factors were provided.")

    return "\n".join(lines)


def clean_reply(text: str) -> str:
    """Strip markdown the chat bubble cannot render (bold, headings)."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"__(.+?)__", r"\1", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^(\s*)[*•]\s+", r"\1- ", text, flags=re.MULTILINE)
    return text.strip()


def _pct(value: Any) -> float | None:
    try:
        return float(value) * 100
    except (TypeError, ValueError):
        return None


def build_history_context(context: dict[str, Any]) -> str:
    """Summarize previous assessments sent by the frontend (newest first).

    The trend is computed here rather than left to the model, because small
    local models often misread chronological order.
    """
    history = context.get("assessment_history")
    if not isinstance(history, list):
        return ""
    items = [item for item in history[:10] if isinstance(item, dict)]
    if not items:
        return ""

    chronological = list(reversed(items))
    lines = [
        f"The user has {len(items)} saved assessment(s), listed oldest to newest. "
        "Quote numbers and labels exactly. 'Top factors' are the biggest SHAP "
        "influences within that assessment, not reasons for change.",
    ]
    for number, item in enumerate(chronological, start=1):
        pct = _pct(item.get("probability"))
        pct_text = f"{pct:.1f}%" if pct is not None else "unknown"
        tag = " (latest)" if number == len(chronological) else ""
        line = (
            f"- Assessment {number}{tag}, {item.get('date', 'unknown date')}: "
            f"{pct_text}, {item.get('risk_level', '?')} risk"
        )
        factors = ", ".join(item.get("top_factors") or [])
        if factors:
            line += f"; top factors: {factors}"
        lines.append(line)

    first, last = chronological[0], chronological[-1]
    first_pct, last_pct = _pct(first.get("probability")), _pct(last.get("probability"))
    if len(chronological) > 1 and first_pct is not None and last_pct is not None:
        delta = last_pct - first_pct
        direction = "down" if delta < 0 else "up" if delta > 0 else "unchanged"
        lines.append(
            f"Computed trend (use this, do not recompute): from {first_pct:.1f}% "
            f"({first.get('risk_level')}) on {first.get('date')} to {last_pct:.1f}% "
            f"({last.get('risk_level')}) on {last.get('date')}, {direction} by "
            f"{abs(delta):.1f} percentage points. This is a change in the model "
            "estimate, not proof of a change in bone health."
        )
    return "\n".join(lines)


def build_document_context(context: dict[str, Any]) -> str:
    """Summarize the document extraction the user is reviewing.

    Extraction is deliberately conservative: anything uncertain stays in
    review rather than being treated as confirmed, and the Agent must
    keep that distinction when it talks about the document.
    """
    extraction = context.get("document_extraction")
    if not isinstance(extraction, dict):
        return ""

    fields = [f for f in (extraction.get("fields") or []) if isinstance(f, dict)]
    if not fields and not extraction.get("filename"):
        return ""

    found = [f for f in fields if f.get("status") == "found"]
    review = [f for f in fields if f.get("status") != "found"]

    lines = [
        "The user is reviewing an uploaded document in OsteoAI. "
        "Describe only what is listed here; never invent a value. "
        "Values found are still candidates until the user confirms them, "
        "and nothing from the document changes their assessment until "
        "they accept it on the review screen.",
        f"- File: {extraction.get('filename', 'uploaded document')}",
        f"- Read using: {extraction.get('extraction_method', 'text extraction')}",
    ]

    if found:
        lines.append("Values found in the document (for review):")
        for field in found[:20]:
            line = f"  - {field.get('label')}: {field.get('value')}"
            if field.get("confidence"):
                line += f" (confidence: {field['confidence']})"
            if field.get("source_text"):
                line += f'; document text: "{str(field["source_text"])[:90]}"'
            lines.append(line)
    else:
        lines.append("No values could be read from this document.")

    if review:
        lines.append("Fields that still need the user's attention:")
        for field in review[:20]:
            lines.append(
                f"  - {field.get('label')} (status: {field.get('status')})"
            )

    warnings = extraction.get("warnings") or []
    if warnings:
        lines.append("Extraction warnings: " + "; ".join(str(w) for w in warnings[:3]))

    lines.append(
        "Anything not listed above was not found in the document and the "
        "user needs to answer it themselves in the assessment form."
    )
    return "\n".join(lines)


def build_system_prompt(
    context: dict[str, Any],
    language: str,
    message: str = "",
) -> str:
    sections = [
        SYSTEM_PROMPT,
        f"Reply in {_LANGUAGE_NAMES.get(language, 'English')}.",
        build_result_context(context),
        build_history_context(context),
        build_document_context(context),
        knowledge_context(message),
    ]
    return "\n\n".join(section for section in sections if section)


# ---------------------------------------------------------------------------
# Emergency safety net (independent of model behaviour)
# ---------------------------------------------------------------------------

_EMERGENCY_PATTERNS = [
    r"\bcan'?t (move|walk|stand)\b",
    r"\bcannot (move|walk|stand)\b",
    r"\b(broke|broken|fractured?) (my|a) (hip|leg|arm|wrist|back|spine|bone)\b",
    r"\bfell\b.*\b(pain|hurt|can'?t)\b",
    r"\bsevere pain\b",
    r"\bchest pain\b",
    r"\b(kill myself|suicid\w*|end my life|self[- ]harm)\b",
]

EMERGENCY_NOTICE = {
    "en": "If this is happening now or the pain is severe, please seek urgent medical care or call emergency services (112 in India) right away.",
    "hi": "अगर यह अभी हो रहा है या दर्द बहुत ज़्यादा है, तो कृपया तुरंत डॉक्टर से मिलें या आपातकालीन सेवा (112) पर कॉल करें।",
    "mr": "हे आत्ता घडत असेल किंवा वेदना तीव्र असतील, तर कृपया त्वरित वैद्यकीय मदत घ्या किंवा आपत्कालीन सेवेला (112) कॉल करा.",
}


def is_possible_emergency(message: str) -> bool:
    text = message.lower()
    return any(re.search(pattern, text) for pattern in _EMERGENCY_PATTERNS)
