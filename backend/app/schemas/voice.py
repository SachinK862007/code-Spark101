"""Voice API schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class TranscribeResponse(BaseModel):
    transcript: str
    language: str
    provider: str
    duration_note: str


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1500)
    language: str = Field(default="en-IN", max_length=10)


class VoiceStatusResponse(BaseModel):
    provider: str
    configured: bool
    sdk_installed: bool
    detail: str | None
    supported_languages: list[dict[str, str]]
    fallback: str
    supported_actions: list[dict[str, Any]]
