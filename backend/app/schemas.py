"""
schemas.py
=======================================================================
Pydantic request/response models for the OsteoAI /api/predict endpoint.
=======================================================================
"""

from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class PatientFeatures(BaseModel):
    """
    Exact 22-feature request body for a single osteoporosis risk
    prediction.
    """

    model_config = ConfigDict(extra="forbid")

    age: Optional[float] = Field(
        None,
        description="Age in years",
    )

    gender: Optional[float] = Field(
        None,
        description="Raw coded value from training data (e.g. 1/2)",
    )

    race_ethnicity: Optional[float] = Field(
        None,
        description="Raw coded value from training data",
    )

    bmi: Optional[float] = Field(
        None,
        description="Body mass index (kg/m^2)",
    )

    weight_kg: Optional[float] = Field(
        None,
        description="Weight in kilograms",
    )

    height_cm: Optional[float] = Field(
        None,
        description="Height in centimeters",
    )

    waist_cm: Optional[float] = Field(
        None,
        description="Waist circumference in centimeters",
    )

    hip_cm: Optional[float] = Field(
        None,
        description="Hip circumference in centimeters",
    )

    other_bone_fracture_after_20: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    long_term_steroid_use: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    parent_osteoporosis_history: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    mother_hip_fracture: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    father_hip_fracture: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    smoked_100_cigarettes: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    alcohol_frequency: Optional[float] = Field(
        None,
        description="Raw coded value from training data",
    )

    alcohol_drinks_per_day: Optional[float] = Field(
        None,
        description="Average drinks per day",
    )

    vigorous_work_activity: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    moderate_work_activity: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    walk_or_bicycle: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    vigorous_recreation: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    moderate_recreation: Optional[float] = Field(
        None,
        description="0 = no, 1 = yes",
    )

    sedentary_minutes: Optional[float] = Field(
        None,
        description="Sedentary minutes per day",
    )


class SHAPExplanation(BaseModel):
    """
    Explainability information for one model feature.
    """

    feature: str = Field(
        ...,
        description="Original model feature name",
    )

    label: str = Field(
        ...,
        description="User-friendly feature name",
    )

    value: Optional[float] = Field(
        None,
        description="Raw input value used for this feature",
    )

    shap_value: float = Field(
        ...,
        description="SHAP contribution for this feature",
    )

    direction: str = Field(
        ...,
        description=(
            "Direction of influence on the model output: "
            "increases_model_output, decreases_model_output, or neutral"
        ),
    )


class PredictionResponse(BaseModel):
    """
    Structured response for POST /api/predict.
    """

    prediction: int = Field(
        ...,
        description=(
            "0 = No Osteoporosis, 1 = Osteoporosis, "
            "using the model's tuned decision threshold"
        ),
    )

    osteoporosis_probability: float = Field(
        ...,
        description=(
            "Model's raw predicted probability for the positive "
            "class (osteoporosis), in [0, 1]"
        ),
    )

    risk_level: str = Field(
        ...,
        description=(
            "Application-layer interpretation of the probability "
            "(Low/Moderate/High). NOT a clinical threshold."
        ),
    )

    model_version: str = Field(
        ...,
        description="Frozen model version tag",
    )

    threshold_used: float = Field(
        ...,
        description=(
            "Decision threshold applied to compute prediction"
        ),
    )

    shap_explanations: List[SHAPExplanation] = Field(
        default_factory=list,
        description=(
            "Top SHAP explanations for the individual prediction"
        ),
    )

    disclaimer: str = Field(
        default=(
            "This is a research/prototype risk-assessment output, "
            "not a medical diagnosis, and has not been clinically "
            "validated."
        ),
        description="Fixed scope disclaimer returned with every prediction.",
    )