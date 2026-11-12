"""Schema initialisation.

The project deliberately ships without Alembic for the first local iteration:
``create_all`` is deterministic for the small schema and the models are written
so that a future Alembic migration can take over without changes.
"""

from __future__ import annotations

import logging

from app.database.session import Base, engine
from app.models import conversation  # noqa: F401 - registers models on Base

logger = logging.getLogger(__name__)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema ready (%s)", engine.url.render_as_string(hide_password=True))
