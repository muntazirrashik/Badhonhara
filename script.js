document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'ce0cfb7153014e7fbd7cb663aa576ce9';
    const BASE_URL = 'https://newsapi.org/v2/top-headlines';
    const COUNTRY = 'us';

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

    init();

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
            const data = await response.json();

            if (data.status === 'ok' && data.articles.length) {
                currentNewsItems = data.articles
                    .filter(article => article.title && article.title !== '[Removed]')
                    .map(article => ({
                        title: article.title,
                        desc: article.description || 'No description available',
                        image: article.urlToImage || 'https://via.placeholder.com/600x400?text=No+Image',
                        source: article.source.name || 'Unknown',
                        date: formatDate(article.publishedAt),
                        url: article.url
                    }));

                currentNewsIndex = 0;
                renderNews();
            } else {
                showNoNewsMessage();
            }
        } catch (err) {
            console.error('Error fetching news:', err);
            showErrorMessage();
        } finally {
            isLoading = false;
            tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.category === category));
        }
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffHours < 1) return `${Math.floor((now - date) / (1000 * 60))}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    }

    function renderNews() {
        if (!currentNewsItems.length) return showNoNewsMessage();
        const item = currentNewsItems[currentNewsIndex];

        newsContainer.innerHTML = `
            <div class="news-card">
                <img src="${item.image}" alt="${item.title}" class="news-image"
                    onerror="this.src='https://via.placeholder.com/600x400?text=Image+Not+Available'">
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-desc">${item.desc}</p>
                    <div class="news-source">
                        <span>${item.source}</span>
                        <span>${item.date}</span>
                    </div>
                    ${item.url ? `<button class="view-original-btn" data-url="${item.url}">View Original Article</button>` : ''}
                </div>
            </div>
        `;

        document.querySelector('.view-original-btn')?.addEventListener('click', (e) => {
            window.open(e.target.dataset.url, '_blank');
        });

        updateNavButtons();
    }

    function updateNavButtons() {
        prevBtn.disabled = currentNewsIndex === 0;
        nextBtn.disabled = currentNewsIndex === currentNewsItems.length - 1;
    }

    function showNoNewsMessage() {
        newsContainer.innerHTML = '<div class="no-news">No news available for this category.</div>';
        updateNavButtons();
    }

    function showErrorMessage() {
        newsContainer.innerHTML = `
            <div class="error-message">
                Failed to load news. Please try again later.
                <button onclick="window.location.reload()" style="margin-top: 10px;">Retry</button>
            </div>
        `;
        updateNavButtons();
    }

    function setupEventListeners() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                if (category !== currentCategory) {
                    currentCategory = category;
                    loadNews(category);
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

        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft' && !prevBtn.disabled) prevBtn.click();
            if (e.key === 'ArrowRight' && !nextBtn.disabled) nextBtn.click();
        });

        // Swipe support
        let touchStartX = 0;
        newsContainer.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
        newsContainer.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const delta = touchStartX - touchEndX;
            if (delta > 50 && !nextBtn.disabled) nextBtn.click();
            if (delta < -50 && !prevBtn.disabled) prevBtn.click();
        }, { passive: true });
    }

    function setupModalListeners() {
        searchIcon.addEventListener('click', () => {
            searchModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            searchInput.focus();
        });

        userIcon.addEventListener('click', () => {
            profileModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                searchModal.style.display = 'none';
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        });

        window.addEventListener('click', e => {
            if (e.target === searchModal || e.target === profileModal) {
                searchModal.style.display = 'none';
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();
            if (query.length < 3) {
                searchResults.innerHTML = '<div class="no-results">Enter at least 3 characters</div>';
                return;
            }
            searchResults.innerHTML = '<div class="loading"><div class="spinner"></div><p>Searching...</p></div>';
            searchTimeout = setTimeout(() => performSearch(query), 500);
        });

        signInBtn.addEventListener('click', () => {
            alert('Sign in functionality would be implemented here.');
        });

        settingsBtn.addEventListener('click', () => {
            alert('Settings functionality would be implemented here.');
        });
    }

    async function performSearch(query) {
        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`);
            const data = await response.json();

            if (data.status === 'ok' && data.articles.length > 0) {
                displaySearchResults(data.articles);
            } else {
                searchResults.innerHTML = '<div class="no-results">No results found</div>';
            }
        } catch (err) {
            console.error('Search error:', err);
            searchResults.innerHTML = '<div class="error-message">Failed to search. Please try again.</div>';
        }
    }

    function displaySearchResults(articles) {
        searchResults.innerHTML = '';
        articles.slice(0, 10).forEach(article => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.innerHTML = `
                <h4>${article.title}</h4>
                <p>${article.source.name} - ${formatDate(article.publishedAt)}</p>
            `;
            div.addEventListener('click', () => {
                window.open(article.url, '_blank');
            });
            searchResults.appendChild(div);
        });
    }
});
