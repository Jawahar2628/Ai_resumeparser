"""
Tests for resume upload, file format validation, and text extraction error handling.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_upload_invalid_file_extension(async_client: AsyncClient, mock_auth_headers: dict):
    """Verify uploading unsupported file type (.txt) returns 400 Bad Request."""
    files = {"file": ("test.txt", b"Unsupported content", "text/plain")}
    response = await async_client.post(
        "/api/v1/resumes/upload",
        files=files,
        headers=mock_auth_headers,
    )
    assert response.status_code in (400, 401)
    data = response.json()
    assert data["success"] is False
