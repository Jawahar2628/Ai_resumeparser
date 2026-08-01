from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class MailTemplateBase(BaseModel):
    name: str
    subject: str
    body: str

class MailTemplateCreate(MailTemplateBase):
    pass

class MailTemplateUpdate(MailTemplateBase):
    pass

class MailTemplateResponse(MailTemplateBase):
    id: str
    variables: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
