from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for
from functools import wraps
from models.admin_model import get_admin_by_username, verify_admin_password
from models.recommendation_model import get_all_recommendations, get_recommendation_by_id, delete_recommendation
from models.user_model import get_all_users, count_users
from utils.api_client import get_movie_details
from services.auth_service import AuthService
from services.recommendation_service import RecommendationService

admin_bp = Blueprint("admin_bp", __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not AuthService.is_logged_in():
            return redirect('/admin/login-page')
        return f(*args, **kwargs)
    return decorated_function

# Template Routes
@admin_bp.route("/login-page")
def login_page():
    if AuthService.is_logged_in():
        return redirect('/admin/dashboard-page')
    return render_template('admin/admin_login.html')

@admin_bp.route("/dashboard-page")
@login_required
def dashboard_page():
    return render_template('admin/admin_dashboard.html')

@admin_bp.route("/manage-recommendations-page")
@login_required
def manage_recommendations_page():
    return render_template('admin/manage_recommendations.html')

@admin_bp.route("/add-movie-page")
@login_required
def add_movie_page():
    return render_template('admin/add_movie.html')

@admin_bp.route("/manage-users-page")
@login_required
def manage_users_page():
    return render_template('admin/manage_users.html')

# API Routes
@admin_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password required"}), 400
    
    username = data['username']
    password = data['password']
    
    if AuthService.login_user(username, password):
        return jsonify({
            "message": "Login successful",
            "username": username
        })
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@admin_bp.route("/logout", methods=["POST"])
def logout():
    AuthService.logout_user()
    return jsonify({"message": "Logout successful"})

@admin_bp.route("/dashboard")
@login_required
def dashboard():
    try:
        # Get statistics
        users_count = count_users()
        recommendations = get_all_recommendations()
        recommendations_count = len(recommendations)
        active_recommendations = len([r for r in recommendations if r['is_active']])
        
        return jsonify({
            "stats": {
                "users": users_count,
                "recommendations": recommendations_count,
                "active_recommendations": active_recommendations
            },
            "recent_recommendations": recommendations[:5]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/recommendations")
@login_required
def get_recommendations():
    try:
        recommendations = get_all_recommendations()
        return jsonify({
            "recommendations": recommendations,
            "count": len(recommendations)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/add", methods=["POST"])
@login_required
def add_movie():
    data = request.get_json()
    
    if not data or not data.get('movie_id'):
        return jsonify({"error": "Movie ID is required"}), 400
    
    movie_id = data['movie_id']
    description = data.get('description', '')
    category = data.get('category', 'Featured')
    
    try:
        recommendation_id, message = RecommendationService.add_movie_recommendation(
            movie_id, description, category
        )
        
        if recommendation_id:
            return jsonify({
                "message": message,
                "recommendation_id": recommendation_id
            })
        else:
            return jsonify({"error": message}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/delete/<int:recommendation_id>", methods=["DELETE"])
@login_required
def delete_movie(recommendation_id):
    try:
        success, message = RecommendationService.delete_recommendation(recommendation_id)
        if success:
            return jsonify({"message": message})
        else:
            return jsonify({"error": message}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/users")
@login_required
def get_users():
    try:
        users = get_all_users()
        return jsonify({
            "users": users,
            "count": len(users)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/check-auth")
def check_auth():
    admin = AuthService.get_current_admin()
    if admin:
        return jsonify({
            "authenticated": True,
            "username": admin['username']
        })
    else:
        return jsonify({"authenticated": False})