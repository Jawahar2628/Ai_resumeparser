from typing import Optional
from app.core.database import get_database
from app.models.settings import EmailConfigModel

class SettingsRepository:
    def __init__(self):
        self.collection = get_database().get_collection("settings")
    
    async def get_email_config(self) -> Optional[EmailConfigModel]:
        # Assuming we store a single document with type="email_config"
        doc = await self.collection.find_one({"type": "email_config"})
        if doc:
            return EmailConfigModel(**doc)
        return None

    async def save_email_config(self, config: EmailConfigModel) -> EmailConfigModel:
        config_dict = config.model_dump()
        config_dict["type"] = "email_config"
        
        await self.collection.update_one(
            {"type": "email_config"},
            {"$set": config_dict},
            upsert=True
        )
        return config
