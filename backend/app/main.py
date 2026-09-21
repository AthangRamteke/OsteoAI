"""
main.py
=======================================================================
OsteoAI FastAPI application entry point.
=======================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predict
from app.routers import document_extract
from app.services.predictor import MODEL_VERSION
from app.routers.agent import router as agent_router
from app.routers.knowledge import router as knowledge_router

app = FastAPI(
    title="OsteoAI API",
    description=(
        "Research/prototype osteoporosis risk-assessment API. Outputs are "
        "estimated probabilities and a threshold-derived risk flag, NOT a "
        "medical diagnosis, and have not been clinically validated."
    ),
    version=MODEL_VERSION,
)

# Development CORS: allow common local React/Vite dev server origins.
# TODO before production deployment: replace with the real frontend origin(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(document_extract.router)
app.include_router(agent_router)
app.include_router(knowledge_router)



@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "service": "OsteoAI API",
        "model_version": MODEL_VERSION,
    }
