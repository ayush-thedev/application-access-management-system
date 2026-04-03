from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import ApplicationResponse, RoleResponse, RoleWithApp, UserRoleResponse

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=List[ApplicationResponse])
def get_applications():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id, name, description, status, created_at FROM applications WHERE status = 'active' ORDER BY name")
    apps = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [ApplicationResponse(**app) for app in apps]


@router.get("/{app_id}/roles", response_model=List[RoleWithApp])
def get_app_roles(app_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT r.id, r.name, r.app_id, r.description, r.created_at, a.name as app_name
        FROM roles r
        JOIN applications a ON r.app_id = a.id
        WHERE r.app_id = %s
        ORDER BY r.name
    """, (app_id,))
    roles = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    if not roles:
        raise HTTPException(status_code=404, detail="No roles found for this application")
    
    return [RoleWithApp(**role) for role in roles]


@router.get("/{app_id}")
def get_application(app_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id, name, description, status, created_at FROM applications WHERE id = %s", (app_id,))
    app = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return ApplicationResponse(**app)
