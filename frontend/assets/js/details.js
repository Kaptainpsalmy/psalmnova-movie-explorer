// assets/js/details.js - Only for details page

// DOM Elements for details page
const movieDetails = document.getElementById('movieDetails');
const castContainer = document.getElementById('castContainer');
const similarMovies = document.getElementById('similarMovies');

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        document.addEventListener('click', function(event) {
            if (!mobileNav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// Initialize details page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Details page loaded');
    initMobileMenu();
    
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    if (movieId) {
        loadMovieDetails(movieId);
    } else {
        showError('Movie ID not provided');
    }
});

// Load movie details
async function loadMovieDetails(movieId) {
    try {
        showSkeletonDetails();
        
        console.log('Loading movie details for ID:', movieId);
        const response = await fetch(`${API_BASE_URL}/api/movie/${movieId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Movie details response:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        renderMovieDetails(data);
        
        // Load cast if available
        if (data.cast && data.cast.length > 0) {
            renderCast(data.cast);
        } else {
            document.querySelector('.cast-section').style.display = 'none';
        }
        
        // Load similar movies if available
        if (data.similar && data.similar.length > 0) {
            renderSimilarMovies(data.similar);
        } else {
            document.querySelector('.similar-section').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        showError(`Failed to load movie details: ${error.message}`);
    }
}

// Render movie details
function renderMovieDetails(movie) {
    const posterUrl = getImageUrl(movie.poster_path);
    const backdropUrl = getImageUrl(movie.backdrop_path, TMDB_BACKDROP_SIZE);
    
    const year = getMovieYear(movie.release_date);
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
    const rating = formatRating(movie.vote_average);
    
    // Set background image if available
    if (backdropUrl && backdropUrl !== 'assets/images/placeholder.jpg') {
        document.body.style.backgroundImage = `linear-gradient(rgba(15, 15, 35, 0.9), rgba(15, 15, 35, 0.9)), url('${backdropUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
    }
    
    movieDetails.innerHTML = `
        <div class="movie-details">
            <img src="${posterUrl}" 
                 alt="${movie.title}" 
                 class="detail-poster"
                 onerror="this.src='assets/images/placeholder.jpg'">
            <div class="detail-info">
                <h1>${movie.title}</h1>
                <div class="detail-meta">
                    <span>⭐ ${rating}/10</span>
                    <span>📅 ${year}</span>
                    <span>⏱️ ${runtime}</span>
                    <span>${movie.status || 'N/A'}</span>
                </div>
                
                ${movie.genres && movie.genres.length > 0 ? `
                    <div class="genre-tags">
                        ${movie.genres.map(genre => `
                            <span class="genre-tag">${genre.name}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <p class="detail-overview">${movie.overview || 'No overview available.'}</p>
                
                ${movie.budget ? `<p><strong>Budget:</strong> $${movie.budget.toLocaleString()}</p>` : ''}
                ${movie.revenue ? `<p><strong>Revenue:</strong> $${movie.revenue.toLocaleString()}</p>` : ''}
                
                ${movie.videos && movie.videos.length > 0 ? `
                    <div class="trailer-section">
                        <h3>Trailer</h3>
                        <div class="trailer-container">
                            <iframe width="100%" height="400" 
                                    src="https://www.youtube.com/embed/${movie.videos[0].key}" 
                                    frameborder="0" 
                                    allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render cast
function renderCast(cast) {
    const topCast = cast.slice(0, 12);
    
    castContainer.innerHTML = topCast.map(person => `
        <div class="cast-member">
            <img src="${getImageUrl(person.profile_path, TMDB_PROFILE_SIZE)}" 
                 alt="${person.name}" 
                 class="cast-photo"
                 onerror="this.src='assets/images/placeholder.jpg'">
            <h4 class="cast-name">${person.name}</h4>
            <p class="cast-character">${person.character}</p>
        </div>
    `).join('');
}

// Render similar movies
function renderSimilarMovies(similar) {
    const topSimilar = similar.slice(0, 8);
    
    similarMovies.innerHTML = topSimilar.map(movie => createMovieCard(movie)).join('');
}

// Create movie card (reused from main.js)
function createMovieCard(movie) {
    const posterUrl = getImageUrl(movie.poster_path);
    const year = getMovieYear(movie.release_date);
    const rating = formatRating(movie.vote_average);
    
    return `
        <div class="movie-card" onclick="viewMovieDetails(${movie.id})">
            <img src="${posterUrl}" 
                 alt="${movie.title}" 
                 class="movie-poster"
                 loading="lazy"
                 onerror="this.src='assets/images/placeholder.jpg'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${year}</span>
                    <span class="rating">⭐ ${rating}</span>
                </div>
                <p class="movie-overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available.'}</p>
            </div>
        </div>
    `;
}

// Show skeleton loading for details
function showSkeletonDetails() {
    movieDetails.innerHTML = `
        <div class="movie-details">
            <div class="skeleton skeleton-poster" style="height: 600px;"></div>
            <div class="detail-info">
                <div class="skeleton skeleton-title" style="height: 40px; margin-bottom: 1rem;"></div>
                <div class="skeleton skeleton-text" style="height: 20px; width: 60%; margin-bottom: 2rem;"></div>
                <div class="skeleton skeleton-text" style="height: 120px; margin-bottom: 2rem;"></div>
                <div class="skeleton skeleton-text" style="height: 20px; width: 40%;"></div>
            </div>
        </div>
    `;
    
    castContainer.innerHTML = Array(12).fill(`
        <div class="cast-member">
            <div class="skeleton skeleton-poster" style="height: 200px;"></div>
            <div class="skeleton skeleton-text" style="height: 20px; margin-top: 1rem;"></div>
            <div class="skeleton skeleton-text short" style="height: 16px; margin-top: 0.5rem;"></div>
        </div>
    `).join('');
    
    similarMovies.innerHTML = Array(8).fill(`
        <div class="movie-card">
            <div class="skeleton skeleton-poster"></div>
            <div class="movie-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `).join('');
}

// Show error message
function showError(message) {
    movieDetails.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle fa-2x" style="margin-bottom: 1rem; color: #e74c3c;"></i>
            <h2>Failed to load movie details</h2>
            <p style="margin-bottom: 1.5rem;">${message}</p>
            <button class="btn btn-primary" onclick="window.history.back()">Go Back</button>
        </div>
    `;
}

// Navigation function
function viewMovieDetails(movieId) {
    window.location.href = `details.html?id=${movieId}`;
}

// Make functions globally available
window.viewMovieDetails = viewMovieDetails;