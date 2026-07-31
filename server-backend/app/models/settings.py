from typing import Optional
from pydantic import BaseModel, EmailStr

class EmailConfigModel(BaseModel):
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str  # Will store encrypted password
    sender_name: str
    sender_email: EmailStr
    use_tls: bool = True
    use_ssl: bool = False
