"""GET /api/knowledge: content for the Knowledge & Support page."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from app.knowledge import load_content


router = APIRouter(
    prefix="/api/knowledge",
    tags=["knowledge"],
)


@router.get("")
def get_knowledge(
    lang: str = Query("en", description="UI language: en, hi, or mr."),
) -> dict[str, Any]:
    return load_content(lang)
