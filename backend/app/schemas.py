"""
schemas.py
=======================================================================
Pydantic request/response models for the OsteoAI /api/predict endpoint.

The 22 fields in PatientFeatures are the EXACT model feature contract
produced by train_osteoai_model.py (models/osteoai_features.pkl). Do not
add, remove, rename, or reorder fields here without retraining the model
and regenerating that file - FastAPI will build the model input
DataFrame using this exact field set.

Field values are the RAW numeric codes the model was trained on (see
models/osteoai_model_metadata.json -> preprocessing_summary). The
frontend is responsible for mapping its own form values to these codes
- this backend does not invent or guess any semantic encoding.
=======================================================================
"""

from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class PatientFeatures(BaseModel):
    """
    Exact 22-feature request body for a single osteoporosis risk
    prediction. Every field is a raw numeric value as stored in the
    training dataset (no relabeling). Fields are optional at the
    schema level (a missing value is imputed by the model pipeline's
    own trained imputer, exactly as during training) - but wrong TYPES
    (e.g. a string where a number is expected) are rejected by pydantic.
    """

    model_config = ConfigDict(extra="forbid")

    age: Optional[float] = Field(None, description="Age in years")
    gender: Optional[float] = Field(None, description="Raw coded value from training data (e.g. 1/2)")
    race_ethnicity: Optional[float] = Field(None, description="Raw coded value from training data")
    bmi: Optional[float] = Field(None, description="Body mass index (kg/m^2)")
    weight_kg: Optional[float] = Field(None, description="Weight in kilograms")
    height_cm: Optional[float] = Field(None, description="Height in centimeters")
    waist_cm: Optional[float] = Field(None, description="Waist circumference in centimeters")
    hip_cm: Optional[float] = Field(None, description="Hip circumference in centimeters")
    other_bone_fracture_after_20: Optional[float] = Field(None, description="0 = no, 1 = yes")
    long_term_steroid_use: Optional[float] = Field(None, description="0 = no, 1 = yes")
    parent_osteoporosis_history: Optional[float] = Field(None, description="0 = no, 1 = yes")
    mother_hip_fracture: Optional[float] = Field(None, description="0 = no, 1 = yes")
    father_hip_fracture: Optional[float] = Field(None, description="0 = no, 1 = yes")
    smoked_100_cigarettes: Optional[float] = Field(None, description="0 = no, 1 = yes")
    alcohol_frequency: Optional[float] = Field(None, description="Raw coded value from training data")
    alcohol_drinks_per_day: Optional[float] = Field(None, description="Average drinks per day")
    vigorous_work_activity: Optional[float] = Field(None, description="0 = no, 1 = yes")
    moderate_work_activity: Optional[float] = Field(None, description="0 = no, 1 = yes")
    walk_or_bicycle: Optional[float] = Field(None, description="0 = no, 1 = yes")
    vigorous_recreation: Optional[float] = Field(None, description="0 = no, 1 = yes")
    moderate_recreation: Optional[float] = Field(None, description="0 = no, 1 = yes")
    sedentary_minutes: Optional[float] = Field(None, description="Sedentary minutes per day")


class PredictionResponse(BaseModel):
    """
    Structured response for POST /api/predict.

    IMPORTANT: `risk_level` is an APPLICATION-LAYER interpretation of the
    probability for display purposes only. It is not a clinically
    validated threshold and must not be presented as a diagnosis.
    """

    prediction: int = Field(..., description="0 = No Osteoporosis, 1 = Osteoporosis, using the model's tuned decision threshold")
    osteoporosis_probability: float = Field(..., description="Model's raw predicted probability for the positive class (osteoporosis), in [0, 1]")
    risk_level: str = Field(..., description="Application-layer interpretation of the probability (Low/Moderate/High). NOT a clinical threshold.")
    model_version: str = Field(..., description="Frozen model version tag from osteoai_model_metadata.json")
    threshold_used: float = Field(..., description="The decision threshold applied to compute `prediction`, tuned on validation data during training")
    disclaimer: str = Field(
        default=(
            "This is a research/prototype risk-assessment output, not a medical diagnosis, "
            "and has not been clinically validated."
        ),
        description="Fixed scope disclaimer returned with every prediction.",
    )
