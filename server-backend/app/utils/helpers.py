"""
Utility helper functions for UUID generation, timestamp formatting, and text sanitization.
"""

import uuid
from datetime import datetime, timezone


def generate_uuid() -> str:
    """Generate a string representation of a UUIDv4."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


def sanitize_filename(filename: str) -> str:
    """Sanitize original filename to prevent directory traversal attack."""
    cleaned = filename.replace("\\", "/").split("/")[-1]
    return cleaned.replace(" ", "_")
