"""Pydantic contracts for POST /api/agent/chat."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AgentChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User message to the OsteoAI Agent.",
    )

    language: str = Field(
        default="en",
        description="UI language: en, hi, or mr.",
    )

    conversation_id: str | None = Field(
        default=None,
        max_length=100,
    )

    context: dict[str, Any] | None = Field(
        default=None,
        description=(
            "Optional request context such as the current prediction "
            "result and assessment data needed by a tool."
        ),
    )


class AgentAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: str
    path: str | None = None
    tool: str | None = None


class AgentChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation_id: str
    intent: str
    language: str
    message: str
    action: AgentAction | None = None
    needs_confirmation: bool = False