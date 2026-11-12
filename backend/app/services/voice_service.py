"""Google Cloud Speech-to-Text / Text-to-Speech.

The service account is loaded server-side from
``GOOGLE_APPLICATION_CREDENTIALS``. Audio is processed in memory and never
written to disk or the database. If the SDK or credentials are missing, a
structured ``voice_not_configured`` error is raised so the browser can use its
own speech fallback instead of pretending Google voice is active.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from app.core.config import settings
from app.services.exceptions import ServiceError

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {
    "en-IN": "English (India)",
    "hi-IN": "Hindi",
    "kn-IN": "Kannada",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "bn-IN": "Bengali",
    "mr-IN": "Marathi",
}

MAX_AUDIO_BYTES = 5 * 1024 * 1024
MAX_SPEECH_CHARS = 1500

# A controlled vocabulary of supported platform commands. Used for documentation
# and intended-action display; no command can execute code or transactions.
SUPPORTED_ACTIONS = [
    {"intent": "weather", "route": "/weather", "example": "Show me today's weather in Bengaluru"},
    {"intent": "rpo", "route": "/rpo", "example": "Calculate my RPO compliance"},
    {"intent": "solar", "route": "/solar-roi", "example": "Open the solar ROI calculator"},
    {"intent": "energy", "route": "/energy-mix", "example": "Show renewable energy data"},
    {"intent": "services", "route": "/services", "example": "Find government solar schemes"},
    {"intent": "forecast", "route": "/forecasting", "example": "Open the energy forecast page"},
]


@dataclass(frozen=True)
class TranscriptionResult:
    transcript: str
    language: str
    provider: str


def availability() -> dict[str, Any]:
    installed = True
    detail = None
    try:  # pragma: no cover - import check only
        import google.cloud.speech  # noqa: F401
        import google.cloud.texttospeech  # noqa: F401
    except Exception:  # pragma: no cover
        installed = False
        detail = "google-cloud-speech / google-cloud-texttospeech are not installed."

    configured = settings.voice_configured
    if not configured:
        detail = (
            "GOOGLE_APPLICATION_CREDENTIALS is not set to a readable service-account file."
        )
    return {
        "provider": "google_cloud",
        "configured": bool(configured and installed),
        "sdk_installed": installed,
        "detail": detail,
        "supported_languages": [
            {"code": code, "label": label} for code, label in SUPPORTED_LANGUAGES.items()
        ],
        "fallback": "browser_web_speech",
        "supported_actions": SUPPORTED_ACTIONS,
    }


def _require_configured() -> None:
    state = availability()
    if not state["configured"]:
        raise ServiceError(
            code="voice_not_configured",
            message=(
                "Google Cloud voice is not configured. "
                f"{state['detail']} The client can use the browser speech fallback."
            ),
            status_code=503,
            details={"fallback": "browser_web_speech"},
        )


def transcribe_audio(
    audio: bytes, *, language: str = "en-IN", mime_type: str = "audio/webm"
) -> TranscriptionResult:
    _require_configured()

    if language not in SUPPORTED_LANGUAGES:
        raise ServiceError(
            code="unsupported_language",
            message=f"Language '{language}' is not enabled. Supported: {', '.join(SUPPORTED_LANGUAGES)}.",
            status_code=422,
        )
    if not audio:
        raise ServiceError(
            code="invalid_audio",
            message="No audio was received.",
            status_code=422,
        )
    if len(audio) > MAX_AUDIO_BYTES:
        raise ServiceError(
            code="audio_too_large",
            message="Audio must be 5 MB or smaller (about a minute of speech).",
            status_code=413,
        )

    try:  # pragma: no cover - requires credentials
        from google.cloud import speech

        client = speech.SpeechClient()
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
            if "webm" in mime_type
            else speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
            sample_rate_hertz=48000,
            language_code=language,
            enable_automatic_punctuation=True,
            model="latest_short",
        )
        response = client.recognize(
            config=config, audio=speech.RecognitionAudio(content=audio)
        )
        transcript = " ".join(
            result.alternatives[0].transcript
            for result in response.results
            if result.alternatives
        ).strip()
    except Exception as error:  # pragma: no cover - external failure path
        logger.warning("Google STT failed: %s", type(error).__name__)
        raise ServiceError(
            code="transcription_failed",
            message=(
                "Speech recognition failed. Check that the Speech-to-Text API is "
                "enabled for the service account and that the audio format is supported."
            ),
            status_code=502,
        ) from error

    if not transcript:
        raise ServiceError(
            code="empty_transcript",
            message="No speech was recognised in that recording. Please try again.",
            status_code=422,
        )

    return TranscriptionResult(transcript=transcript, language=language, provider="google_cloud")


def synthesize_speech(
    text: str, *, language: str = "en-IN", voice_name: str | None = None
) -> tuple[bytes, str]:
    _require_configured()

    cleaned = " ".join(text.split())
    if not cleaned:
        raise ServiceError(
            code="invalid_text", message="Text is required.", status_code=422
        )
    if len(cleaned) > MAX_SPEECH_CHARS:
        cleaned = cleaned[:MAX_SPEECH_CHARS].rsplit(" ", 1)[0] + "…"
    if language not in SUPPORTED_LANGUAGES:
        raise ServiceError(
            code="unsupported_language",
            message=f"Language '{language}' is not enabled.",
            status_code=422,
        )

    try:  # pragma: no cover - requires credentials
        from google.cloud import texttospeech

        client = texttospeech.TextToSpeechClient()
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=cleaned),
            voice=texttospeech.VoiceSelectionParams(
                language_code=language,
                name=voice_name or None,
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
            ),
            audio_config=texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=1.0,
            ),
        )
        return response.audio_content, "audio/mpeg"
    except Exception as error:  # pragma: no cover - external failure path
        logger.warning("Google TTS failed: %s", type(error).__name__)
        raise ServiceError(
            code="speech_synthesis_failed",
            message=(
                "Speech synthesis failed. Check that the Text-to-Speech API is enabled "
                "for the service account and that the voice supports this language."
            ),
            status_code=502,
        ) from error
