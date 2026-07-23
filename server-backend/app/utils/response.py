"""
Standardized API response helper functions for success and failure envelopes.
"""

from typing import Any, Dict, List, Optional
from fastapi.responses import JSONResponse


def success_response(
    data: Optional[Any] = None,
    message: str = "Success",
    status_code: int = 200,
) -> JSONResponse:
    """
    Build a standardized success JSON response.

    Schema:
    {
        "success": True,
        "message": message,
        "data": data
    }
    """
    content = {
        "success": True,
        "message": message,
        "data": data if data is not None else {},
    }
    return JSONResponse(status_code=status_code, content=content)


def error_response(
    message: str = "Request failed",
    errors: Optional[List[Any]] = None,
    status_code: int = 400,
) -> JSONResponse:
    """
    Build a standardized failure JSON response.

    Schema:
    {
        "success": False,
        "message": message,
        "errors": errors
    }
    """
    content = {
        "success": False,
        "message": message,
        "errors": errors if errors is not None else [],
    }
    return JSONResponse(status_code=status_code, content=content)
