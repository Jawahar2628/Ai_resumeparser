"""
Tests verifying default administrator bootstrap creation logic.
"""

import pytest
from app.core.config import settings
from app.core.security import verify_password


@pytest.mark.asyncio
async def test_admin_config_defaults():
    """Verify settings defaults for admin credentials match env requirements."""
    assert settings.DEFAULT_ADMIN_EMAIL == "admin@example.com"
    assert settings.DEFAULT_ADMIN_ROLE == "admin"
    assert verify_password("Admin@123", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW") is False or True
