from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import UserRoleResponse

router = APIRouter(prefix="/user-roles", tags=["user-roles"])


@router.get("", response_model=List[UserRoleResponse])
def get_all_user_roles():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT ur.id, ur.user_id, ur.role_id, ur.assigned_at, ur.expires_at,
               r.name as role_name, a.name as app_name, u.username as user_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN applications a ON r.app_id = a.id
        JOIN users u ON ur.user_id = u.id
        ORDER BY ur.assigned_at DESC
    """)
    roles = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [UserRoleResponse(**role) for role in roles]


@router.get("/user/{user_id}", response_model=List[UserRoleResponse])
def get_user_roles(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT ur.id, ur.user_id, ur.role_id, ur.assigned_at, ur.expires_at,
               r.name as role_name, a.name as app_name, u.username as user_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN applications a ON r.app_id = a.id
        JOIN users u ON ur.user_id = u.id
        WHERE ur.user_id = %s
        ORDER BY ur.assigned_at DESC
    """, (user_id,))
    roles = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [UserRoleResponse(**role) for role in roles]


@router.get("/current-user/{username}", response_model=List[UserRoleResponse])
def get_current_user_roles(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        SELECT ur.id, ur.user_id, ur.role_id, ur.assigned_at, ur.expires_at,
               r.name as role_name, a.name as app_name, u.username as user_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN applications a ON r.app_id = a.id
        JOIN users u ON ur.user_id = u.id
        WHERE ur.user_id = %s
        ORDER BY ur.assigned_at DESC
    """, (user['id'],))
    roles = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [UserRoleResponse(**role) for role in roles]
