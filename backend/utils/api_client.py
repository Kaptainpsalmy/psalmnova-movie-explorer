import os
import requests
from flask import current_app

TMDB_BASE_URL = "https://api.themoviedb.org/3"

class TMDBClient:
    def __init__(self):
        self.api_key = current_app.config['TMDB_API_KEY']
        self.base_url = TMDB_BASE_URL
    
    def _make_request(self, endpoint, params=None):
        if params is None:
            params = {}
        
        params['api_key'] = self.api_key
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"TMDB API Error: {e}")
            return {"error": str(e)}
    
    def get_trending(self, media_type="movie", time_window="week"):
        endpoint = f"trending/{media_type}/{time_window}"
        return self._make_request(endpoint)
    
    def search_movie(self, query, page=1):
        endpoint = "search/movie"
        params = {
            'query': query,
            'page': page,
            'include_adult': False
        }
        return self._make_request(endpoint, params)
    
    def get_movie_details(self, movie_id):
        endpoint = f"movie/{movie_id}"
        params = {
            'append_to_response': 'credits,videos,similar'
        }
        return self._make_request(endpoint, params)
    
    def get_popular_movies(self, page=1):
        endpoint = "movie/popular"
        params = {'page': page}
        return self._make_request(endpoint, params)
    
    def get_top_rated(self, page=1):
        endpoint = "movie/top_rated"
        params = {'page': page}
        return self._make_request(endpoint, params)
    
    def get_upcoming(self, page=1):
        endpoint = "movie/upcoming"
        params = {'page': page}
        return self._make_request(endpoint, params)
    
    def get_now_playing(self, page=1):
        endpoint = "movie/now_playing"
        params = {'page': page}
        return self._make_request(endpoint, params)

# ===== FIXED HELPER FUNCTIONS =====
# These now accept page parameters to match the routes

def get_trending():
    client = TMDBClient()
    return client.get_trending()

def search_movie(query, page=1):
    client = TMDBClient()
    return client.search_movie(query, page)

def get_movie_details(movie_id):
    client = TMDBClient()
    return client.get_movie_details(movie_id)

def get_popular_movies(page=1):
    client = TMDBClient()
    return client.get_popular_movies(page)

def get_top_rated(page=1):
    client = TMDBClient()
    return client.get_top_rated(page)

def get_upcoming(page=1):
    client = TMDBClient()
    return client.get_upcoming(page)

def get_now_playing(page=1):
    client = TMDBClient()
    return client.get_now_playing(page)