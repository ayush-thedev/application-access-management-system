from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT id, table_name, action_type, record_id, action_details, created_at
        FROM audit_logs
        ORDER BY created_at DESC
    """)
    logs = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [AuditLogResponse(**log) for log in logs]
