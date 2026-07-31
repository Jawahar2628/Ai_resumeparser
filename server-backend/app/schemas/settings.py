from pydantic import BaseModel, EmailStr

class EmailConfigBase(BaseModel):
    smtp_server: str
    smtp_port: int
    smtp_username: str
    sender_name: str
    sender_email: EmailStr
    use_tls: bool = True
    use_ssl: bool = False

class EmailConfigCreate(EmailConfigBase):
    smtp_password: str

class EmailConfigResponse(EmailConfigBase):
    smtp_password_set: bool  # Indicates if a password is saved, without returning the actual password
