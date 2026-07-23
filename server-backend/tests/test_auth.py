"""
Tests for user authentication, registration, login, token refresh, and validation.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_validation_failure(async_client: AsyncClient):
    """Verify invalid email or short password produces 422 Unprocessable Entity."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "invalid-email-format", "password": "123"},
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["message"] == "Validation failed"


@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    """Verify accessing protected route without Bearer token returns 401 Unauthorized."""
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
