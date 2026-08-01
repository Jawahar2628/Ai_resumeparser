from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class MailTemplateModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    subject: str
    body: str
    variables: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
