from fastapi import APIRouter, Depends
from typing import Any
from app.schemas.common import ApiResponse
from app.schemas.dashboard import DashboardMetricsResponse
from app.services.dashboard_service import DashboardService
from app.controllers.dashboard_controller import DashboardController
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

def get_dashboard_controller() -> DashboardController:
    service = DashboardService()
    return DashboardController(service)

@router.get("/metrics", response_model=ApiResponse[DashboardMetricsResponse])
async def get_dashboard_metrics(
    controller: DashboardController = Depends(get_dashboard_controller),
    current_user: Any = Depends(get_current_user)
):
    """
    Get aggregated dashboard metrics.
    """
    data = await controller.get_dashboard_metrics()
    return ApiResponse(success=True, message="Dashboard metrics retrieved", data=data)
