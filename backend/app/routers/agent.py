"""POST /api/agent/chat for the OsteoAI Agent foundation."""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.agent.service import handle_message, handle_message_stream
from app.agent_schemas import AgentChatRequest, AgentChatResponse


router = APIRouter(
    prefix="/api/agent",
    tags=["agent"],
)


@router.post(
    "/chat",
    response_model=AgentChatResponse,
)
def chat(payload: AgentChatRequest) -> AgentChatResponse:
    try:
        result = handle_message(
            message=payload.message,
            language=payload.language,
            conversation_id=payload.conversation_id,
            context=payload.context,
        )

        return AgentChatResponse(**result)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Agent request failed: {exc}",
        ) from exc


@router.post("/chat/stream")
def chat_stream(payload: AgentChatRequest) -> StreamingResponse:
    """Same as /chat, but streams newline-delimited JSON events."""

    def events():
        try:
            for event in handle_message_stream(
                message=payload.message,
                language=payload.language,
                conversation_id=payload.conversation_id,
                context=payload.context,
            ):
                yield json.dumps(event, ensure_ascii=False) + "\n"
        except Exception as exc:  # stream already started; report in-band
            yield json.dumps(
                {"type": "error", "detail": f"Agent request failed: {exc}"}
            ) + "\n"

    return StreamingResponse(events(), media_type="application/x-ndjson")
