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
from app.routers.simulate import router as simulate_router

app = FastAPI(
    title="OsteoAI API",
    description=(
        "Research/prototype osteoporosis risk-assessment API. Outputs are "
        "estimated probabilities and a threshold-derived risk flag, NOT a "
        "medical diagnosis, and have not been clinically validated."
    ),
    version=MODEL_VERSION,
)

# Development CORS: any port on the local machine.
#
# Vite picks the next free port when 5173 is taken (5174, 5175, ...),
# and a fixed list silently blocks every API call from that origin,
# which the browser reports only as "Failed to fetch".
#
# TODO before production deployment: replace with the real frontend origin(s).
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(document_extract.router)
app.include_router(agent_router)
app.include_router(knowledge_router)
app.include_router(simulate_router)



@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "service": "OsteoAI API",
        "model_version": MODEL_VERSION,
    }
