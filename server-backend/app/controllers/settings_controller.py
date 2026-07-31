from fastapi import HTTPException
from app.services.settings_service import SettingsService
from app.schemas.settings import EmailConfigCreate, EmailConfigResponse
from app.utils.encryption import decrypt_password
import smtplib
from email.message import EmailMessage

class SettingsController:
    def __init__(self):
        self.service = SettingsService()

    async def get_email_config(self) -> EmailConfigResponse:
        config = await self.service.get_email_config()
        if not config:
            raise HTTPException(status_code=404, detail="Email configuration not found")
        return config

    async def update_email_config(self, config_data: EmailConfigCreate) -> EmailConfigResponse:
        return await self.service.save_email_config(config_data)

    async def test_email_config(self, email_to: str) -> dict:
        config_model = await self.service.repository.get_email_config()
        if not config_model:
            raise HTTPException(status_code=400, detail="Email configuration not set")
            
        try:
            password = decrypt_password(config_model.smtp_password)
            msg = EmailMessage()
            msg.set_content(f"This is a test email to verify your SMTP settings for AI Resume Parser.")
            msg["Subject"] = "Test Email Configuration"
            msg["From"] = f"{config_model.sender_name} <{config_model.sender_email}>"
            msg["To"] = email_to

            if config_model.use_ssl:
                server = smtplib.SMTP_SSL(config_model.smtp_server, config_model.smtp_port)
            else:
                server = smtplib.SMTP(config_model.smtp_server, config_model.smtp_port)
                if config_model.use_tls:
                    server.starttls()
            
            server.login(config_model.smtp_username, password)
            server.send_message(msg)
            server.quit()
            
            return {"status": "success", "message": "Test email sent successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
