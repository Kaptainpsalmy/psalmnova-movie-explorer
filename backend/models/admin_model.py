import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection

def create_admin_table(conn):
    conn.execute('''
        CREATE TABLE IF NOT EXISTS admin(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    ''')

def get_admin_by_username(username):
    conn = get_db_connection()
    admin = conn.execute(
        'SELECT * FROM admin WHERE username = ?', (username,)
    ).fetchone()
    conn.close()
    return dict(admin) if admin else None

def verify_admin_password(password_hash, password):
    return check_password_hash(password_hash, password)

def create_admin(username, password):
    conn = get_db_connection()
    password_hash = generate_password_hash(password)
    try:
        conn.execute(
            'INSERT INTO admin (username, password_hash) VALUES (?, ?)',
            (username, password_hash)
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False