// assets/js/category.js - Only for category page

// DOM Elements for category page
const categoryTitle = document.getElementById('categoryTitle');
const categoryDescription = document.getElementById('categoryDescription');
const categoryMovies = document.getElementById('categoryMovies');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');

// Category state
let currentCategory = 'popular';
let currentPage = 1;
let isLoading = false;
let hasMore = true;

// Mobile menu functionality (copy from main.js)
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

// Initialize category page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Category page loaded');
    initMobileMenu(); // Only initialize mobile menu
    
    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('type') || 'popular';
    
    // Set up filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryType = this.dataset.type;
            switchCategory(categoryType);
        });
    });
    
    // Load initial category
    switchCategory(category);
    
    // Set up infinite scroll
    if (APP_CONFIG.FEATURES.INFINITE_SCROLL) {
        window.addEventListener('scroll', handleInfiniteScroll);
    }
});

// Switch category
function switchCategory(categoryType) {
    if (!APP_CONFIG.CATEGORY_CONFIG[categoryType] || isLoading) return;
    
    currentCategory = categoryType;
    currentPage = 1;
    hasMore = true;
    
    // Update active filter button
    updateActiveFilter(categoryType);
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}?type=${categoryType}`;
    window.history.pushState({}, '', newUrl);
    
    // Load movies
    loadCategoryMovies();
}

// Update active filter button
function updateActiveFilter(categoryType) {
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === categoryType);
    });
}

// Load movies for current category
async function loadCategoryMovies(page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    
    try {
        if (page === 1) {
            showSkeletonLoading(categoryMovies, 12);
            updateCategoryInfo();
            noResults.style.display = 'none';
        } else {
            loadingIndicator.style.display = 'block';
        }
        
        const config = APP_CONFIG.CATEGORY_CONFIG[currentCategory];
        const endpoint = `${config.endpoint}?page=${page}`;
        
        console.log('Fetching from:', APP_CONFIG.API_BASE_URL + endpoint);
        
        // Use direct fetch instead of apiFetch for now
        const response = await fetch(APP_CONFIG.API_BASE_URL + endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.results && data.results.length > 0) {
            if (page === 1) {
                renderMovies(categoryMovies, data.results);
            } else {
                appendMovies(categoryMovies, data.results);
            }
            
            hasMore = data.total_pages ? page < data.total_pages : data.results.length === APP_CONFIG.ITEMS_PER_PAGE;
        } else {
            if (page === 1) {
                showNoMovies();
            }
            hasMore = false;
        }
    } catch (error) {
        console.error('Error loading category movies:', error);
        if (page === 1) {
            showError(`Failed to load movies. Please make sure your backend is running at ${APP_CONFIG.API_BASE_URL}`);
        }
    } finally {
        isLoading = false;
        loadingIndicator.style.display = 'none';
    }
}

// Update category title and description
function updateCategoryInfo() {
    const config = APP_CONFIG.CATEGORY_CONFIG[currentCategory];
    categoryTitle.textContent = config.title;
    categoryDescription.textContent = config.description;
}

// Render movies
function renderMovies(container, movies) {
    if (movies.length === 0) {
        showNoMovies();
        return;
    }
    
    container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

// Append movies for infinite scroll
function appendMovies(container, movies) {
    container.innerHTML += movies.map(movie => createMovieCard(movie)).join('');
}

// Show no movies message
function showNoMovies() {
    categoryMovies.innerHTML = '';
    noResults.style.display = 'block';
}

// Show error message
function showError(message) {
    categoryMovies.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle fa-2x" style="margin-bottom: 1rem; color: #e74c3c;"></i>
            <h3>Connection Error</h3>
            <p style="margin-bottom: 1.5rem;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="loadCategoryMovies(1)">
                    <i class="fas fa-redo"></i> Try Again
                </button>
                <button class="btn btn-secondary" onclick="switchCategory('popular')">
                    <i class="fas fa-film"></i> Browse Popular
                </button>
            </div>
            <div style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                <p>Make sure your Flask backend is running on port 5000</p>
                <code style="background: var(--surface); padding: 0.5rem; border-radius: 4px; display: block; margin-top: 0.5rem;">
                    cd backend && python app.py
                </code>
            </div>
        </div>
    `;
}

// Handle infinite scroll
function handleInfiniteScroll() {
    if (!hasMore || isLoading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - APP_CONFIG.INFINITE_SCROLL_THRESHOLD) {
        currentPage++;
        loadCategoryMovies(currentPage);
    }
}

// Skeleton loading
function showSkeletonLoading(container, count) {
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

// Create movie card
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

// Navigation function
function viewMovieDetails(movieId) {
    window.location.href = `details.html?id=${movieId}`;
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('type') || 'popular';
    switchCategory(category);
});

// Make functions globally available
window.switchCategory = switchCategory;
window.viewMovieDetails = viewMovieDetails;