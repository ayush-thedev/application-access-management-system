from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import RequestResponse, RequestCreate, RequestWithDetails
from datetime import datetime, timedelta

router = APIRouter(prefix="/requests", tags=["requests"])


@router.get("", response_model=List[RequestWithDetails])
def get_requests(username: str = None, status: str = None, user_id: int = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT ar.id, ar.user_id, ar.role_id, ar.justification, ar.priority,
               ar.status, ar.request_type, ar.denial_reason, ar.request_date,
               ar.approval_date, ar.approved_by, ar.expires_at, ar.created_at,
               u.username, u.email as user_email, r.name as role_name,
               a.name as app_name, ap.username as approved_by_name
        FROM access_requests ar
        JOIN users u ON ar.user_id = u.id
        JOIN roles r ON ar.role_id = r.id
        JOIN applications a ON r.app_id = a.id
        LEFT JOIN users ap ON ar.approved_by = ap.id
        WHERE 1=1
    """
    params = []
    
    if username:
        query += " AND u.username = %s"
        params.append(username)
    
    if status:
        query += " AND ar.status = %s"
        params.append(status)
    
    if user_id:
        query += " AND ar.user_id = %s"
        params.append(user_id)
    
    query += " ORDER BY ar.request_date DESC"
    
    cursor.execute(query, params)
    requests = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [RequestWithDetails(**req) for req in requests]


@router.get("/pending", response_model=List[RequestWithDetails])
def get_pending_requests():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT ar.id, ar.user_id, ar.role_id, ar.justification, ar.priority,
               ar.status, ar.request_type, ar.denial_reason, ar.request_date,
               ar.approval_date, ar.approved_by, ar.expires_at, ar.created_at,
               u.username, u.email as user_email, r.name as role_name,
               a.name as app_name, ap.username as approved_by_name
        FROM access_requests ar
        JOIN users u ON ar.user_id = u.id
        JOIN roles r ON ar.role_id = r.id
        JOIN applications a ON r.app_id = a.id
        LEFT JOIN users ap ON ar.approved_by = ap.id
        WHERE ar.status = 'pending'
        ORDER BY 
            CASE ar.priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
            END,
            ar.request_date ASC
    """)
    requests = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [RequestWithDetails(**req) for req in requests]


@router.post("", response_model=RequestResponse)
def create_request(request: RequestCreate, username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        INSERT INTO access_requests (user_id, role_id, justification, priority, request_type)
        VALUES (%s, %s, %s, %s, %s)
    """, (user['id'], request.role_id, request.justification, request.priority, request.request_type))
    
    conn.commit()
    request_id = cursor.lastrowid
    
    cursor.execute("SELECT * FROM access_requests WHERE id = %s", (request_id,))
    new_request = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return RequestResponse(**new_request)


@router.patch("/{request_id}/approve", response_model=RequestResponse)
def approve_request(request_id: int, admin_username: str, expires_at: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s AND role = 'admin'", (admin_username,))
    admin = cursor.fetchone()
    
    if not admin:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=403, detail="Only admins can approve requests")
    
    cursor.execute("SELECT * FROM access_requests WHERE id = %s", (request_id,))
    request = cursor.fetchone()
    
    if not request:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request['status'] != 'pending':
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail=f"Request is already {request['status']}")
    
    expiry = expires_at or (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
    
    cursor.execute("""
        UPDATE access_requests 
        SET status = 'approved', approval_date = NOW(), approved_by = %s, expires_at = %s
        WHERE id = %s
    """, (admin['id'], expiry, request_id))
    
    cursor.execute("""
        INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at, expires_at)
        VALUES (%s, %s, NOW(), %s)
    """, (request['user_id'], request['role_id'], expiry))
    
    conn.commit()
    
    cursor.execute("SELECT * FROM access_requests WHERE id = %s", (request_id,))
    updated_request = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return RequestResponse(**updated_request)


@router.patch("/{request_id}/reject", response_model=RequestResponse)
def reject_request(request_id: int, admin_username: str, denial_reason: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s AND role = 'admin'", (admin_username,))
    admin = cursor.fetchone()
    
    if not admin:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=403, detail="Only admins can reject requests")
    
    cursor.execute("SELECT * FROM access_requests WHERE id = %s", (request_id,))
    request = cursor.fetchone()
    
    if not request:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request['status'] != 'pending':
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail=f"Request is already {request['status']}")
    
    cursor.execute("""
        UPDATE access_requests 
        SET status = 'rejected', approval_date = NOW(), approved_by = %s, denial_reason = %s
        WHERE id = %s
    """, (admin['id'], denial_reason, request_id))
    
    conn.commit()
    
    cursor.execute("SELECT * FROM access_requests WHERE id = %s", (request_id,))
    updated_request = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return RequestResponse(**updated_request)
