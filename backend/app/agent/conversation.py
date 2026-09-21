"""Lightweight in-memory conversation state for the Agent foundation."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
import uuid


MAX_TURNS = 20


@dataclass
class Conversation:
    conversation_id: str
    language: str = "en"
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    turns: list[dict[str, Any]] = field(default_factory=list)

    def add_turn(
        self,
        role: str,
        content: str,
        *,
        intent: str | None = None,
    ) -> None:
        self.turns.append(
            {
                "role": role,
                "content": content,
                "intent": intent,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

        if len(self.turns) > MAX_TURNS:
            self.turns = self.turns[-MAX_TURNS:]


_CONVERSATIONS: dict[str, Conversation] = {}


def get_or_create_conversation(
    conversation_id: str | None,
    language: str,
) -> Conversation:
    if conversation_id and conversation_id in _CONVERSATIONS:
        conversation = _CONVERSATIONS[conversation_id]
        conversation.language = language
        return conversation

    new_id = conversation_id or str(uuid.uuid4())

    conversation = Conversation(
        conversation_id=new_id,
        language=language,
    )

    _CONVERSATIONS[new_id] = conversation

    return conversation