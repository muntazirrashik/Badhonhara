document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'ce0cfb7153014e7fbd7cb663aa576ce9';
    const BASE_URL = 'https://newsapi.org/v2/top-headlines';
    const COUNTRY = 'us'; // You can change this to your preferred country

    const newsContainer = document.getElementById('newsContainer');
    const tabs = document.querySelectorAll('.tab');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Modal elements
    const searchModal = document.getElementById('searchModal');
    const profileModal = document.getElementById('profileModal');
    const searchIcon = document.querySelector('.fa-search').parentElement;
    const userIcon = document.querySelector('.fa-user').parentElement;
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const signInBtn = document.getElementById('signInBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    let currentCategory = 'general';
    let currentNewsIndex = 0;
    let currentNewsItems = [];
    let isLoading = false;
    let searchTimeout;

    function init() {
        loadNews(currentCategory);
        setupEventListeners();
        setupModalListeners();
    }

    async function loadNews(category) {
        if (isLoading) return;

        isLoading = true;
        newsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading news...</p>
            </div>
        `;

        try {
            const response = await fetch(`${BASE_URL}?country=${COUNTRY}&category=${category}&apiKey=${API_KEY}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'ok' && data.articles && data.articles.length > 0) {
                currentNewsItems = data.articles
                    .filter(article => article.title && article.title !== '[Removed]')
                    .map(article => ({
                        title: article.title,
                        desc: article.description || 'No description available',
                        image: article.urlToImage || 'https://via.placeholder.com/600x400?text=No+Image',
                        source: article.source.name || 'Unknown source',
                        date: formatDate(article.publishedAt),
                        url: article.url
                    }));

                currentNewsIndex = 0;
                renderNews();
            } else {
                showNoNewsMessage();
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            showErrorMessage();
        } finally {
            isLoading = false;

            tabs.forEach(tab => {
                if (tab.dataset.category === category) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    }

    function renderNews() {
        if (currentNewsItems.length === 0) {
            showNoNewsMessage();
            return;
        }

        const newsItem = currentNewsItems[currentNewsIndex];

        const newsCard = `
            <div class="news-card">
                <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image" onerror="this.src='https://via.placeholder.com/600x400?text=Image+Not+Available'">
                <div class="news-content">
                    <h3 class="news-title">${newsItem.title}</h3>
                    <p class="news-desc">${newsItem.desc}</p>
                    <a href="${newsItem.url}" target="_blank" rel="noopener noreferrer" class="read-more">Read more →</a>
                    <div class="news-source">
                        <span>${newsItem.source}</span>
                        <span>${newsItem.date}</span>
                    </div>
                </div>
            </div>
        `;

        newsContainer.innerHTML = newsCard;
        updateNavButtons();
    }

    function showNoNewsMessage() {
        newsContainer.innerHTML = '<div class="no-news">No news available for this category.</div>';
        updateNavButtons();
    }

    function showErrorMessage() {
        newsContainer.innerHTML = `
            <div class="error-message">
                Failed to load news. Please try again later.
                <button onclick="window.location.reload()" style="margin-top: 10px; background: #1d9bf0; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
        updateNavButtons();
    }

    function updateNavButtons() {
        prevBtn.disabled = currentNewsIndex === 0 || currentNewsItems.length === 0;
        nextBtn.disabled = currentNewsIndex === currentNewsItems.length - 1 || currentNewsItems.length === 0;
    }

    function setupEventListeners() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                if (category !== currentCategory) {
                    currentCategory = category;
                    loadNews(currentCategory);
                }
            });
        });

        prevBtn.addEventListener('click', () => {
            if (currentNewsIndex > 0) {
                currentNewsIndex--;
                renderNews();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentNewsIndex < currentNewsItems.length - 1) {
                currentNewsIndex++;
                renderNews();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
                currentNewsIndex--;
                renderNews();
            } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
                currentNewsIndex++;
                renderNews();
            }
        });

        // Swipe support for mobile devices
        let touchStartX = 0;
        let touchEndX = 0;

        newsContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        newsContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            const difference = touchStartX - touchEndX;

            if (difference > threshold && !nextBtn.disabled) {
                // Swipe left - next news
                currentNewsIndex++;
                renderNews();
            } else if (difference < -threshold && !prevBtn.disabled) {
                // Swipe right - previous news
                currentNewsIndex--;
                renderNews();
            }
        }
    }

    function setupModalListeners() {
        // Open modals when icons are clicked
        searchIcon.addEventListener('click', () => {
            searchModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            searchInput.focus();
        });

        userIcon.addEventListener('click', () => {
            profileModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });

        // Close modals when X is clicked
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                searchModal.style.display = 'none';
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Re-enable scrolling
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            if (e.target === profileModal) {
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Search functionality
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();

            if (query.length < 3) {
                searchResults.innerHTML = '<div class="no-results">Enter at least 3 characters to search</div>';
                return;
            }

            searchResults.innerHTML = '<div class="loading"><div class="spinner"></div><p>Searching...</p></div>';

            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 500);
        });

        // Profile functionality
        signInBtn.addEventListener('click', () => {
            alert('Sign in functionality would be implemented here.\nThis could connect to Firebase Auth, Google Sign-In, etc.');
        });

        settingsBtn.addEventListener('click', () => {
            alert('Settings functionality would be implemented here.\nThis could include theme preferences, notification settings, etc.');
        });
    }

    async function performSearch(query) {
        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'ok' && data.articles && data.articles.length > 0) {
                displaySearchResults(data.articles);
            } else {
                searchResults.innerHTML = '<div class="no-results">No results found for your search</div>';
            }
        } catch (error) {
            console.error('Error searching news:', error);
            searchResults.innerHTML = '<div class="error-message">Failed to search. Please try again.</div>';
        }
    }

    function displaySearchResults(articles) {
        searchResults.innerHTML = '';

        if (articles.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        articles.slice(0, 10).forEach(article => {
            if (article.title && article.title !== '[Removed]') {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <h4>${article.title}</h4>
                    <p class="news-source">${article.source?.name || 'Unknown'} • ${formatDate(article.publishedAt)}</p>
                `;
                resultItem.addEventListener('click', () => {
                    window.open(article.url, '_blank');
                });
                searchResults.appendChild(resultItem);
            }
        });
    }

    init();
});
