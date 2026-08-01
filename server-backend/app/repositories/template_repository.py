from typing import List, Optional
from bson import ObjectId
from app.core.database import get_database
from app.models.mail_template import MailTemplateModel

class TemplateRepository:
    def __init__(self):
        self.collection = get_database().get_collection("mail_templates")
        
    async def get_all_templates(self) -> List[MailTemplateModel]:
        cursor = self.collection.find({})
        templates = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            templates.append(MailTemplateModel(**doc))
        return templates
        
    async def get_template_by_id(self, template_id: str) -> Optional[MailTemplateModel]:
        if not ObjectId.is_valid(template_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(template_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            return MailTemplateModel(**doc)
        return None
        
    async def create_template(self, template: MailTemplateModel) -> MailTemplateModel:
        template_dict = template.model_dump(exclude={"id"})
        result = await self.collection.insert_one(template_dict)
        template.id = str(result.inserted_id)
        return template
        
    async def update_template(self, template_id: str, template: MailTemplateModel) -> Optional[MailTemplateModel]:
        if not ObjectId.is_valid(template_id):
            return None
        template_dict = template.model_dump(exclude={"id", "created_at"})
        result = await self.collection.update_one(
            {"_id": ObjectId(template_id)},
            {"$set": template_dict}
        )
        if result.modified_count > 0:
            return await self.get_template_by_id(template_id)
        return None
        
    async def delete_template(self, template_id: str) -> bool:
        if not ObjectId.is_valid(template_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(template_id)})
        return result.deleted_count > 0

    async def get_template_by_name(self, name: str) -> Optional[MailTemplateModel]:
        doc = await self.collection.find_one({"name": name})
        if doc:
            doc["_id"] = str(doc["_id"])
            return MailTemplateModel(**doc)
        return None
