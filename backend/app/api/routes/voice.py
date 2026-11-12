"""Voice endpoints — Google Cloud STT/TTS with a browser fallback signal."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response

from app.core.security import rate_limit
from app.schemas.voice import SpeakRequest, TranscribeResponse, VoiceStatusResponse
from app.services import voice_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Voice"])


@router.get(
    "/status",
    response_model=VoiceStatusResponse,
    summary="Voice provider availability and supported commands",
)
def status() -> VoiceStatusResponse:
    return VoiceStatusResponse(**voice_service.availability())


@router.post(
    "/transcribe",
    response_model=TranscribeResponse,
    summary="Transcribe a short audio clip (in memory only)",
    dependencies=[Depends(rate_limit("voice", 20))],
)
async def transcribe(
    audio: UploadFile = File(...),
    language: str = Form(default="en-IN"),
) -> TranscribeResponse:
    payload = await audio.read()
    result = voice_service.transcribe_audio(
        payload, language=language, mime_type=audio.content_type or "audio/webm"
    )
    return TranscribeResponse(
        transcript=result.transcript,
        language=result.language,
        provider=result.provider,
        duration_note="Audio is processed in memory and is not stored.",
    )


@router.post(
    "/speak",
    summary="Synthesise speech for an answer",
    response_class=Response,
    dependencies=[Depends(rate_limit("voice", 30))],
)
def speak(payload: SpeakRequest) -> Response:
    audio, media_type = voice_service.synthesize_speech(
        payload.text, language=payload.language
    )
    return Response(
        content=audio,
        media_type=media_type,
        headers={
            "Cache-Control": "no-store",
            "Content-Disposition": "inline; filename=urja-response.mp3",
        },
    )
