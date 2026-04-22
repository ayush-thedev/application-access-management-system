from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    username: str
    email: str
    department: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class UserListResponse(BaseModel):
    id: int
    username: str
    email: str
    department: Optional[str] = None
    role: str
    status: str
    created_at: datetime
    access_count: int = 0

    class Config:
        from_attributes = True


# Application schemas
class ApplicationBase(BaseModel):
    name: str
    description: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


# Role schemas
class RoleBase(BaseModel):
    name: str
    app_id: int
    description: Optional[str] = None


class RoleResponse(RoleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RoleWithApp(RoleResponse):
    app_name: Optional[str] = None


# User_Roles schemas
class UserRoleBase(BaseModel):
    user_id: int
    role_id: int
    expires_at: Optional[datetime] = None


class UserRoleResponse(UserRoleBase):
    id: int
    assigned_at: datetime
    role_name: Optional[str] = None
    app_name: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


# Access_Request schemas
class RequestBase(BaseModel):
    role_id: int
    justification: str = ""
    priority: str = "medium"


class RequestCreate(RequestBase):
    request_type: str = "new"


class RequestUpdate(BaseModel):
    status: Optional[str] = None
    denial_reason: Optional[str] = None
    expires_at: Optional[datetime] = None


class RequestResponse(RequestBase):
    id: int
    user_id: int
    status: str
    request_type: str
    denial_reason: Optional[str]
    request_date: datetime
    approval_date: Optional[datetime]
    approved_by: Optional[int]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class RequestWithDetails(RequestResponse):
    username: Optional[str] = None
    user_email: Optional[str] = None
    role_name: Optional[str] = None
    app_name: Optional[str] = None
    approved_by_name: Optional[str] = None


# Auth schemas
class LoginResponse(BaseModel):
    user: UserResponse
    message: str


# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    is_read: bool
    request_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
