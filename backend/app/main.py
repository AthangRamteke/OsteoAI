"""
main.py
=======================================================================
OsteoAI FastAPI application entry point.
=======================================================================
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import close_pool, is_configured, ping
from app.routers import predict
from app.routers import document_extract
from app.services.predictor import MODEL_VERSION
from app.routers.agent import router as agent_router
from app.routers.auth import router as auth_router
from app.routers.doctors import router as doctors_router
from app.routers.history import router as history_router
from app.routers.knowledge import router as knowledge_router
from app.routers.simulate import router as simulate_router

logger = logging.getLogger("osteoai")


def _use_uvicorn_handlers() -> None:
    """
    Route "osteoai" log records through uvicorn's handlers.

    On its own the "osteoai" logger has no handler under uvicorn, so
    Python falls back to its last-resort handler, which drops anything
    below WARNING - and the start-up database status would never be
    printed. Nothing happens when the app runs outside uvicorn.
    """


    if logger.handlers:
        return

    # uvicorn configures handlers on "uvicorn"; "uvicorn.error" only
    # propagates to it, so both names have to be tried.
    for name in ("uvicorn.error", "uvicorn"):
        source = logging.getLogger(name)

        if source.handlers:
            logger.handlers = source.handlers
            logger.setLevel(source.level or logging.INFO)
            return


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Report database availability once at start-up and release the pool
    on shutdown. A missing or unreachable database is logged, not fatal:
    the API still serves predictions, flagged as not persisted.
    """

    _use_uvicorn_handlers()

    if not is_configured():
        logger.warning(
            "DATABASE_URL not set - assessments will not be persisted."
        )
    elif ping():
        logger.info("PostgreSQL connection OK - assessments will be saved.")
    else:
        logger.error(
            "DATABASE_URL is set but PostgreSQL is unreachable - "
            "assessments will not be saved."
        )

    yield

    close_pool()


app = FastAPI(
    lifespan=lifespan,
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
# Deployed frontend: any *.vercel.app URL (production + preview deploys),
# plus an optional comma-separated CORS_ORIGINS for a custom domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        o.strip()
        for o in os.environ.get("CORS_ORIGINS", "").split(",")
        if o.strip()
    ],
    allow_origin_regex=(
        r"http://(localhost|127\.0\.0\.1)(:\d+)?"
        r"|https://[a-z0-9-]+\.vercel\.app"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(document_extract.router)
app.include_router(agent_router)
app.include_router(knowledge_router)
app.include_router(simulate_router)
app.include_router(auth_router)
app.include_router(doctors_router)
app.include_router(history_router)



@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "service": "OsteoAI API",
        "model_version": MODEL_VERSION,
        "database": "connected" if ping() else "unavailable",
    }
