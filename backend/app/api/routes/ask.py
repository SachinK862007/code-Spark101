"""Ask URJA — sourced information retrieval."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import session_id as session_dependency
from app.core.config import settings
from app.core.security import rate_limit
from app.database.session import get_db
from app.models.conversation import ConversationTurn
from app.schemas.ask import AskHistoryResponse, AskRequest, AskResponse
from app.services import ask_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ask", tags=["Ask URJA"])


@router.post(
    "",
    response_model=AskResponse,
    summary="Ask a question and get a sourced answer",
    dependencies=[Depends(rate_limit("ask", 20))],
)
async def ask(payload: AskRequest, db: Session = Depends(get_db)) -> AskResponse:
    result = await ask_service.answer_question(
        payload.question,
        previous_question=payload.previous_question,
        limit=payload.limit,
    )

    if payload.store and result["answer_kind"] == "retrieved_excerpts":
        try:
            db.add(
                ConversationTurn(
                    session_id=session_id_value(payload.session_id),
                    question=result["question"],
                    answer=result["answer"],
                    provider=result["provider"],
                    sources=result["sources"],
                )
            )
            db.commit()
        except Exception:  # pragma: no cover - history is non-critical
            db.rollback()
            logger.warning("Could not persist conversation turn")

    return AskResponse(**result)


def session_id_value(raw: str) -> str:
    """Only accept a well-formed anonymous session id."""
    from app.api.deps import SESSION_PATTERN

    return raw if SESSION_PATTERN.match(raw) else "anonymous"


@router.get(
    "/history",
    response_model=AskHistoryResponse,
    summary="Recent turns for this anonymous session",
)
def history(
    limit: int = Query(default=20, ge=1, le=settings.max_ask_history),
    session: str = Depends(session_dependency),
    db: Session = Depends(get_db),
) -> AskHistoryResponse:
    rows = db.scalars(
        select(ConversationTurn)
        .where(ConversationTurn.session_id == session)
        .order_by(desc(ConversationTurn.created_at))
        .limit(limit)
    ).all()

    turns = [
        {
            "id": row.id,
            "question": row.question,
            "answer": row.answer,
            "provider": row.provider,
            "created_at": row.created_at,
            "sources": row.sources or [],
        }
        for row in rows
    ]
    return AskHistoryResponse(count=len(turns), turns=turns)
