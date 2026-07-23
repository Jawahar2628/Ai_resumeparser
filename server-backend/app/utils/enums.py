"""
Enum definitions for application roles, resume processing status, and allowed file formats.
"""

from enum import Enum


class UserRole(str, Enum):
    """User system roles."""
    ADMIN = "admin"
    USER = "user"


class ResumeStatus(str, Enum):
    """Resume extraction/processing lifecycle status."""
    PENDING = "PENDING"
    PARSED = "PARSED"
    FAILED = "FAILED"


class AllowedFileExtensions(str, Enum):
    """Supported file extensions for resume upload."""
    PDF = "pdf"
    DOC = "doc"
    DOCX = "docx"
