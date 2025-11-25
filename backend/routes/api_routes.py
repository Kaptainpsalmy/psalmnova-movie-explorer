from flask import Blueprint, jsonify, request
from utils.api_client import get_movie_details

api_bp = Blueprint("api_bp", __name__)

@api_bp.route("/movie/<int:movie_id>")
def movie_details(movie_id):
    try:
        data = get_movie_details(movie_id)
        
        # Extract relevant information
        movie_info = {
            "id": data.get("id"),
            "title": data.get("title"),
            "overview": data.get("overview"),
            "poster_path": data.get("poster_path"),
            "backdrop_path": data.get("backdrop_path"),
            "release_date": data.get("release_date"),
            "vote_average": data.get("vote_average"),
            "vote_count": data.get("vote_count"),
            "genres": data.get("genres", []),
            "runtime": data.get("runtime"),
            "budget": data.get("budget"),
            "revenue": data.get("revenue"),
            "status": data.get("status")
        }
        
        # Add credits if available
        if "credits" in data:
            movie_info["cast"] = data["credits"].get("cast", [])[:10]  # Top 10 cast
            movie_info["crew"] = data["credits"].get("crew", [])[:5]   # Top 5 crew
        
        # Add videos if available
        if "videos" in data and "results" in data["videos"]:
            movie_info["videos"] = [
                video for video in data["videos"]["results"] 
                if video["site"] == "YouTube"
            ][:3]  # Top 3 YouTube videos
        
        # Add similar movies if available
        if "similar" in data and "results" in data["similar"]:
            movie_info["similar"] = data["similar"]["results"][:6]  # Top 6 similar movies
        
        return jsonify(movie_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/genres")
def genres():
    # This would typically come from TMDB genres endpoint
    # For now, returning common genres
    common_genres = [
        {"id": 28, "name": "Action"},
        {"id": 12, "name": "Adventure"},
        {"id": 16, "name": "Animation"},
        {"id": 35, "name": "Comedy"},
        {"id": 80, "name": "Crime"},
        {"id": 99, "name": "Documentary"},
        {"id": 18, "name": "Drama"},
        {"id": 10751, "name": "Family"},
        {"id": 14, "name": "Fantasy"},
        {"id": 36, "name": "History"},
        {"id": 27, "name": "Horror"},
        {"id": 10402, "name": "Music"},
        {"id": 9648, "name": "Mystery"},
        {"id": 10749, "name": "Romance"},
        {"id": 878, "name": "Science Fiction"},
        {"id": 10770, "name": "TV Movie"},
        {"id": 53, "name": "Thriller"},
        {"id": 10752, "name": "War"},
        {"id": 37, "name": "Western"}
    ]
    return jsonify({"genres": common_genres})