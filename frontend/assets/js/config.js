// Backend API configuration - Auto-detect environment
const getApiBaseUrl = () => {
    // If we're running on localhost (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000'; // Local Flask backend
    }
    // If we're running on a deployed frontend
    else {
        // Return your actual deployed backend URL
        return 'https://psalmnova-movie-explorer.onrender.com/'; // Replace with your actual backend URL
    }
};

const API_BASE_URL = getApiBaseUrl();

// TMDB image base URLs
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image sizes
const TMDB_POSTER_SIZE = 'w500';
const TMDB_BACKDROP_SIZE = 'w1280';
const TMDB_PROFILE_SIZE = 'w185';

// config.js - UPDATE THESE ENDPOINTS
const API_ENDPOINTS = {
    TRENDING: '/trending',
    POPULAR: '/popular',
    TOP_RATED: '/top-rated',
    UPCOMING: '/upcoming',
    NOW_PLAYING: '/now-playing',
    SEARCH: '/search',
    MOVIE_DETAILS: '/api/movie',
    RECOMMENDATIONS: '/recommendations'
};

// Update category config to match your backend
const CATEGORY_CONFIG = {
    popular: {
        title: 'Popular Movies',
        description: 'Discover the most popular and talked-about movies right now',
        endpoint: '/popular', // This should work with your backend
        icon: 'fire'
    },
    trending: {
        title: 'Trending Now',
        description: 'Movies that are trending this week and gaining popularity',
        endpoint: '/trending',
        icon: 'chart-line'
    },
    top_rated: {
        title: 'Top Rated Movies',
        description: 'The highest rated movies of all time according to viewers',
        endpoint: '/top-rated',
        icon: 'star'
    },
    upcoming: {
        title: 'Upcoming Movies',
        description: 'Exciting new movies coming soon to theaters near you',
        endpoint: '/upcoming',
        icon: 'calendar-alt'
    },
    now_playing: {
        title: 'Now Playing',
        description: 'Movies currently showing in theaters worldwide',
        endpoint: '/now-playing',
        icon: 'play-circle'
    }
};
// App configuration
const APP_CONFIG = {
    // API Settings
    API_BASE_URL: API_BASE_URL,
    API_ENDPOINTS: API_ENDPOINTS,
    
    // TMDB Settings
    TMDB_IMAGE_BASE: TMDB_IMAGE_BASE,
    TMDB_POSTER_SIZE: TMDB_POSTER_SIZE,
    TMDB_BACKDROP_SIZE: TMDB_BACKDROP_SIZE,
    TMDB_PROFILE_SIZE: TMDB_PROFILE_SIZE,
    
    // App Settings
    CATEGORY_CONFIG: CATEGORY_CONFIG,
    ITEMS_PER_PAGE: 20,
    INFINITE_SCROLL_THRESHOLD: 500,
    
    // Feature Flags
    FEATURES: {
        INFINITE_SCROLL: true,
        LAZY_LOADING: true,
        OFFLINE_SUPPORT: false,
        FAVORITES: true
    }
};

// Export configuration to global scope
window.APP_CONFIG = APP_CONFIG;

// Utility functions
window.getImageUrl = function(path, size = TMDB_POSTER_SIZE) {
    if (!path) return 'assets/images/placeholder.jpg';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

window.getMovieYear = function(releaseDate) {
    if (!releaseDate) return 'N/A';
    return new Date(releaseDate).getFullYear();
};

window.formatRating = function(rating) {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
};

// Enhanced API fetch function with better error handling
window.apiFetch = async function(endpoint, options = {}) {
    const url = `${APP_CONFIG.API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};

// Debug helper
console.log('App Configuration:', APP_CONFIG);
console.log('Current Environment:', window.location.hostname);
console.log('API Base URL:', API_BASE_URL);