"""
Tests for health check endpoint and database status monitoring.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_endpoint(async_client: AsyncClient):
    """Verify /health endpoint returns 200 OK with expected JSON structure."""
    response = await async_client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "status" in data["data"]
    assert "mongodb_status" in data["data"]
    assert "version" in data["data"]
    assert "uptime_seconds" in data["data"]
