"""
routers/document_extract.py
=======================================================================
POST /api/extract-document

Receives one user-selected document and returns conservatively extracted
assessment candidates for review. It does not call the ML model.
=======================================================================
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.document_extractor import (
    DocumentExtractionError,
    analyze_document,
)

router = APIRouter(prefix="/api", tags=["document"])


@router.post("/extract-document")
async def extract_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A document filename is required.")

    try:
        content = await file.read()
        result = analyze_document(file.filename, content)
        return result
    except DocumentExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Document extraction failed: {exc}",
        ) from exc
    finally:
        await file.close()
