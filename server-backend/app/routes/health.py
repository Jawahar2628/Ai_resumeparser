"""
Health check monitoring endpoint for API status, MongoDB connectivity, application version, and uptime.
"""

import time
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.utils.response import success_response

router = APIRouter(tags=["Health Check"])
START_TIME = time.time()
APP_VERSION = "1.0.0"


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Check application status, MongoDB connection health, uptime, and system version.",
)
async def health_check(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Check backend operational health and database connectivity."""
    db_status = "connected"
    try:
        await db.command("ping")
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    uptime_seconds = round(time.time() - START_TIME, 2)

    health_data = {
        "status": "healthy" if db_status == "connected" else "degraded",
        "mongodb_status": db_status,
        "version": APP_VERSION,
        "uptime_seconds": uptime_seconds,
    }

    return success_response(
        data=health_data,
        message="Service is operational.",
        status_code=status.HTTP_200_OK,
    )
