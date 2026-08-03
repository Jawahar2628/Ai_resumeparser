from typing import Any, Dict
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardMetricsResponse
from app.core.exceptions import AppException
from fastapi import status

class DashboardController:
    def __init__(self, service: DashboardService):
        self.service = service

    async def get_dashboard_metrics(self) -> DashboardMetricsResponse:
        try:
            metrics_dict = await self.service.get_dashboard_metrics()
            return DashboardMetricsResponse(**metrics_dict)
        except Exception as e:
            from loguru import logger
            logger.error(f"Error fetching dashboard metrics: {str(e)}")
            raise AppException("Failed to fetch dashboard metrics", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e
