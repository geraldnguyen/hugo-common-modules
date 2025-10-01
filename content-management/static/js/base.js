// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        // Close menu when clicking outside menu or hamburger (mobile only)
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
                const isMenu = navMenu.contains(e.target);
                const isToggle = navToggle.contains(e.target);
                if (!isMenu && !isToggle) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    }
});

// Story Filtering and Search
class StoryFilter {
    constructor() {
        this.stories = document.querySelectorAll('.story-card[data-genres]');
        this.genreFilter = document.getElementById('genre-filter');
        this.originFilter = document.getElementById('origin-filter');
        this.themeFilter = document.getElementById('theme-filter');
        this.ageGroupFilter = document.getElementById('age-group-filter');
        this.readingTimeFilter = document.getElementById('reading-time-filter');
        this.searchInput = document.getElementById('story-search');
        this.sortSelect = document.getElementById('sort-by');
        this.clearButton = document.getElementById('clear-filters');
        this.resultsCount = document.getElementById('results-count');
        this.noResults = document.getElementById('no-results');
        
        this.init();
    }
    
    init() {
        if (this.genreFilter) this.genreFilter.addEventListener('change', () => this.filterStories());
        if (this.originFilter) this.originFilter.addEventListener('change', () => this.filterStories());
        if (this.themeFilter) this.themeFilter.addEventListener('change', () => this.filterStories());
        if (this.ageGroupFilter) this.ageGroupFilter.addEventListener('change', () => this.filterStories());
        if (this.readingTimeFilter) this.readingTimeFilter.addEventListener('change', () => this.filterStories());
        if (this.searchInput) this.searchInput.addEventListener('input', () => this.filterStories());
        if (this.sortSelect) this.sortSelect.addEventListener('change', () => this.sortStories());
        if (this.clearButton) this.clearButton.addEventListener('click', () => this.clearFilters());
    }
    
    filterStories() {
        const genreValue = this.genreFilter ? this.genreFilter.value.toLowerCase() : '';
        const originValue = this.originFilter ? this.originFilter.value.toLowerCase() : '';
        const themeValue = this.themeFilter ? this.themeFilter.value.toLowerCase() : '';
        const ageGroupValue = this.ageGroupFilter ? this.ageGroupFilter.value.toLowerCase() : '';
        const readingTimeValue = this.readingTimeFilter ? this.readingTimeFilter.value.toLowerCase() : '';
        const searchValue = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        
        let visibleCount = 0;
        
        this.stories.forEach(story => {
            const genres = story.dataset.genres ? story.dataset.genres.toLowerCase() : '';
            const origins = story.dataset.origins ? story.dataset.origins.toLowerCase() : '';
            const themes = story.dataset.themes ? story.dataset.themes.toLowerCase() : '';
            const ageGroups = story.dataset.ageGroups ? story.dataset.ageGroups.toLowerCase() : '';
            const readingTime = story.dataset.readingTime ? story.dataset.readingTime.toString() : '';
            const title = story.dataset.title || '';
            const summary = story.dataset.summary || '';
            
            const matchesGenre = !genreValue || genres.includes(genreValue);
            const matchesOrigin = !originValue || origins.includes(originValue);
            const matchesTheme = !themeValue || themes.includes(themeValue);
            const matchesAgeGroup = !ageGroupValue || ageGroups.includes(ageGroupValue);
            const matchesReadingTime = !readingTimeValue || readingTime === readingTimeValue;
            const matchesSearch = !searchValue || title.includes(searchValue) || summary.includes(searchValue);
            
            if (matchesGenre && matchesOrigin && matchesTheme && matchesAgeGroup && matchesReadingTime && matchesSearch) {
                story.style.display = 'block';
                visibleCount++;
            } else {
                story.style.display = 'none';
            }
        });
        
        this.updateResultsCount(visibleCount);
    }
    
