import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import get_db_connection

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DESCRIBE users")
    columns = [row[0] for row in cursor.fetchall()]
    print(f"Columns in 'users' table: {columns}")
    
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    print(f"Total users: {count}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
