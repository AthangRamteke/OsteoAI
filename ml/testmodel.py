#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
testmodel.py
=======================================================================
OsteoAI - Manual Model Test / Inference Smoke Test
=======================================================================

Loads the final artifact produced by train_osteoai_model.py and runs one
example patient through it end-to-end, exactly the way the FastAPI backend
should: raw 22-feature dict -> pipeline.predict_proba() -> apply the saved
decision threshold from training metadata.

Use this to sanity-check that models/osteoai_final_pipeline.pkl loads
correctly and produces a sane probability before wiring it into the API.

This script is a sanity check, not a diagnostic tool - see the disclaimer
printed at the end.
"""

import json
from pathlib import Path

import joblib
import pandas as pd

# ============================================================
# LOAD MODEL ARTIFACTS
# ============================================================

MODEL_DIR = Path("models")
PIPELINE_PATH = MODEL_DIR / "osteoai_final_pipeline.pkl"
FEATURES_PATH = MODEL_DIR / "osteoai_features.pkl"
METADATA_PATH = MODEL_DIR / "osteoai_model_metadata.json"

print("=" * 60)
print("OSTEOAI - MANUAL MODEL TEST")
print("=" * 60)

for path, label in [
    (PIPELINE_PATH, "Final pipeline"),
    (FEATURES_PATH, "Feature list"),
    (METADATA_PATH, "Model metadata"),
]:
    if not path.exists():
        raise FileNotFoundError(
            f"{label} not found: {path}. Run train_osteoai_model.py first "
            f"to (re)generate the models/ directory."
        )

# Load the single end-to-end sklearn Pipeline (preprocessing + model).
pipeline = joblib.load(PIPELINE_PATH)

# Load the exact 22-feature contract, in order.
features = joblib.load(FEATURES_PATH)

# Load training metadata to get the model name and the tuned decision
# threshold - never hardcode these, always read them from the artifact
# that training produced.
with open(METADATA_PATH) as f:
    metadata = json.load(f)

selected_model = metadata["selected_model"]
threshold = metadata["selected_threshold"]

print(f"\nPipeline loaded successfully.")
print(f"Selected model      : {selected_model}")
print(f"Decision threshold  : {threshold:.2f}  (selected on validation data, see metadata)")

print(f"\nFeatures expected by the pipeline ({len(features)}):")
for i, feature in enumerate(features, start=1):
    print(f"  {i:>2}. {feature}")

# ============================================================
# TEST PATIENT DATA
# ============================================================
# Start every feature as None. The pipeline's own imputers (median for
# numeric features, most-frequent for categorical features - both fit
# during training) handle missing values exactly as they will at
# inference time from FastAPI, so partially-filled requests are safe.
# ============================================================

patient = {feature: None for feature in features}

# ------------------------------------------------------------
# ENTER PATIENT INFORMATION
# ------------------------------------------------------------
# Example values only.
#
# IMPORTANT: replace these with real values when testing specific cases.
# Keys MUST match the 22-feature contract above exactly - anything else
# is silently ignored by the DataFrame reindex below, and the pipeline
# will impute a missing key instead of using your intended value.
#
# Encoding reference (matches the raw training data, no relabeling):
#   gender: 1 = male, 2 = female
#   race_ethnicity: numeric code as stored in the source dataset
#   all other categorical fields below: 0 = no, 1 = yes
# ------------------------------------------------------------

patient.update({
    "age": 70,
    "gender": 2,
    "race_ethnicity": 3,
    "bmi": 21.5,
    "weight_kg": 55,
    "height_cm": 160,
    "waist_cm": 82,
    "hip_cm": 94,
    "other_bone_fracture_after_20": 1,
    "long_term_steroid_use": 0,
    "parent_osteoporosis_history": 0,
    "mother_hip_fracture": 0,
    "father_hip_fracture": 0,
    "smoked_100_cigarettes": 0,
    "alcohol_frequency": 1,
    "alcohol_drinks_per_day": 0,
    "vigorous_work_activity": 0,
    "moderate_work_activity": 0,
    "walk_or_bicycle": 1,
    "vigorous_recreation": 0,
    "moderate_recreation": 1,
    "sedentary_minutes": 300,
})

# ============================================================
# CONVERT TO DATAFRAME (exact feature order, as the pipeline expects)
# ============================================================

patient_df = pd.DataFrame([patient])[features]

# A single-row DataFrame column whose only value is Python None is
# inferred by pandas as dtype=object holding None, not dtype=float64
# holding np.nan - which the pipeline's fitted imputers/encoder do not
# reliably recognize as "missing" the same way. Coerce explicitly so a
# blanked-out field above is imputed correctly instead of silently
# mis-encoded. This mirrors clean_data() in train_osteoai_model.py.
patient_df = patient_df.apply(pd.to_numeric, errors="coerce")

# ============================================================
# MAKE PREDICTION
# ============================================================
# We deliberately do NOT call pipeline.predict() here - that would apply
# scikit-learn's default 0.5 cutoff, which is NOT the threshold this
# model was tuned for. Instead we read the raw probability and apply the
# saved threshold ourselves, exactly as the FastAPI backend must do.
# ============================================================

probability = float(pipeline.predict_proba(patient_df)[:, 1][0])
risk_flag = int(probability >= threshold)

# ============================================================
# DISPLAY RESULT
# ============================================================

print("\n" + "=" * 60)
print("PREDICTION RESULT")
print("=" * 60)

print(f"\nosteoporosis_probability: {probability * 100:.2f}%")
print(f"Decision threshold used : {threshold * 100:.2f}%")

if risk_flag == 1:
    print("\nMODEL RESULT: AT/ABOVE THRESHOLD - flagged as higher-risk by the model")
else:
    print("\nMODEL RESULT: BELOW THRESHOLD - flagged as lower-risk by the model")

print(
    "\nIMPORTANT:\n"
    "OsteoAI is a research / prototype risk-assessment model. This output is\n"
    "an estimated probability and a threshold-derived flag, NOT a medical\n"
    "diagnosis. The threshold above was selected using a documented\n"
    "statistical criterion (F2 score) on held-out validation data and has\n"
    "NOT been clinically validated."
)

print("\n" + "=" * 60)
