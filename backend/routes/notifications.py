from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db_connection
from models import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


def create_notification(user_id: int, type: str, title: str, message: str, request_id: int = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO notifications (user_id, type, title, message, request_id) VALUES (%s, %s, %s, %s, %s)",
        (user_id, type, title, message, request_id)
    )
    conn.commit()
    cursor.close()
    conn.close()


def notify_all_admins(type: str, title: str, message: str, request_id: int = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE role = 'admin' AND status = 'active'")
    admins = cursor.fetchall()
    cursor.close()
    conn.close()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    for admin in admins:
        cursor.execute(
            "INSERT INTO notifications (user_id, type, title, message, request_id) VALUES (%s, %s, %s, %s, %s)",
            (admin['id'], type, title, message, request_id)
        )
    conn.commit()
    cursor.close()
    conn.close()


@router.get("", response_model=List[NotificationResponse])
def get_notifications(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("""
        SELECT id, user_id, type, title, message, is_read, request_id, created_at
        FROM notifications
        WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC
    """, (user['id'],))
    notifications = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [NotificationResponse(**n) for n in notifications]


@router.get("/unread-count")
def get_unread_count(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        return {"count": 0}
    
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = %s AND is_read = FALSE AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    """, (user['id'],))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return {"count": result['count'] if result else 0}


@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s",
        (notification_id, user['id'])
    )
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"message": "Notification marked as read"}


@router.patch("/read-all")
def mark_all_as_read(username: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = %s AND is_read = FALSE",
        (user['id'],)
    )
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"message": "All notifications marked as read"}
