// Search functionality

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const resultsInfo = document.getElementById('resultsInfo');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');

// Search state
let currentQuery = '';
let currentPage = 1;
let isLoading = false;
let hasMore = true;

// Initialize search
document.addEventListener('DOMContentLoaded', function() {
    // Get query from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        searchInput.value = query;
        performSearch(query);
    }
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Infinite scroll
    window.addEventListener('scroll', handleInfiniteScroll);
});

// Handle search
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        currentQuery = query;
        currentPage = 1;
        hasMore = true;
        
        // Update URL
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
        window.history.pushState({}, '', newUrl);
        
        performSearch(query);
    }
}





// Perform search
async function performSearch(query, page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    
    try {
        if (page === 1) {
            showSkeletonLoading(searchResults, 12);
            noResults.style.display = 'none';
        } else {
            loadingIndicator.style.display = 'block';
        }
        
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            if (page === 1) {
                renderSearchResults(data.results);
                updateResultsInfo(data.results.length, data.total_results || data.results.length);
            } else {
                appendSearchResults(data.results);
            }
            
            hasMore = data.total_pages ? page < data.total_pages : data.results.length === 20;
        } else {
            if (page === 1) {
                showNoResults();
            }
            hasMore = false;
        }
    } catch (error) {
        console.error('Search error:', error);
        if (page === 1) {
            searchResults.innerHTML = '<p class="error-message">Failed to load search results</p>';
        }
    } finally {
        isLoading = false;
        loadingIndicator.style.display = 'none';
    }
}

// Render search results
function renderSearchResults(movies) {
    searchResults.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

// Append search results for infinite scroll
function appendSearchResults(movies) {
    searchResults.innerHTML += movies.map(movie => createMovieCard(movie)).join('');
}

// Update results info
function updateResultsInfo(shown, total) {
    resultsInfo.textContent = `Showing ${shown} of ${total} results for "${currentQuery}"`;
}

// Show no results message
function showNoResults() {
    searchResults.innerHTML = '';
    noResults.style.display = 'block';
    resultsInfo.textContent = `No results found for "${currentQuery}"`;
}

// Handle infinite scroll
function handleInfiniteScroll() {
    if (!hasMore || isLoading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 500) {
        currentPage++;
        performSearch(currentQuery, currentPage);
    }
}

// Skeleton loading for search
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

// Make functions globally available
window.handleSearch = handleSearch;