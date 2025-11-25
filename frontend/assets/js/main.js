// Main JavaScript for index.html

// DOM Elements
const featuredCarousel = document.getElementById('carouselContainer');
const carouselDots = document.getElementById('carouselDots');
const trendingMovies = document.getElementById('trendingMovies');
const popularMovies = document.getElementById('popularMovies');

// Carousel state
let currentSlide = 0;
let carouselItems = [];
let autoPlayInterval;

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            // Toggle between hamburger and close icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Close mobile menu when clicking outside
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

// Load featured movies for carousel
async function loadFeaturedMovies() {
    try {
        showSkeletonLoading(featuredCarousel, 5, 'carousel');
        
        const response = await fetch(`${API_BASE_URL}/trending`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            carouselItems = data.results.slice(0, 5);
            renderCarousel();
            createCarouselDots();
        }
    } catch (error) {
        console.error('Error loading featured movies:', error);
        featuredCarousel.innerHTML = '<p class="error-message">Failed to load featured movies</p>';
    }
}

// Render carousel items
function renderCarousel() {
    featuredCarousel.innerHTML = carouselItems.map((movie, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${TMDB_IMAGE_BASE}/${TMDB_BACKDROP_SIZE}${movie.backdrop_path}" 
                 alt="${movie.title}" 
                 onerror="this.src='assets/images/placeholder.jpg'">
            <div class="carousel-content">
                <h3>${movie.title}</h3>
                <p>${movie.overview.substring(0, 150)}...</p>
                <button class="btn btn-primary" onclick="viewMovieDetails(${movie.id})">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
    
    updateCarouselPosition();
}

// Create carousel dots
function createCarouselDots() {
    carouselDots.innerHTML = carouselItems.map((_, index) => `
        <div class="carousel-dot ${index === 0 ? 'active' : ''}" 
             onclick="goToSlide(${index})"></div>
    `).join('');
}

// Carousel navigation
function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselItems.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    updateCarouselPosition();
    updateCarouselDots();
    resetAutoPlay();
}

function updateCarouselPosition() {
    featuredCarousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function updateCarouselDots() {
    const dots = carouselDots.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Auto-play functionality
function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

// Load trending movies
async function loadTrendingMovies() {
    try {
        showSkeletonLoading(trendingMovies, 8);
        
        const response = await fetch(`${API_BASE_URL}/trending`);
        const data = await response.json();
        
        if (data.results) {
            renderMovies(trendingMovies, data.results.slice(0, 8));
        }
    } catch (error) {
        console.error('Error loading trending movies:', error);
        trendingMovies.innerHTML = '<p class="error-message">Failed to load trending movies</p>';
    }
}

// Load popular movies
async function loadPopularMovies() {
    try {
        showSkeletonLoading(popularMovies, 8);
        
        const response = await fetch(`${API_BASE_URL}/popular`);
        const data = await response.json();
        
        if (data.results) {
            renderMovies(popularMovies, data.results.slice(0, 8));
        }
    } catch (error) {
        console.error('Error loading popular movies:', error);
        popularMovies.innerHTML = '<p class="error-message">Failed to load popular movies</p>';
    }
}

// Render movies in grid
function renderMovies(container, movies) {
    container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

// Create movie card HTML
function createMovieCard(movie) {
    const posterUrl = movie.poster_path 
        ? `${TMDB_IMAGE_BASE}/${TMDB_POSTER_SIZE}${movie.poster_path}`
        : 'assets/images/placeholder.jpg';
    
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    return `
        <div class="movie-card" onclick="viewMovieDetails(${movie.id})">
            <img src="${posterUrl}" 
                 alt="${movie.title}" 
                 class="movie-poster"
                 onerror="this.src='assets/images/placeholder.jpg'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${year}</span>
                    <span class="rating">⭐ ${rating}</span>
                </div>
                <p class="movie-overview">${movie.overview || 'No description available.'}</p>
            </div>
        </div>
    `;
}

// Show skeleton loading
function showSkeletonLoading(container, count, type = 'card') {
    if (type === 'carousel') {
        container.innerHTML = Array(count).fill(`
            <div class="carousel-item">
                <div class="skeleton skeleton-poster"></div>
            </div>
        `).join('');
    } else {
        container.innerHTML = Array(count).fill(`
            <div class="movie-card">
                <div class="skeleton skeleton-poster"></div>
                <div class="movie-info">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            </div>
        `).join('');
    }
}

// Navigation function
function viewMovieDetails(movieId) {
    window.location.href = `details.html?id=${movieId}`;
}

// Initialize the page - ONLY ONE DOMContentLoaded!
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu(); // Initialize mobile menu first
    loadFeaturedMovies();
    loadTrendingMovies();
    loadPopularMovies();
    startAutoPlay();
});

// Make functions globally available
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;
window.viewMovieDetails = viewMovieDetails;
