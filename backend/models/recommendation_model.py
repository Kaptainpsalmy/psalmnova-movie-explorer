import sqlite3
from database import get_db_connection

def create_recommendation_table(conn):
    conn.execute('''
        CREATE TABLE IF NOT EXISTS recommendations(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL UNIQUE,
            movie_title TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            category TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

def get_all_recommendations():
    conn = get_db_connection()
    recommendations = conn.execute(
        'SELECT * FROM recommendations WHERE is_active = 1 ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    return [dict(rec) for rec in recommendations]

def get_recommendation_by_id(recommendation_id):
    conn = get_db_connection()
    recommendation = conn.execute(
        'SELECT * FROM recommendations WHERE id = ?', (recommendation_id,)
    ).fetchone()
    conn.close()
    return dict(recommendation) if recommendation else None

def create_recommendation(movie_id, movie_title, description, image_url, category):
    conn = get_db_connection()
    try:
        cursor = conn.execute('''
            INSERT INTO recommendations (movie_id, movie_title, description, image_url, category)
            VALUES (?, ?, ?, ?, ?)
        ''', (movie_id, movie_title, description, image_url, category))
        conn.commit()
        recommendation_id = cursor.lastrowid
        conn.close()
        return recommendation_id
    except sqlite3.IntegrityError:
        conn.close()
        return None

def delete_recommendation(recommendation_id):
    conn = get_db_connection()
    conn.execute(
        'DELETE FROM recommendations WHERE id = ?', (recommendation_id,)
    )
    conn.commit()
    conn.close()
    return True