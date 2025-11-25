from flask import session
from models.admin_model import get_admin_by_username, verify_admin_password

class AuthService:
    @staticmethod
    def login_user(username, password):
        admin = get_admin_by_username(username)
        if admin and verify_admin_password(admin['password_hash'], password):
            session['admin_logged_in'] = True
            session['admin_username'] = username
            session['admin_id'] = admin['id']
            return True
        return False
    
    @staticmethod
    def logout_user():
        session.clear()
    
    @staticmethod
    def is_logged_in():
        return session.get('admin_logged_in', False)
    
    @staticmethod
    def get_current_admin():
        if session.get('admin_logged_in'):
            return {
                'id': session.get('admin_id'),
                'username': session.get('admin_username')
            }
        return None