from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import (
    UserResponse, UserLogin, LoginResponse,
    ApplicationResponse, RoleResponse, RoleWithApp,
    UserRoleResponse, RequestResponse, RequestCreate,
    RequestWithDetails, RequestUpdate
)
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        "SELECT id, username, email, department, role, status, created_at FROM users WHERE username = %s",
        (user.username,)
    )
    db_user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_data = UserResponse(**db_user)
    
    if user_data.status != "active":
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    role_text = "Administrator" if user_data.role == "admin" else "User"
    return LoginResponse(
        user=user_data,
        message=f"Welcome {user_data.username}! Logged in as {role_text}."
    )
