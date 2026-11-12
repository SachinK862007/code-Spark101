"""Ask URJA API schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=400)
    session_id: str = Field(
        default="anonymous",
        max_length=64,
        description="Anonymous client session id; never a user identity.",
    )
    previous_question: str | None = Field(default=None, max_length=400)
    limit: int = Field(default=6, ge=1, le=10)
    store: bool = Field(
        default=True,
        description="Persist this exchange in the anonymous session history.",
    )


class AskSource(BaseModel):
    title: str
    url: str
    snippet: str
    source_name: str
    is_official: bool
    priority: int
    published_at: str | None = None
    retrieved_at: str | None = None


class AskResponse(BaseModel):
    question: str
    answer: str
    answer_kind: Literal["retrieved_excerpts", "no_results", "provider_unavailable"]
    sources: list[AskSource]
    provider: str
    retrieved_at: str
    cached: bool
    context_used: bool
    official_source_count: int


class AskHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    provider: str
    created_at: datetime
    sources: list[dict[str, Any]]


class AskHistoryResponse(BaseModel):
    count: int
    turns: list[AskHistoryItem]
