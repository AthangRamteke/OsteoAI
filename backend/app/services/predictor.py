"""
services/predictor.py

Loads the frozen OsteoAI ML artifact once at import time and exposes
predict_patient() for the prediction API.

The ML prediction logic remains unchanged. SHAP is added only as an
explanation layer for the same frozen model.
"""

import json
from pathlib import Path

import joblib
import pandas as pd

from app.services.shap_explainer import explain_patient


# ---------------------------------------------------------------------
# Artifact locations
# ---------------------------------------------------------------------

MODEL_DIR = (
    Path(__file__).resolve().parent.parent.parent / "models"
)

PIPELINE_PATH = MODEL_DIR / "osteoai_final_pipeline.pkl"
FEATURES_PATH = MODEL_DIR / "osteoai_features.pkl"
METADATA_PATH = MODEL_DIR / "osteoai_model_metadata.json"


# ---------------------------------------------------------------------
# Verify required artifacts
# ---------------------------------------------------------------------

for path, label in [
    (PIPELINE_PATH, "Final pipeline"),
    (FEATURES_PATH, "Feature list"),
    (METADATA_PATH, "Model metadata"),
]:
    if not path.exists():
        raise FileNotFoundError(
            f"{label} not found at {path}. "
            f"Copy the model artifacts into backend/models/."
        )


# ---------------------------------------------------------------------
# Load frozen artifacts once
# ---------------------------------------------------------------------

_pipeline = joblib.load(PIPELINE_PATH)

_feature_names: list = joblib.load(FEATURES_PATH)

with open(METADATA_PATH, "r", encoding="utf-8") as file:
    _metadata: dict = json.load(file)


MODEL_VERSION: str = _metadata["model_version"]

DECISION_THRESHOLD: float = _metadata[
    "selected_threshold"
]

FEATURE_NAMES: list = _feature_names


# ---------------------------------------------------------------------
# Risk level
# ---------------------------------------------------------------------

def _risk_level(probability: float) -> str:
    """
    UI display bucket only.
    These values have no clinical meaning.
    """

    if probability < 0.15:
        return "Low"

    if probability < 0.40:
        return "Moderate"

    return "High"


# ---------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------

def predict_patient(payload: dict) -> dict:
    """
    Run one patient's raw feature dictionary through the frozen
    pipeline and return prediction + SHAP explanation.
    """

    # -------------------------------------------------------------
    # Build input in EXACT trained feature order
    # -------------------------------------------------------------

    row = {
        name: payload.get(name, None)
        for name in FEATURE_NAMES
    }

    X = pd.DataFrame(
        [row],
        columns=FEATURE_NAMES,
    )

    # Match training-time numeric coercion.
    X = X.apply(
        pd.to_numeric,
        errors="coerce",
    )

    # -------------------------------------------------------------
    # Real ML prediction
    # -------------------------------------------------------------

    probability = float(
        _pipeline.predict_proba(X)[:, 1][0]
    )

    # Use tuned 0.09 threshold from model metadata.
    prediction = int(
        probability >= DECISION_THRESHOLD
    )

    # -------------------------------------------------------------
    # SHAP explanation for this same patient
    # -------------------------------------------------------------

    shap_explanations = explain_patient(
        payload
    )

    # -------------------------------------------------------------
    # API response
    # -------------------------------------------------------------

    return {
        "prediction": prediction,
        "osteoporosis_probability": probability,
        "risk_level": _risk_level(probability),
        "model_version": MODEL_VERSION,
        "threshold_used": DECISION_THRESHOLD,
        "shap_explanations": shap_explanations,
        "disclaimer": _metadata.get(
            "disclaimer",
            (
                "This is a research/prototype "
                "risk-assessment output, not a medical "
                "diagnosis, and has not been clinically "
                "validated."
            ),
        ),
    }