from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import ApplicationResponse, ApplicationCreate, ApplicationUpdate, RoleResponse, RoleWithApp, UserRoleResponse

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


@router.get("/all", response_model=List[ApplicationResponse])
def get_all_applications():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id, name, description, status, created_at FROM applications ORDER BY name")
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


@router.post("", response_model=ApplicationResponse)
def create_application(app: ApplicationCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        INSERT INTO applications (name, description, status)
        VALUES (%s, %s, 'active')
    """, (app.name, app.description))
    
    conn.commit()
    app_id = cursor.lastrowid
    
    # Insert default roles for the new application
    default_roles = [
        (f"{app.name} Viewer", app_id, f"Read-only access to {app.name}"),
        (f"{app.name} Editor", app_id, f"Edit and manage resources in {app.name}"),
        (f"{app.name} Admin", app_id, f"Full administrative access to {app.name}"),
    ]
    cursor.executemany(
        "INSERT INTO roles (name, app_id, description) VALUES (%s, %s, %s)",
        default_roles
    )
    conn.commit()
    
    cursor.execute("SELECT id, name, description, status, created_at FROM applications WHERE id = %s", (app_id,))
    new_app = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return ApplicationResponse(**new_app)


@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: int, app: ApplicationUpdate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM applications WHERE id = %s", (app_id,))
    existing = cursor.fetchone()
    
    if not existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    updates = []
    params = []
    
    if app.name is not None:
        updates.append("name = %s")
        params.append(app.name)
    
    if app.description is not None:
        updates.append("description = %s")
        params.append(app.description)
    
    if not updates:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(app_id)
    query = f"UPDATE applications SET {', '.join(updates)} WHERE id = %s"
    cursor.execute(query, params)
    
    conn.commit()
    
    cursor.execute("SELECT id, name, description, status, created_at FROM applications WHERE id = %s", (app_id,))
    updated_app = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return ApplicationResponse(**updated_app)


@router.delete("/{app_id}")
def delete_application(app_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id, name FROM applications WHERE id = %s", (app_id,))
    existing = cursor.fetchone()
    
    if not existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Perform Hard Delete - cascades will handle roles, requests, and triggers will handle audit
    cursor.execute("DELETE FROM applications WHERE id = %s", (app_id,))
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"message": f"Application '{existing['name']}' and all associated roles have been completely removed"}
