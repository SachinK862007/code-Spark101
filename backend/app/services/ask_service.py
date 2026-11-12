"""Ask URJA answer composition.

The backend does not have an LLM in the loop, so it never invents prose. It
composes an answer from the retrieved snippets, keeps every claim attributable
to a source URL, and labels the result as retrieved excerpts. Nothing is
paraphrased into a statement the sources do not make.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from app.services.exceptions import ServiceError
from app.services.google_search_service import normalize_query, search_official

logger = logging.getLogger(__name__)

FOLLOW_UP_WORDS = ("it", "that", "this", "they", "them", "those", "more", "why")


def _needs_context(question: str) -> bool:
    lowered = question.lower()
    return len(lowered.split()) <= 5 or any(
        word in lowered.split() for word in FOLLOW_UP_WORDS
    )


def _clean_snippet(snippet: str, limit: int = 320) -> str:
    text = " ".join(snippet.split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return f"{cut}…"


def _compose(question: str, sources: list[dict[str, Any]], retrieved_at: str) -> str:
    if not sources:
        return (
            "No relevant sources were returned for this question. Try rephrasing it, "
            "or check the Google Programmable Search configuration in backend/.env."
        )

    official = [item for item in sources if item["is_official"]]
    lead = (
        f"Here is what I retrieved for “{question}” at {retrieved_at}. "
        f"{len(sources)} result(s) were returned"
    )
    if official:
        lead += f", of which {len(official)} are government or institutional sources. "
    else:
        lead += ", none of which is an official government source. "
    lead += (
        "The lines below are direct excerpts from those pages, not generated claims."
    )

    lines = [lead]
    for index, item in enumerate(sources, start=1):
        label = "Official source" if item["is_official"] else "Other source"
        lines.append(
            f"{index}. {item['title']} — {item['source_name']} ({label})\n"
            f"   {_clean_snippet(item['snippet']) or 'No snippet was provided by the provider.'}"
        )

    lines.append(
        "Verify any figure against the linked page before relying on it. Figures quoted "
        "from a page describe that page's own reporting period."
    )
    return "\n\n".join(lines)


async def answer_question(
    question: str,
    *,
    previous_question: str | None = None,
    limit: int = 6,
) -> dict[str, Any]:
    normalized = normalize_query(question)
    effective_query = normalized
    context_used = False
    if previous_question and _needs_context(normalized):
        effective_query = f"{previous_question} {normalized}"
        context_used = True

    sources, provider, cached = await search_official(effective_query, limit=limit)
    retrieved_at = (
        sources[0]["retrieved_at"]
        if sources
        else datetime.now(timezone.utc).isoformat()
    )
    answer = _compose(normalized, sources, retrieved_at)

    return {
        "question": normalized,
        "answer": answer,
        "answer_kind": "retrieved_excerpts" if sources else "no_results",
        "sources": sources,
        "provider": provider,
        "retrieved_at": retrieved_at,
        "cached": cached,
        "context_used": context_used,
        "official_source_count": sum(1 for item in sources if item["is_official"]),
    }


def build_unavailable_message(error: ServiceError) -> dict[str, Any]:
    return {
        "question": "",
        "answer": error.message,
        "answer_kind": "provider_unavailable",
        "sources": [],
        "provider": "unavailable",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "cached": False,
        "context_used": False,
        "official_source_count": 0,
    }
