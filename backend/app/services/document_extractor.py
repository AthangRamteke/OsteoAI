"""
services/document_extractor.py
=======================================================================
Document extraction for the OsteoAI AI-Autofill prototype.

This module intentionally separates:
1) text extraction from a document, and
2) conservative field detection from that text.

It does NOT call the ML model and does NOT make a prediction.
Extracted values are candidates for user review only.
=======================================================================
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".jpg", ".jpeg", ".png"}
MAX_FILE_BYTES = 10 * 1024 * 1024


class DocumentExtractionError(ValueError):
    """Safe, user-facing extraction error."""


def _clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text(filename: str, content: bytes) -> tuple[str, str, list[str]]:
    """
    Return (text, extraction_method, warnings).
    """
    suffix = Path(filename).suffix.lower()
    warnings: list[str] = []

    if suffix not in ALLOWED_EXTENSIONS:
        raise DocumentExtractionError(
            "Unsupported document type. Use PDF, DOCX, JPG, JPEG, or PNG."
        )

    if len(content) > MAX_FILE_BYTES:
        raise DocumentExtractionError(
            "The document is too large. Please choose a file smaller than 10 MB."
        )

    if suffix == ".pdf":
        from io import BytesIO

        from pypdf import PdfReader

        try:
            reader = PdfReader(BytesIO(content))
        except Exception as exc:
            raise DocumentExtractionError(
                f"Unable to read the PDF: {exc}"
            ) from exc

        pages: list[str] = []
        for page in reader.pages[:25]:
            try:
                pages.append(page.extract_text() or "")
            except Exception:
                pages.append("")

        text = _clean_text("\n".join(pages))
        if not text:
            warnings.append(
                "No selectable text was found in the PDF. This may be a scanned document; "
                "image/OCR extraction for scanned PDFs is not enabled in this module yet."
            )
        return text, "pdf_text", warnings

    if suffix == ".docx":
        from io import BytesIO

        from docx import Document

        try:
            document = Document(BytesIO(content))
        except Exception as exc:
            raise DocumentExtractionError(
                f"Unable to read the DOCX file: {exc}"
            ) from exc

        parts: list[str] = []
        for paragraph in document.paragraphs:
            if paragraph.text.strip():
                parts.append(paragraph.text)

        for table in document.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells]
                if any(cells):
                    parts.append(" | ".join(cells))

        text = _clean_text("\n".join(parts))
        if not text:
            warnings.append("No readable text was found in the DOCX file.")
        return text, "docx_text", warnings

    # Image OCR.
    try:
        from io import BytesIO

        from PIL import Image
        import pytesseract

        image = Image.open(BytesIO(content))
        text = _clean_text(pytesseract.image_to_string(image))
        if not text:
            warnings.append("OCR completed, but no readable text was detected.")
        return text, "image_ocr", warnings
    except ImportError as exc:
        raise DocumentExtractionError(
            "Image OCR is not available because the OCR Python packages are not installed."
        ) from exc
    except Exception as exc:
        message = str(exc)
        if "tesseract" in message.lower():
            raise DocumentExtractionError(
                "Image OCR needs the Tesseract OCR engine installed and available on PATH."
            ) from exc
        raise DocumentExtractionError(
            f"Unable to process the image: {exc}"
        ) from exc


def _first_number(patterns: list[str], text: str) -> tuple[float | None, str | None]:
    flags = re.IGNORECASE | re.MULTILINE
    for pattern in patterns:
        match = re.search(pattern, text, flags)
        if match:
            try:
                return float(match.group(1)), match.group(0).strip()
            except (TypeError, ValueError):
                continue
    return None, None


def _binary_value(
    positive_patterns: list[str],
    negative_patterns: list[str],
    text: str,
) -> tuple[float | None, str | None]:
    flags = re.IGNORECASE | re.MULTILINE
    for pattern in positive_patterns:
        match = re.search(pattern, text, flags)
        if match:
            return 1.0, match.group(0).strip()
    for pattern in negative_patterns:
        match = re.search(pattern, text, flags)
        if match:
            return 0.0, match.group(0).strip()
    return None, None


def _make_field(
    *,
    key: str,
    section: str,
    label: str,
    value: Any,
    source_text: str | None,
    confidence: str,
    status: str,
) -> dict[str, Any]:
    return {
        "key": key,
        "section": section,
        "label": label,
        "value": value,
        "source_text": source_text,
        "confidence": confidence,
        "status": status,
    }


def extract_assessment_candidates(text: str) -> dict[str, Any]:
    """
    Conservative extraction into the shape used by the React assessment.

    Missing/ambiguous fields remain None and are marked review_required.
    """
    personal: dict[str, Any] = {}
    lifestyle: dict[str, Any] = {}
    medical: dict[str, Any] = {}
    fields: list[dict[str, Any]] = []
    raw_candidates: dict[str, Any] = {}

    # ---------- Personal ----------
    age, source = _first_number(
        [
            r"\bage\s*[:\-]?\s*(\d{1,3})\b",
            r"\b(\d{1,3})\s*(?:years?|yrs?)\s*old\b",
        ],
        text,
    )
    if age is not None and 18 <= age <= 120:
        personal["age"] = str(int(age))
        fields.append(_make_field(
            key="age", section="personal", label="Age",
            value=str(int(age)), source_text=source,
            confidence="high", status="found",
        ))

    gender = None
    gender_source = None
    for pattern, value in [
        (r"\bgender\s*[:\-]?\s*(female|woman)\b", "Female"),
        (r"\bsex\s*[:\-]?\s*(female|woman)\b", "Female"),
        (r"\bgender\s*[:\-]?\s*(male|man)\b", "Male"),
        (r"\bsex\s*[:\-]?\s*(male|man)\b", "Male"),
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender = value
            gender_source = match.group(0).strip()
            break
    if gender:
        personal["gender"] = gender
        fields.append(_make_field(
            key="gender", section="personal", label="Gender",
            value=gender, source_text=gender_source,
            confidence="high", status="found",
        ))

    race_patterns = [
        (r"\b(mexican american)\b", "1", "Mexican American"),
        (r"\b(other hispanic|hispanic|latino|latina)\b", "2", "Other Hispanic"),
        (r"\b(non[\-\s]?hispanic white|white)\b", "3", "White"),
        (r"\b(non[\-\s]?hispanic black|black)\b", "4", "Black"),
        (r"\b(non[\-\s]?hispanic asian|asian)\b", "6", "Asian"),
    ]
    for pattern, code, label in race_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            personal["raceEthnicity"] = code
            fields.append(_make_field(
                key="raceEthnicity", section="personal", label="Race / Ethnicity",
                value=label, source_text=match.group(0).strip(),
                confidence="medium", status="found_needs_review",
            ))
            break

    height, source = _first_number(
        [
            r"\bheight\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*cm\b",
            r"\bheight\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*m\b",
        ],
        text,
    )
    if height is not None:
        # Convert meters if the matched phrase contains "m" but not "cm".
        if source and re.search(r"\bm\b", source, re.IGNORECASE) and not re.search(
            r"\bcm\b", source, re.IGNORECASE
        ):
            height *= 100
        if 50 <= height <= 250:
            personal["height"] = str(round(height, 1)).rstrip("0").rstrip(".")
            fields.append(_make_field(
                key="height", section="personal", label="Height",
                value=personal["height"] + " cm", source_text=source,
                confidence="high", status="found",
            ))

    weight, source = _first_number(
        [
            r"\bweight\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*kg\b",
            r"\bweight\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)\b",
        ],
        text,
    )
    if weight is not None:
        if source and re.search(r"\b(?:lb|lbs|pounds?)\b", source, re.IGNORECASE):
            weight *= 0.45359237
        if 20 <= weight <= 300:
            personal["weight"] = str(round(weight, 1)).rstrip("0").rstrip(".")
            fields.append(_make_field(
                key="weight", section="personal", label="Weight",
                value=personal["weight"] + " kg", source_text=source,
                confidence="high", status="found",
            ))

    waist, source = _first_number(
        [r"\bwaist(?:\s+circumference)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*cm\b"],
        text,
    )
    if waist is not None and 40 <= waist <= 200:
        personal["waist"] = str(round(waist, 1)).rstrip("0").rstrip(".")
        fields.append(_make_field(
            key="waist", section="personal", label="Waist circumference",
            value=personal["waist"] + " cm", source_text=source,
            confidence="high", status="found",
        ))

    hip, source = _first_number(
        [r"\bhip(?:\s+circumference)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*cm\b"],
        text,
    )
    if hip is not None and 40 <= hip <= 200:
        personal["hip"] = str(round(hip, 1)).rstrip("0").rstrip(".")
        fields.append(_make_field(
            key="hip", section="personal", label="Hip circumference",
            value=personal["hip"] + " cm", source_text=source,
            confidence="high", status="found",
        ))

    bmi, source = _first_number(
        [r"\bBMI\s*[:\-]?\s*(\d+(?:\.\d+)?)\b"],
        text,
    )
    if bmi is not None and 5 <= bmi <= 80:
        raw_candidates["bmi"] = bmi
        fields.append(_make_field(
            key="bmi", section="personal", label="BMI",
            value=round(bmi, 1), source_text=source,
            confidence="medium", status="reference_only",
        ))

    # ---------- Lifestyle ----------
    smoked, source = _binary_value(
        [
            r"\b(?:smoking|smoking history|smoker|tobacco use)\s*[:\-]?\s*(?:yes|current|former|ever)\b",
            r"\b(?:smoked|smokes)\s*[:\-]?\s*(?:yes|true|current|former)\b",
        ],
        [
            r"\b(?:smoking|smoking history|smoker|tobacco use)\s*[:\-]?\s*(?:no|never|none)\b",
            r"\b(?:smoked|smokes)\s*[:\-]?\s*(?:no|false|never)\b",
        ],
        text,
    )
    if smoked is not None:
        lifestyle["smoked100Cigarettes"] = "1" if smoked == 1 else "0"
        fields.append(_make_field(
            key="smoked100Cigarettes", section="lifestyle", label="Smoking history",
            value="Yes" if smoked == 1 else "No", source_text=source,
            confidence="medium", status="found_needs_review",
        ))

    alcohol, source = _binary_value(
        [
            r"\b(?:alcohol use|alcohol history|drinks alcohol|alcohol)\s*[:\-]?\s*(?:yes|current|ever)\b",
        ],
        [
            r"\b(?:alcohol use|alcohol history|drinks alcohol|alcohol)\s*[:\-]?\s*(?:no|never|none)\b",
        ],
        text,
    )
    if alcohol is not None:
        lifestyle["alcoholEver"] = "1" if alcohol == 1 else "0"
        fields.append(_make_field(
            key="alcoholEver", section="lifestyle", label="Alcohol use history",
            value="Yes" if alcohol == 1 else "No", source_text=source,
            confidence="medium", status="found_needs_review",
        ))

    drinks, source = _first_number(
        [
            r"\b(?:alcohol drinks per day|drinks per day|drinks/day)\s*[:\-]?\s*(\d+(?:\.\d+)?)\b",
            r"\b(\d+(?:\.\d+)?)\s*(?:drinks?)\s*(?:per day|/day)\b",
        ],
        text,
    )
    if drinks is not None and 0 <= drinks <= 30:
        lifestyle["alcoholDrinksPerDay"] = str(round(drinks, 1)).rstrip("0").rstrip(".")
        fields.append(_make_field(
            key="alcoholDrinksPerDay", section="lifestyle", label="Average drinks per day",
            value=lifestyle["alcoholDrinksPerDay"], source_text=source,
            confidence="medium", status="found_needs_review",
        ))

    sedentary, source = _first_number(
        [
            r"\bsedentary(?: time| minutes?)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:minutes?|min)?\b",
            r"\b(\d+(?:\.\d+)?)\s*(?:minutes?|min)\s*(?:of\s*)?sedentary\b",
        ],
        text,
    )
    if sedentary is not None and 0 <= sedentary <= 1440:
        lifestyle["sedentaryMinutes"] = str(round(sedentary, 1)).rstrip("0").rstrip(".")
        fields.append(_make_field(
            key="sedentaryMinutes", section="lifestyle", label="Sedentary time",
            value=lifestyle["sedentaryMinutes"] + " min/day", source_text=source,
            confidence="medium", status="found_needs_review",
        ))

    # Frequency is intentionally not converted to a numeric model code here.
    frequency_patterns = [
        r"\balcohol frequency\s*[:\-]?\s*([^\n\r|]+)",
        r"\bdrinking frequency\s*[:\-]?\s*([^\n\r|]+)",
    ]
    for pattern in frequency_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1).strip(" .,:;")
            raw_candidates["alcoholFrequencyText"] = raw
            fields.append(_make_field(
                key="alcoholFrequency", section="lifestyle", label="Alcohol frequency",
                value=raw, source_text=match.group(0).strip(),
                confidence="low", status="manual_mapping_required",
            ))
            break

    activity_rules = [
        ("vigorousWorkActivity", "Vigorous work activity", [
            r"\bv(?:igorous)?\s*work activity\s*[:\-]?\s*(yes|no)\b",
            r"\bv(?:igorous)?\s*work\s*[:\-]?\s*(yes|no)\b",
        ]),
        ("moderateWorkActivity", "Moderate work activity", [
            r"\bmoderate\s*work activity\s*[:\-]?\s*(yes|no)\b",
            r"\bmoderate\s*work\s*[:\-]?\s*(yes|no)\b",
        ]),
        ("walkOrBicycle", "Walking / bicycling", [
            r"\b(?:walk|walking|bicycl(?:e|ing))\s*(?:or\s*bicycling)?\s*[:\-]?\s*(yes|no)\b",
        ]),
        ("vigorousRecreation", "Vigorous recreation", [
            r"\bv(?:igorous)?\s*recreation\s*[:\-]?\s*(yes|no)\b",
        ]),
        ("moderateRecreation", "Moderate recreation", [
            r"\bmoderate\s*recreation\s*[:\-]?\s*(yes|no)\b",
        ]),
    ]
    for key, label, patterns in activity_rules:
        value = None
        source = None
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = 1 if match.group(1).lower() == "yes" else 0
                source = match.group(0).strip()
                break
        if value is not None:
            lifestyle[key] = str(value)
            fields.append(_make_field(
                key=key, section="lifestyle", label=label,
                value="Yes" if value else "No", source_text=source,
                confidence="medium", status="found_needs_review",
            ))

    # ---------- Medical / family ----------
    medical_rules = [
        (
            "otherBoneFractureAfter20",
            "Other bone fracture history",
            [
                r"\bother bone fracture(?:s)?\s*(?:after age 20)?\s*[:\-]?\s*(yes|no)\b",
                r"\bfracture history\s*[:\-]?\s*(yes|no)\b",
            ],
        ),
        (
            "longTermSteroidUse",
            "Long-term steroid use",
            [
                r"\b(?:long[\-\s]?term\s*)?(?:corticosteroid|steroid)\s*(?:use|history)?\s*[:\-]?\s*(yes|no)\b",
            ],
        ),
        (
            "parentOsteoporosisHistory",
            "Parent osteoporosis history",
            [
                r"\bparent(?:s)?\s*(?:osteoporosis|osteoporosis history)\s*[:\-]?\s*(yes|no)\b",
                r"\bfamily history of osteoporosis\s*[:\-]?\s*(yes|no)\b",
            ],
        ),
        (
            "motherHipFracture",
            "Mother hip fracture history",
            [r"\bmother(?:'s)?\s*hip fracture\s*[:\-]?\s*(yes|no)\b"],
        ),
        (
            "fatherHipFracture",
            "Father hip fracture history",
            [r"\bfather(?:'s)?\s*hip fracture\s*[:\-]?\s*(yes|no)\b"],
        ),
    ]

    for key, label, patterns in medical_rules:
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = 1 if match.group(1).lower() == "yes" else 0
                medical[key] = str(value)
                fields.append(_make_field(
                    key=key, section="medical", label=label,
                    value="Yes" if value else "No",
                    source_text=match.group(0).strip(),
                    confidence="medium", status="found_needs_review",
                ))
                break

    assessment_data = {
        "personal": personal,
        "lifestyle": lifestyle,
        "medicalHistory": medical,
    }

    return {
        "assessment_data": assessment_data,
        "fields": fields,
        "raw_candidates": raw_candidates,
        "field_count_found": len(fields),
    }


def analyze_document(filename: str, content: bytes) -> dict[str, Any]:
    text, method, warnings = extract_text(filename, content)

    extracted = extract_assessment_candidates(text)

    return {
        "filename": filename,
        "extraction_method": method,
        "warnings": warnings,
        "text_preview": text[:3000],
        "text_length": len(text),
        **extracted,
        "review_required": True,
        "model_called": False,
        "disclaimer": (
            "Extracted values are candidates for user review only. "
            "No prediction is performed during document extraction."
        ),
    }
