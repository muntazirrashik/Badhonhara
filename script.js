document.addEventListener('DOMContentLoaded', function () {
    const newsData = {
        all: [
            {
                title: "Bangladesh's GDP grows at 6.5% in Q1 FY24",
                desc: "Bangladesh's economy showed resilience with a 6.5% growth in the first quarter, driven by strong performances in the manufacturing and export sectors despite global economic challenges.",
                image: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Flag_of_Bangladesh.svg",
                source: "The Daily Star",
                date: "2h ago"
            },
            {
                title: "New metro rail line opens in Dhaka",
                desc: "The much-anticipated second line of Dhaka Metro Rail has begun operations, connecting Motijheel to Kamalapur, expected to significantly reduce traffic congestion in the capital city.",
                image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Dhaka Tribune",
                date: "5h ago"
            },
            {
                title: "Bangladesh wins SAFF Championship 2023",
                desc: "The Bangladesh national football team clinched the SAFF Championship title after a thrilling penalty shootout against Nepal, marking their second championship win in history.",
                image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Prothom Alo",
                date: "1d ago"
            }
        ],
        technology: [
            {
                title: "Bangladeshi startup raises $5M in Series A funding",
                desc: "Local fintech startup 'Sheba.xyz' has secured $5 million in Series A funding led by international investors, planning to expand its service platform across Bangladesh.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "TechBangla",
                date: "3h ago"
            },
            {
                title: "Government launches digital farming initiative",
                desc: "The Agriculture Ministry has launched a nationwide digital farming platform to connect farmers with markets, weather data, and agricultural advice through mobile apps.",
                image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Bangladesh Today",
                date: "1d ago"
            }
        ],
        business: [
            {
                title: "Bangladesh Bank keeps interest rates unchanged",
                desc: "In its latest monetary policy, Bangladesh Bank has maintained the repo rate at 6% to support economic growth while keeping inflation in check.",
                image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Financial Express",
                date: "4h ago"
            },
            {
                title: "RMG exports show 12% growth this quarter",
                desc: "Bangladesh's ready-made garment sector reports 12% year-on-year growth in exports, with the EU and US remaining top destinations for apparel products.",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Textile Today",
                date: "1d ago"
            }
        ],
        sports: [
            {
                title: "Shakib returns as ODI captain",
                desc: "The Bangladesh Cricket Board has reappointed Shakib Al Hasan as the ODI team captain for the upcoming Asia Cup and World Cup tournaments.",
                image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "CricBuzz",
                date: "6h ago"
            },
            {
                title: "Bangladesh to host U-19 Cricket World Cup",
                desc: "The ICC has announced Bangladesh as host for the 2024 U-19 Cricket World Cup, with matches to be played across four venues in Dhaka and Chittagong.",
                image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "ESPNcricinfo",
                date: "1d ago"
            }
        ],
        entertainment: [
            {
                title: "Bangladeshi film selected for Toronto Film Festival",
                desc: "Independent film 'Mujib: The Making of a Nation' has been officially selected for screening at the prestigious Toronto International Film Festival next month.",
                image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Channel i",
                date: "1d ago"
            },
            {
                title: "Popular band announces reunion concert",
                desc: "Legendary Bangladeshi rock band Miles is set to perform a reunion concert next month after a decade-long hiatus, with tickets selling out within hours.",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                source: "Daily Sun",
                date: "3h ago"
            }
        ]
    };

    const newsContainer = document.getElementById('newsContainer');
    const tabs = document.querySelectorAll('.tab');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentCategory = 'all';
    let currentNewsIndex = 0;
    let currentNewsItems = [];

    function init() {
        loadNews(currentCategory);
        setupEventListeners();
    }

    function loadNews(category) {
        newsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        setTimeout(() => {
            currentNewsItems = newsData[category] || [];
            currentNewsIndex = 0;
            renderNews();

            tabs.forEach(tab => {
                if (tab.dataset.category === category) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }, 500);
    }

    function renderNews() {
        if (currentNewsItems.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">No news available for this category.</div>';
            return;
        }

        const newsItem = currentNewsItems[currentNewsIndex];

        const newsCard = `
            <div class="news-card">
                <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image">
                <div class="news-content">
                    <h3 class="news-title">${newsItem.title}</h3>
                    <p class="news-desc">${newsItem.desc}</p>
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

    function updateNavButtons() {
        prevBtn.disabled = currentNewsIndex === 0;
        nextBtn.disabled = currentNewsIndex === currentNewsItems.length - 1;
    }

    function setupEventListeners() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                currentCategory = tab.dataset.category;
                loadNews(currentCategory);
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
    }

    init();
});
