from fastapi import APIRouter, Depends
from typing import Optional
from app.schemas.settings import EmailConfigCreate, EmailConfigResponse
from app.controllers.settings_controller import SettingsController
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

def get_controller():
    return SettingsController()

@router.get("/email", response_model=EmailConfigResponse)
async def get_email_config(controller: SettingsController = Depends(get_controller)):
    return await controller.get_email_config()

@router.put("/email", response_model=EmailConfigResponse)
async def update_email_config(
    config: EmailConfigCreate,
    controller: SettingsController = Depends(get_controller)
):
    return await controller.update_email_config(config)

class TestEmailRequest(BaseModel):
    email: EmailStr

@router.post("/email/test")
async def test_email_config(
    request: TestEmailRequest,
    controller: SettingsController = Depends(get_controller)
):
    return await controller.test_email_config(request.email)
