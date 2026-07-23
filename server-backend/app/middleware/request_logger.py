"""
Request logger middleware using Loguru to record request duration, status codes, and client details.
"""

import time
from fastapi import Request
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Middleware logging HTTP requests and timing response execution."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        client_host = request.client.host if request.client else "unknown"

        logger.info(f"Incoming Request: {request.method} {request.url.path} from {client_host}")

        try:
            response = await call_next(request)
            process_time = (time.perf_counter() - start_time) * 1000
            logger.info(
                f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Completed in {process_time:.2f}ms"
            )
            return response
        except Exception as exc:
            process_time = (time.perf_counter() - start_time) * 1000
            logger.error(
                f"Request Failed: {request.method} {request.url.path} after {process_time:.2f}ms with error: {str(exc)}"
            )
            raise exc
