from mysql.connector import pooling
from mysql.connector.connection import MySQLConnection
from dotenv import load_dotenv
import os

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "database": os.getenv("DB_NAME", "access_management"),
    "pool_name": "access_pool",
    "pool_size": 5,
}

connection_pool = pooling.MySQLConnectionPool(**db_config)


def get_db_connection() -> MySQLConnection:
    return connection_pool.get_connection()


def init_db():
    """Initialize database with schema and seed data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Read and execute schema
    with open("backend/schema.sql", "r") as f:
        schema = f.read()
        for statement in schema.split(";"):
            if statement.strip():
                cursor.execute(statement)
    
    # Read and execute seed data
    with open("backend/seed_data.sql", "r") as f:
        seed = f.read()
        for statement in seed.split(";"):
            if statement.strip():
                cursor.execute(statement)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized successfully!")
