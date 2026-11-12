"""Shared route dependencies."""

from __future__ import annotations

import re

from fastapi import Header

SESSION_PATTERN = re.compile(r"^[A-Za-z0-9_-]{6,64}$")


def session_id(
    x_session_id: str | None = Header(default=None, alias="X-Session-Id"),
) -> str:
    """Anonymous session scope for history. Never an authentication mechanism."""
    if x_session_id and SESSION_PATTERN.match(x_session_id):
        return x_session_id
    return "anonymous"
