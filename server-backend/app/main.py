"""
Main FastAPI application entry point initializing lifespan, CORS, middlewares, routers, and exception handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.lifespan import lifespan
from app.middleware.request_logger import RequestLoggerMiddleware
from app.routes import auth, health, interview, resume, users


def create_application() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="Production-ready FastAPI backend for AI Resume Parser with MongoDB Motor, JWT Auth, and PyMuPDF text extraction.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Enable Trusted Host Security Middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"],
    )

    # Enable Request Duration Logger Middleware
    app.add_middleware(RequestLoggerMiddleware)

    # Register Exception Handlers
    register_exception_handlers(app)

    # Mount Static directory
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

    # Include Routers
    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(resume.router)
    app.include_router(interview.router)

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
