"""
routers/predict.py
=======================================================================
POST /api/predict

Accepts the exact 22-feature OsteoAI payload, runs it through the frozen
ML pipeline, and returns a structured prediction. All request validation
(required fields present with the right shape, correct types) is handled
by the PatientFeatures pydantic schema before this function ever runs.
=======================================================================
"""

from fastapi import APIRouter, HTTPException

from app.schemas import PatientFeatures, PredictionResponse
from app.services.predictor import predict_patient

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PatientFeatures) -> PredictionResponse:
    try:
        result = predict_patient(payload.model_dump())
    except Exception as exc:  # defensive: never let a bad row 500 without context
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    return PredictionResponse(**result)
