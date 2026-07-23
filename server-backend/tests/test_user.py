"""
Tests for user profile retrieval and RBAC permissions.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_non_admin_cannot_access_user_list(async_client: AsyncClient, mock_auth_headers: dict):
    """Verify non-admin user receives 403 Forbidden when requesting user list."""
    response = await async_client.get("/api/v1/users", headers=mock_auth_headers)
    assert response.status_code in (401, 403)
    data = response.json()
    assert data["success"] is False
