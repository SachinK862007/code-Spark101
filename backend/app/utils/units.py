"""Unit helpers so capacity (MW) and generation (MWh) are never conflated."""

from __future__ import annotations

UNIT_KWH = "kWh"
UNIT_MWH = "MWh"


def to_mwh(value: float, unit: str) -> float:
    """Convert an energy quantity to MWh."""
    normalized = unit.strip().lower()
    if normalized in {"kwh", "kilo watt hour", "kilowatt-hour"}:
        return value / 1000.0
    if normalized in {"mwh", "megawatt hour"}:
        return value
    if normalized in {"gwh", "gigawatt hour"}:
        return value * 1000.0
    if normalized in {"twh", "terawatt hour"}:
        return value * 1_000_000.0
    raise ValueError(f"Unsupported energy unit: {unit}")


def to_kwh(value: float, unit: str) -> float:
    return to_mwh(value, unit) * 1000.0


def round_or_none(value: float | None, digits: int = 2) -> float | None:
    return None if value is None else round(value, digits)
