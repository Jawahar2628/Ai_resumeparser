"""
Idempotent default admin user bootstrap logic executed automatically during FastAPI application lifespan startup.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger
from app.core.config import settings
from app.core.security import hash_password
from app.utils.constants import USERS_COLLECTION
from app.utils.helpers import generate_uuid, utc_now


async def bootstrap_default_admin(db: AsyncIOMotorDatabase) -> None:
    """
    Check if default administrator exists in MongoDB users collection.
    If absent, create administrator account automatically.
    This operation is strictly idempotent.
    """
    users_collection = db[USERS_COLLECTION]

    # Ensure Collections and Indexes exist
    from app.utils.constants import RESUMES_COLLECTION, RESUME_LOGS_COLLECTION
    try:
        await db[RESUME_LOGS_COLLECTION].create_index([("resume_id", 1)])
        await db[RESUME_LOGS_COLLECTION].create_index([("email", 1)])
        await db[RESUMES_COLLECTION].create_index([("parsed_data.email", 1)])
        logger.info(f"Initialized MongoDB collections '{RESUME_LOGS_COLLECTION}' and '{RESUMES_COLLECTION}' with indexes.")
    except Exception as idx_err:
        logger.warning(f"Index initialization note: {idx_err}")

    admin_email = settings.DEFAULT_ADMIN_EMAIL.strip().lower()
    existing_admin = await users_collection.find_one({"email": admin_email})

    if existing_admin:
        logger.info(f"Default admin user '{admin_email}' already exists. Skipping bootstrap.")
        return

    logger.info(f"Default admin user '{admin_email}' not found. Initializing bootstrap administrator creation...")

    admin_document = {
        "id": generate_uuid(),
        "full_name": settings.DEFAULT_ADMIN_NAME,
        "email": admin_email,
        "password": hash_password(settings.DEFAULT_ADMIN_PASSWORD),
        "role": settings.DEFAULT_ADMIN_ROLE,
        "is_active": True,
        "created_at": utc_now().isoformat(),
        "updated_at": utc_now().isoformat(),
    }

    await users_collection.insert_one(admin_document)
    logger.info(f"Successfully bootstrapped default admin account for '{admin_email}' with role '{settings.DEFAULT_ADMIN_ROLE}'.")
