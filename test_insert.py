import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import get_db_connection

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    username = 'testuser'
    email = 'test@example.com'
    password = 'password123'
    dept = 'IT'
    
    print(f"Attempting to insert user: {username}")
    cursor.execute("""
        INSERT INTO users (username, email, password_hash, department, role, status)
        VALUES (%s, %s, %s, %s, 'user', 'active')
    """, (username, email, password, dept))
    
    conn.commit()
    print("Insert successful, commit successful.")
    
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    print(f"Verified user in DB: {user}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error during insertion: {e}")
