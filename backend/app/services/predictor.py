"""
services/predictor.py
=======================================================================
Loads the frozen OsteoAI ML artifact ONCE at import time and exposes a
single predict_patient() function used by the /api/predict route.

This is the ONLY place in the backend that touches the model files -
routers/predict.py just calls into this module. Keeping preprocessing
and the model together (a single sklearn Pipeline) means this file does
not need to know anything about imputation, encoding, or scaling.
=======================================================================
"""

import json
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

# ---------------------------------------------------------------------
# Artifact locations (relative to the backend/ working directory)
# ---------------------------------------------------------------------
MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"
PIPELINE_PATH = MODEL_DIR / "osteoai_final_pipeline.pkl"
FEATURES_PATH = MODEL_DIR / "osteoai_features.pkl"
METADATA_PATH = MODEL_DIR / "osteoai_model_metadata.json"

for path, label in [
    (PIPELINE_PATH, "Final pipeline"),
    (FEATURES_PATH, "Feature list"),
    (METADATA_PATH, "Model metadata"),
]:
    if not path.exists():
        raise FileNotFoundError(
            f"{label} not found at {path}. Copy the artifacts produced by "
            f"train_osteoai_model.py into backend/models/ before starting the API."
        )

# Loaded once at process startup - reused for every request.
_pipeline = joblib.load(PIPELINE_PATH)
_feature_names: list = joblib.load(FEATURES_PATH)
with open(METADATA_PATH) as _f:
    _metadata: dict = json.load(_f)

MODEL_VERSION: str = _metadata["model_version"]
DECISION_THRESHOLD: float = _metadata["selected_threshold"]
FEATURE_NAMES: list = _feature_names


def _risk_level(probability: float) -> str:
    """
    Application-layer display bucket for the raw probability.

    NOTE: these cut points (0.15 / 0.40) are an arbitrary UI convenience
    chosen independently of the model's tuned decision threshold
    (DECISION_THRESHOLD, used for `prediction`). They carry no clinical
    meaning and must never be presented as a validated risk scale.
    """
    if probability < 0.15:
        return "Low"
    if probability < 0.40:
        return "Moderate"
    return "High"


def predict_patient(payload: dict) -> dict:
    """
    Run one patient's raw feature dict through the frozen pipeline.

    Parameters
    ----------
    payload : dict
        Must contain (a subset of) the keys in FEATURE_NAMES. Missing
        keys/values are left as None and handled by the pipeline's own
        trained imputers, exactly as during training.

    Returns
    -------
    dict with prediction, osteoporosis_probability, risk_level,
    model_version, threshold_used.
    """
    # Build the input row in the EXACT trained feature order. Any field
    # not present in payload becomes None (imputed internally).
    row = {name: payload.get(name, None) for name in FEATURE_NAMES}
    X = pd.DataFrame([row], columns=FEATURE_NAMES)

    # IMPORTANT: for a single-row DataFrame, a column whose only value is
    # Python None is inferred by pandas as dtype=object holding literal
    # None - NOT dtype=float64 holding np.nan. The fitted pipeline's
    # imputers/encoder were fit on float64 NaN (produced by
    # pd.to_numeric(errors="coerce") during training - see
    # train_osteoai_model.py clean_data()). Left uncoerced, an
    # object/None column is silently treated by OneHotEncoder as an
    # "unknown category" (encoded as all-zeros) instead of being
    # properly imputed, which corrupts the prediction for any request
    # that omits a field. Coercing here makes inference-time
    # preprocessing byte-for-byte consistent with training-time
    # preprocessing, exactly as required.
    X = X.apply(pd.to_numeric, errors="coerce")

    probability = float(_pipeline.predict_proba(X)[:, 1][0])
    # We do NOT use pipeline.predict() (sklearn's default 0.5 cutoff).
    # `prediction` reflects the threshold tuned during training.
    prediction = int(probability >= DECISION_THRESHOLD)

    return {
        "prediction": prediction,
        "osteoporosis_probability": probability,
        "risk_level": _risk_level(probability),
        "model_version": MODEL_VERSION,
        "threshold_used": DECISION_THRESHOLD,
    }
