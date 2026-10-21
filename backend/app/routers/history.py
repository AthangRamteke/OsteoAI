"""
routers/history.py
=======================================================================
The signed-in user's own assessment history:

    GET    /api/history              list, newest first
    POST   /api/history              save one entry (idempotent by id)
    DELETE /api/history/{record_id}  delete one entry

Every route requires a Bearer token and only ever touches that user's
rows, so a new account starts with an empty history.
=======================================================================
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth_schemas import UserOut
from app.db import DatabaseUnavailable
from app.db import user_assessments as store
from app.history_schemas import HistoryList, HistoryRecord
from app.routers.auth import current_user

logger = logging.getLogger("osteoai.history")

router = APIRouter(prefix="/api/history", tags=["history"])


def _unavailable(exc: DatabaseUnavailable) -> HTTPException:
    logger.error("History database error: %s", exc)
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="History is temporarily unavailable. Please try again.",
    )


@router.get("", response_model=HistoryList)
def list_history(user: UserOut = Depends(current_user)) -> HistoryList:
    try:
        return HistoryList(records=store.list_records(user.id))
    except DatabaseUnavailable as exc:
        raise _unavailable(exc) from exc


@router.post("", status_code=status.HTTP_201_CREATED)
def save_history(
    record: HistoryRecord, user: UserOut = Depends(current_user)
) -> dict[str, bool]:
    try:
        created = store.add_record(
            user.id, record.id, record.savedAt, record.model_dump(mode="json")
        )
    except DatabaseUnavailable as exc:
        raise _unavailable(exc) from exc

    return {"created": created}


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(record_id: str, user: UserOut = Depends(current_user)) -> Response:
    try:
        store.delete_record(user.id, record_id)
    except DatabaseUnavailable as exc:
        raise _unavailable(exc) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
