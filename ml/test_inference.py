#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_inference.py
=======================================================================
OsteoAI - Single-Patient Inference Test (Step 10 of the testing guide)
=======================================================================

Loads the final frozen sklearn Pipeline and runs it on one sample
DataFrame, confirming the artifact works standalone before any FastAPI
or React wiring happens.

The category codes below (gender, race_ethnicity, alcohol_frequency,
etc.) are the RAW numeric codes as stored in the training CSV. They are
NOT hand-invented semantic mappings - train_osteoai_model.py's
OneHotEncoder was fit directly on these codes, so passing the same
codes here is the correct and only valid way to query the model. Every
value below was checked against the actual training data's set of
observed codes for that column.
"""

import joblib
import pandas as pd

MODEL_PATH = "models/osteoai_final_pipeline.pkl"
FEATURES_PATH = "models/osteoai_features.pkl"

model = joblib.load(MODEL_PATH)
features = joblib.load(FEATURES_PATH)

sample = {
    "age": 60,
    "gender": 1,
    "race_ethnicity": 1,
    "bmi": 25.0,
    "weight_kg": 65.0,
    "height_cm": 161.0,
    "waist_cm": 88.0,
    "hip_cm": 96.0,
    "other_bone_fracture_after_20": 0,
    "long_term_steroid_use": 0,
    "parent_osteoporosis_history": 0,
    "mother_hip_fracture": 0,
    "father_hip_fracture": 0,
    "smoked_100_cigarettes": 0,
    "alcohol_frequency": 1,
    "alcohol_drinks_per_day": 0,
    "vigorous_work_activity": 0,
    "moderate_work_activity": 1,
    "walk_or_bicycle": 1,
    "vigorous_recreation": 0,
    "moderate_recreation": 1,
    "sedentary_minutes": 360,
}

X = pd.DataFrame([sample], columns=features)

# A single-row DataFrame column whose only value is Python None is
# inferred by pandas as dtype=object holding None, not dtype=float64
# holding np.nan - which the pipeline's fitted imputers/encoder do not
# reliably recognize as "missing". Coerce explicitly so this stays a
# valid template for testing partial/missing-field payloads too. This
# mirrors clean_data() in train_osteoai_model.py.
X = X.apply(pd.to_numeric, errors="coerce")

prediction = int(model.predict(X)[0])
probability = float(model.predict_proba(X)[0][1])

print("Prediction:", prediction)
print("Probability:", probability)

assert prediction in (0, 1), f"Prediction must be 0 or 1, got {prediction}"
assert 0.0 <= probability <= 1.0, f"Probability must be in [0,1], got {probability}"
print("\n[PASS] prediction is 0/1 and probability is in [0,1] - artifact works standalone.")
print(
    "\nNOTE: model.predict() uses scikit-learn's default 0.5 cutoff, which is NOT the "
    "tuned decision threshold saved in models/osteoai_model_metadata.json. The FastAPI "
    "backend applies the saved threshold to predict_proba() itself (see services/predictor.py)."
)
