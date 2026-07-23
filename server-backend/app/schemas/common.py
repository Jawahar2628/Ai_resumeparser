"""
Generic Pydantic schema models for standard API responses.
"""

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard success API response schema."""

    success: bool = True
    message: str = "Success"
    data: Optional[T] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """Standard error API response schema."""

    success: bool = False
    message: str = "Request failed"
    errors: List[Any] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
