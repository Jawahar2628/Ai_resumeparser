"""
Authentication middleware helper functions and token inspection utilities.
"""

from typing import Optional
from fastapi import Request


def extract_bearer_token(request: Request) -> Optional[str]:
    """Extract Bearer JWT token from Authorization header if present."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    parts = auth_header.split(" ")
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None
