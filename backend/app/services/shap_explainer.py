"""
SHAP explainability service for the frozen OsteoAI model.

This module explains individual predictions produced by the existing
osteoai-v1 pipeline. It does NOT retrain or modify the model.
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap


# ---------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------

SERVICES_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SERVICES_DIR.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

MODEL_DIR = BACKEND_DIR / "models"

PIPELINE_PATH = MODEL_DIR / "osteoai_final_pipeline.pkl"
FEATURES_PATH = MODEL_DIR / "osteoai_features.pkl"
TEST_DATA_PATH = PROJECT_ROOT / "ml" / "models" / "test_predictions.csv"


# ---------------------------------------------------------------------
# User-friendly feature names
# ---------------------------------------------------------------------

DISPLAY_NAMES = {
    "age": "Age",
    "gender": "Gender",
    "race_ethnicity": "Race / Ethnicity",
    "bmi": "BMI",
    "weight_kg": "Weight",
    "height_cm": "Height",
    "waist_cm": "Waist circumference",
    "hip_cm": "Hip circumference",
    "other_bone_fracture_after_20": "Other bone fracture after age 20",
    "long_term_steroid_use": "Long-term steroid use",
    "parent_osteoporosis_history": "Parent osteoporosis history",
    "mother_hip_fracture": "Mother's hip fracture",
    "father_hip_fracture": "Father's hip fracture",
    "smoked_100_cigarettes": "Smoking history",
    "alcohol_frequency": "Alcohol history",
    "alcohol_drinks_per_day": "Alcohol consumption frequency",
    "vigorous_work_activity": "Vigorous work activity",
    "moderate_work_activity": "Moderate work activity",
    "walk_or_bicycle": "Walking / bicycling",
    "vigorous_recreation": "Vigorous recreation",
    "moderate_recreation": "Moderate recreation",
    "sedentary_minutes": "Sedentary time",
}


# ---------------------------------------------------------------------
# Load frozen artifacts
# ---------------------------------------------------------------------

_pipeline = joblib.load(PIPELINE_PATH)
_feature_names = joblib.load(FEATURES_PATH)

_preprocessor = _pipeline.named_steps["preprocessor"]
_model = _pipeline.named_steps["model"]


# ---------------------------------------------------------------------
# Build a deterministic SHAP background dataset.
#
# We use the already-versioned test_predictions.csv only as a
# background reference for explaining the frozen model. This does not
# retrain the model or alter its predictions.
# ---------------------------------------------------------------------

_test_df = pd.read_csv(TEST_DATA_PATH)

_background_raw = _test_df[
    _feature_names
].copy()

_background_raw = _background_raw.apply(
    pd.to_numeric,
    errors="coerce",
)

_background_transformed = _preprocessor.transform(
    _background_raw
)

# Keep background small enough for fast API startup.
_BACKGROUND_SIZE = min(100, _background_transformed.shape[0])

_background_transformed = _background_transformed[
    :_BACKGROUND_SIZE
]


# ---------------------------------------------------------------------
# SHAP explainer
# ---------------------------------------------------------------------

_explainer = shap.LinearExplainer(
    _model,
    _background_transformed,
)


# ---------------------------------------------------------------------
# Transformed feature → original feature mapping
# ---------------------------------------------------------------------

_transformed_names = list(
    _preprocessor.get_feature_names_out()
)

_transformed_names = [
    name.split("__", 1)[1]
    if "__" in name
    else name
    for name in _transformed_names
]


def _original_feature_name(transformed_name: str) -> str:
    """
    Map an encoded/scaled feature back to its original 22-feature name.
    """

    # Exact numeric feature name.
    if transformed_name in _feature_names:
        return transformed_name

    # One-hot categorical feature such as:
    # gender_2.0
    # race_ethnicity_3.0
    for feature in _feature_names:
        if transformed_name.startswith(f"{feature}_"):
            return feature

    # Defensive fallback.
    return transformed_name


_TRANSFORMED_TO_ORIGINAL = {
    index: _original_feature_name(name)
    for index, name in enumerate(_transformed_names)
}


# ---------------------------------------------------------------------
# Public explanation function
# ---------------------------------------------------------------------

def explain_patient(payload: dict, top_n: int = 6) -> list:
    """
    Generate SHAP explanations for one patient input.

    Returns top contributing original features, aggregated across
    one-hot encoded dimensions when necessary.
    """

    row = {
        name: payload.get(name, None)
        for name in _feature_names
    }

    X = pd.DataFrame(
        [row],
        columns=_feature_names,
    )

    X = X.apply(
        pd.to_numeric,
        errors="coerce",
    )

    X_transformed = _preprocessor.transform(X)

    shap_values = _explainer.shap_values(
        X_transformed
    )

    shap_values = np.asarray(shap_values)

    # Binary-class compatibility.
    if shap_values.ndim == 3:
        shap_values = shap_values[:, :, -1]

    if isinstance(shap_values, list):
        shap_values = np.asarray(
            shap_values[1]
        )

    values = shap_values[0]

    # Aggregate one-hot encoded contributions back to
    # the original 22 model features.
    grouped = {}

    for index, shap_value in enumerate(values):
        original_name = _TRANSFORMED_TO_ORIGINAL[index]

        grouped.setdefault(
            original_name,
            0.0,
        )

        grouped[original_name] += float(
            shap_value
        )

    ranked = sorted(
        grouped.items(),
        key=lambda item: abs(item[1]),
        reverse=True,
    )

    explanations = []

    for feature_name, shap_value in ranked[:top_n]:
        raw_value = payload.get(
            feature_name,
            None,
        )

        explanations.append(
            {
                "feature": feature_name,
                "label": DISPLAY_NAMES.get(
                    feature_name,
                    feature_name,
                ),
                "value": raw_value,
                "shap_value": round(
                    shap_value,
                    6,
                ),
                "direction": (
                    "increases_model_output"
                    if shap_value > 0
                    else "decreases_model_output"
                    if shap_value < 0
                    else "neutral"
                ),
            }
        )

    return explanations