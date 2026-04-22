from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import RoleResponse, RoleWithApp

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=List[RoleWithApp])
def get_roles(app_id: int = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if app_id:
        cursor.execute("""
            SELECT r.id, r.name, r.app_id, r.description, r.created_at, a.name as app_name
            FROM roles r
            JOIN applications a ON r.app_id = a.id
            WHERE r.app_id = %s
            ORDER BY a.name, r.name
        """, (app_id,))
    else:
        cursor.execute("""
            SELECT r.id, r.name, r.app_id, r.description, r.created_at, a.name as app_name
            FROM roles r
            JOIN applications a ON r.app_id = a.id
            ORDER BY a.name, r.name
        """)
    
    roles = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return [RoleWithApp(**role) for role in roles]


@router.post("", response_model=RoleResponse)
def create_role(data: dict):
    name = data.get('name')
    app_id = data.get('app_id')
    description = data.get('description', '')
    
    if not name or not app_id:
        raise HTTPException(status_code=400, detail="Name and app_id are required")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM applications WHERE id = %s", (app_id,))
    app = cursor.fetchone()
    
    if not app:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Application not found")
    
    cursor.execute("""
        INSERT INTO roles (name, app_id, description)
        VALUES (%s, %s, %s)
    """, (name, app_id, description))
    
    conn.commit()
    role_id = cursor.lastrowid
    
    cursor.execute("SELECT id, name, app_id, description, created_at FROM roles WHERE id = %s", (role_id,))
    new_role = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return RoleResponse(**new_role)


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, data: dict):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM roles WHERE id = %s", (role_id,))
    existing = cursor.fetchone()
    
    if not existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Role not found")
    
    updates = []
    params = []
    
    if 'name' in data and data['name']:
        updates.append("name = %s")
        params.append(data['name'])
    
    if 'description' in data:
        updates.append("description = %s")
        params.append(data['description'])
    
    if 'app_id' in data and data['app_id']:
        updates.append("app_id = %s")
        params.append(data['app_id'])
    
    if not updates:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(role_id)
    query = f"UPDATE roles SET {', '.join(updates)} WHERE id = %s"
    cursor.execute(query, params)
    conn.commit()
    
    cursor.execute("SELECT id, name, app_id, description, created_at FROM roles WHERE id = %s", (role_id,))
    updated_role = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return RoleResponse(**updated_role)


@router.delete("/{role_id}")
def delete_role(role_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM roles WHERE id = %s", (role_id,))
    existing = cursor.fetchone()
    
    if not existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Role not found")
    
    cursor.execute("DELETE FROM roles WHERE id = %s", (role_id,))
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"message": "Role deleted successfully"}
