"""
routers/predict.py
=======================================================================
POST /api/predict

Accepts the exact 22-feature OsteoAI payload, runs it through the frozen
ML pipeline, and returns a structured prediction. All request validation
(required fields present with the right shape, correct types) is handled
by the PatientFeatures pydantic schema before this function ever runs.

This endpoint is also the single place a real assessment is recorded.
Persistence happens here rather than inside predict_patient() because
/api/simulate reuses that same service for hypothetical What-if runs,
which must never be stored as real assessments.
=======================================================================
"""

import logging

from fastapi import APIRouter, Depends, HTTPException

from app.auth_schemas import UserOut
from app.config import database_required, database_url
from app.db import DatabaseUnavailable
from app.db.assessments import save_assessment
from app.routers.auth import optional_user
from app.schemas import PatientFeatures, PredictionResponse
from app.services.predictor import predict_patient

logger = logging.getLogger("osteoai.predict")

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
def predict(
    payload: PatientFeatures,
    user: UserOut | None = Depends(optional_user),
) -> PredictionResponse:
    features = payload.model_dump()

    try:
        result = predict_patient(features)
    except Exception as exc:  # defensive: never let a bad row 500 without context
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    assessment_id: int | None = None

    # Gate on configuration, not on driver availability: a missing driver
    # is a database failure and must be reported as one.
    if database_url() is not None:
        try:
            assessment_id = save_assessment(
                features, result, user_id=user.id if user else None
            )
        except DatabaseUnavailable as exc:
            # Never claim a save that did not happen. With DB_REQUIRED=true
            # the request fails; otherwise the prediction is still returned,
            # flagged as not persisted.
            logger.error("Assessment not saved: %s", exc)

            if database_required():
                raise HTTPException(
                    status_code=503,
                    detail="Prediction succeeded but could not be saved.",
                ) from exc

    return PredictionResponse(
        **result,
        assessment_id=assessment_id,
        persisted=assessment_id is not None,
    )
