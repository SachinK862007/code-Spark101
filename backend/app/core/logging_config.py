"""Logging configuration with secret redaction.

A filter rewrites any known secret value out of every log record so that an
accidental ``logger.info(url_with_key)`` can never leak an API key.
"""

from __future__ import annotations

import logging
import sys

from app.core.config import settings

REDACTED = "[redacted]"


class SecretRedactionFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:  # noqa: A003 - stdlib API
        try:
            message = record.getMessage()
        except Exception:  # pragma: no cover - defensive
            return True
        for secret in settings.secret_values():
            if secret and secret in message:
                message = message.replace(secret, REDACTED)
                record.msg = message
                record.args = ()
        return True


def configure_logging() -> None:
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
    )
    handler.addFilter(SecretRedactionFilter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(settings.log_level)

    # httpx logs full request URLs at INFO; that would include API keys.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
