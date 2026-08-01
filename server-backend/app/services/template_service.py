from typing import List, Optional
from datetime import datetime
from app.repositories.template_repository import TemplateRepository
from app.models.mail_template import MailTemplateModel
from app.schemas.mail_template import MailTemplateCreate, MailTemplateUpdate, MailTemplateResponse

class TemplateService:
    def __init__(self):
        self.repository = TemplateRepository()

    async def initialize_default_templates(self):
        defaults = [
            {
                "name": "Interview Invitation",
                "subject": "Invitation for Interview - {{company_name}}",
                "body": "<p>Dear {{candidate_name}},</p><p>We are pleased to invite you for an interview for the <b>{{job_title}}</b> position.</p><p>Please let us know your availability.</p><p>Best regards,<br/>HR Team</p>",
                "variables": ["candidate_name", "company_name", "job_title"]
            },
            {
                "name": "Rejection Letter",
                "subject": "Update on your application for {{job_title}}",
                "body": "<p>Dear {{candidate_name}},</p><p>Thank you for your interest in the <b>{{job_title}}</b> position. We regret to inform you that we will not be moving forward with your application at this time.</p><p>We wish you the best in your future endeavors.</p><p>Best regards,<br/>HR Team</p>",
                "variables": ["candidate_name", "job_title"]
            },
            {
                "name": "Offer Letter",
                "subject": "Offer of Employment - {{job_title}}",
                "body": "<p>Dear {{candidate_name}},</p><p>We are thrilled to offer you the position of <b>{{job_title}}</b> at {{company_name}}.</p><p>Please find the offer details attached to this email.</p><p>Best regards,<br/>HR Team</p>",
                "variables": ["candidate_name", "company_name", "job_title"]
            }
        ]

        for temp in defaults:
            existing = await self.repository.get_template_by_name(temp["name"])
            if not existing:
                model = MailTemplateModel(**temp)
                await self.repository.create_template(model)

    async def get_all_templates(self) -> List[MailTemplateResponse]:
        templates = await self.repository.get_all_templates()
        return [self._map_to_response(t) for t in templates]

    async def get_template(self, template_id: str) -> Optional[MailTemplateResponse]:
        template = await self.repository.get_template_by_id(template_id)
        if template:
            return self._map_to_response(template)
        return None

    async def create_template(self, data: MailTemplateCreate) -> MailTemplateResponse:
        variables = self._extract_variables(data.body)
        model = MailTemplateModel(
            name=data.name,
            subject=data.subject,
            body=data.body,
            variables=variables
        )
        created = await self.repository.create_template(model)
        return self._map_to_response(created)

    async def update_template(self, template_id: str, data: MailTemplateUpdate) -> Optional[MailTemplateResponse]:
        existing = await self.repository.get_template_by_id(template_id)
        if not existing:
            return None
            
        variables = self._extract_variables(data.body)
        
        existing.name = data.name
        existing.subject = data.subject
        existing.body = data.body
        existing.variables = variables
        existing.updated_at = datetime.utcnow()
        
        updated = await self.repository.update_template(template_id, existing)
        if updated:
            return self._map_to_response(updated)
        return None

    async def delete_template(self, template_id: str) -> bool:
        return await self.repository.delete_template(template_id)

    def _map_to_response(self, model: MailTemplateModel) -> MailTemplateResponse:
        return MailTemplateResponse(
            id=model.id,
            name=model.name,
            subject=model.subject,
            body=model.body,
            variables=model.variables,
            created_at=model.created_at,
            updated_at=model.updated_at
        )

    def _extract_variables(self, body: str) -> List[str]:
        import re
        # Find all {{variable_name}} patterns
        pattern = r'\{\{([^}]+)\}\}'
        matches = re.findall(pattern, body)
        # Return unique variables
        return list(set(matches))
