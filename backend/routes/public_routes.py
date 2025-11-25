from flask import Blueprint, jsonify, request
from utils.api_client import get_trending, search_movie, get_popular_movies, get_top_rated, get_upcoming, get_now_playing
from models.recommendation_model import get_all_recommendations

public_bp = Blueprint("public_bp", __name__)

@public_bp.route("/")
def home():
    return jsonify({
        "message": "Movie Explorer API",
        "version": "1.0",
        "endpoints": {
            "trending": "/trending",
            "search": "/search?query=...",
            "popular": "/popular",
            "top_rated": "/top-rated",
            "upcoming": "/upcoming",
            "now_playing": "/now-playing",
            "recommendations": "/recommendations"
        }
    })


@public_bp.route("/search")
def search():
    query = request.args.get("query", "")
    page = request.args.get("page", 1, type=int)
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    try:
        data = search_movie(query)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# routes/public_routes.py

@public_bp.route("/popular")
def popular():
    try:
        page = request.args.get("page", 1, type=int)  # Add this line
        data = get_popular_movies(page)  # Pass page parameter
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/trending")
def trending():
    try:
        page = request.args.get("page", 1, type=int)  # Add this line
        data = get_trending()  # This might also need updating
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/top-rated")
def top_rated():
    try:
        page = request.args.get("page", 1, type=int)  # Add this line
        data = get_top_rated(page)  # Pass page parameter
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/upcoming")
def upcoming():
    try:
        page = request.args.get("page", 1, type=int)  # Add this line
        data = get_upcoming(page)  # Pass page parameter
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/now-playing")
def now_playing():
    try:
        page = request.args.get("page", 1, type=int)  # Add this line
        data = get_now_playing(page)  # Pass page parameter
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    try:
        page = request.args.get("page", 1, type=int)
        data = get_now_playing(page)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/recommendations")
def get_recommendations():
    try:
        recommendations = get_all_recommendations()
        return jsonify({
            "results": recommendations,
            "count": len(recommendations)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500