    sortStories() {
        if (!this.sortSelect) return;
        
        const sortValue = this.sortSelect.value;
        const storiesContainer = document.getElementById('stories-grid');
        const storiesArray = Array.from(this.stories);
        
        storiesArray.sort((a, b) => {
            switch (sortValue) {
                case 'date-desc':
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                case 'date-asc':
                    return new Date(a.dataset.date) - new Date(b.dataset.date);
                case 'title-asc':
                    return a.dataset.title.localeCompare(b.dataset.title);
                case 'title-desc':
                    return b.dataset.title.localeCompare(a.dataset.title);
                default:
                    return 0;
            }
        });
        
        // Reorder DOM elements
        storiesArray.forEach(story => {
            storiesContainer.appendChild(story);
        });
    }
    
    clearFilters() {
        if (this.genreFilter) this.genreFilter.value = '';
        if (this.originFilter) this.originFilter.value = '';
        if (this.themeFilter) this.themeFilter.value = '';
        if (this.ageGroupFilter) this.ageGroupFilter.value = '';
        if (this.readingTimeFilter) this.readingTimeFilter.value = '';
        if (this.searchInput) this.searchInput.value = '';
        if (this.sortSelect) this.sortSelect.value = 'date-desc';
        
        this.filterStories();
        this.sortStories();
    }
    
    updateResultsCount(count) {
        if (this.resultsCount) {
            this.resultsCount.textContent = `${count} ${count === 1 ? 'story' : 'stories'} found`;
        }
        
        if (this.noResults) {
            this.noResults.style.display = count === 0 ? 'block' : 'none';
        }
    }
}

// Rating System
class StoryRating {
    constructor() {
        this.ratingWidget = document.getElementById('rating-widget');
        this.ratingDisplay = document.getElementById('rating-display');
        this.init();
    }
    
    init() {
        if (!this.ratingWidget) return;
        
        const stars = this.ratingWidget.querySelectorAll('.star');
        const storyId = this.ratingWidget.dataset.story;
        
        // Load existing rating
        this.loadRating(storyId);
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setRating(storyId, index + 1);
            });
            
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
        });
        
        this.ratingWidget.addEventListener('mouseleave', () => {
            const currentRating = this.getCurrentRating(storyId);
            this.highlightStars(currentRating);
        });
    }
    
    setRating(storyId, rating) {
        localStorage.setItem(`rating-${storyId}`, rating);
        this.highlightStars(rating);
        this.updateDisplay(rating);
    }
    
    loadRating(storyId) {
        const rating = this.getCurrentRating(storyId);
        if (rating) {
            this.highlightStars(rating);
            this.updateDisplay(rating);
        }
    }
    
    getCurrentRating(storyId) {
        return parseInt(localStorage.getItem(`rating-${storyId}`)) || 0;
    }
    
    highlightStars(rating) {
        const stars = this.ratingWidget.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.classList.add('active');
            } else {
                star.textContent = '☆';
                star.classList.remove('active');
            }
        });
    }
    
    updateDisplay(rating) {
        if (this.ratingDisplay) {
            this.ratingDisplay.textContent = `You rated this story ${rating} out of 5 stars.`;
        }
    }
}

// Search Enhancement
class SearchEnhancer {
    constructor() {
        this.searchInput = document.getElementById('story-search');
        this.init();
    }
    
    init() {
        if (!this.searchInput) return;
        
        // Add search suggestions (simple implementation)
        this.searchInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length > 2) {
                this.showSearchSuggestions(value);
            } else {
                this.hideSearchSuggestions();
            }
        });
    }
    
    showSearchSuggestions(query) {
        // This could be enhanced with a proper search index
        // For now, it's just a placeholder for future implementation
    }
    
    hideSearchSuggestions() {
        // Hide suggestions dropdown
    }
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new StoryFilter();
    new StoryRating();
    new SearchEnhancer();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Reading progress indicator (for story pages)
function initReadingProgress() {
    const storyContent = document.querySelector('.story-text');
    if (!storyContent) return;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: #2563eb;
        z-index: 1001;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

// Initialize reading progress on story pages
if (document.querySelector('.story')) {
    initReadingProgress();
}
