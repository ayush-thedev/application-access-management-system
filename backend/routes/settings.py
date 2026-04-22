from fastapi import APIRouter, HTTPException
from database import get_db_connection
from models import UserResponse

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/profile", response_model=UserResponse)
def get_profile(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        "SELECT id, username, email, department, role, status, created_at FROM users WHERE username = %s",
        (username,)
    )
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)


@router.put("/profile", response_model=UserResponse)
def update_profile(username: str, data: dict):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    existing = cursor.fetchone()
    
    if not existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    updates = []
    params = []
    
    if 'email' in data and data['email']:
        updates.append("email = %s")
        params.append(data['email'])
    
    if 'department' in data:
        updates.append("department = %s")
        params.append(data['department'] if data['department'] else None)
    
    if not updates:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(username)
    query = f"UPDATE users SET {', '.join(updates)} WHERE username = %s"
    cursor.execute(query, params)
    conn.commit()
    
    cursor.execute(
        "SELECT id, username, email, department, role, status, created_at FROM users WHERE username = %s",
        (username,)
    )
    updated_user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return UserResponse(**updated_user)


@router.put("/password")
def change_password(username: str, data: dict):
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new password are required")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        "SELECT id, password_hash FROM users WHERE username = %s",
        (username,)
    )
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    if user['password_hash'] != current_password:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    cursor.execute(
        "UPDATE users SET password_hash = %s WHERE username = %s",
        (new_password, username)
    )
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"message": "Password changed successfully"}
