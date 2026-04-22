from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import UserListResponse, UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserListResponse])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT u.id, u.username, u.email, u.department, u.role, u.status, u.created_at,
               COUNT(ur.id) as access_count
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        WHERE u.role != 'admin'
        GROUP BY u.id, u.username, u.email, u.department, u.role, u.status, u.created_at
        ORDER BY u.username
    """)
    users = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [UserListResponse(**user) for user in users]


@router.post("", response_model=UserResponse)
def create_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if username or email already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")
            
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, department, role, status)
            VALUES (%s, %s, %s, %s, 'user', 'active')
        """, (user.username, user.email, user.password, user.department))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        cursor.execute("SELECT id, username, email, department, role, status, created_at FROM users WHERE id = %s", (user_id,))
        new_user = cursor.fetchone()
        
        return UserResponse(**new_user)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
