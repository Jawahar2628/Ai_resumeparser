"""
Loguru logging configuration establishing log destinations (stdout, app.log, error.log).
"""

import sys
from pathlib import Path
from loguru import logger

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

APP_LOG_PATH = LOG_DIR / "app.log"
ERROR_LOG_PATH = LOG_DIR / "error.log"


def setup_logging() -> None:
    """Configure Loguru sinks for console output and rotating file logs."""
    logger.remove()

    # Standard Output console logging
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
        enqueue=True,
    )

    # General app log file
    logger.add(
        APP_LOG_PATH,
        rotation="10 MB",
        retention="30 days",
        level="DEBUG",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )

    # Error-only log file
    logger.add(
        ERROR_LOG_PATH,
        rotation="10 MB",
        retention="30 days",
        level="ERROR",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )

    logger.info("Loguru logging configured successfully.")
