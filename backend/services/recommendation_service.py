from models.recommendation_model import (
    get_all_recommendations, 
    get_recommendation_by_id, 
    create_recommendation, 
    delete_recommendation
)
from utils.api_client import get_movie_details

class RecommendationService:
    @staticmethod
    def add_movie_recommendation(movie_id, description=None, category="Featured"):
        try:
            # Get movie details from TMDB
            movie_data = get_movie_details(movie_id)
            
            if 'error' in movie_data:
                return None, "Movie not found in TMDB"
            
            # Create recommendation entry
            recommendation_id = create_recommendation(
                movie_id=movie_id,
                movie_title=movie_data.get('title', 'Unknown Title'),
                description=description or movie_data.get('overview', ''),
                image_url=f"https://image.tmdb.org/t/p/w500{movie_data.get('poster_path', '')}",
                category=category
            )
            
            if recommendation_id:
                return recommendation_id, "Recommendation added successfully"
            else:
                return None, "Movie already exists in recommendations"
                
        except Exception as e:
            return None, f"Error adding recommendation: {str(e)}"
    
    @staticmethod
    def get_all_recommendations():
        return get_all_recommendations()
    
    @staticmethod
    def delete_recommendation(recommendation_id):
        try:
            recommendation = get_recommendation_by_id(recommendation_id)
            if not recommendation:
                return False, "Recommendation not found"
            
            delete_recommendation(recommendation_id)
            return True, "Recommendation deleted successfully"
        except Exception as e:
            return False, f"Error deleting recommendation: {str(e)}"