(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-page-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var grid = document.querySelector('[data-grid]');
    var noResults = null;
    var activeFilter = 'all';

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (query) {
            searchInput.value = query;
        }

        var applyFilter = function () {
            var keyword = searchInput.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var cardText = (card.getAttribute('data-search') || '').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var matchText = !keyword || cardText.indexOf(keyword) !== -1;
                var matchCategory = activeFilter === 'all' || cardCategory === activeFilter;
                var shouldShow = matchText && matchCategory;
                card.classList.toggle('is-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (grid) {
                if (!noResults) {
                    noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    noResults.textContent = '没有找到匹配的影视作品';
                    grid.appendChild(noResults);
                }
                noResults.style.display = visible ? 'none' : 'block';
            }
        };

        searchInput.addEventListener('input', applyFilter);

        filters.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                filters.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    }
})();

function initMoviePlayer(source) {
    var video = document.querySelector('.video-player');
    var overlay = document.querySelector('.player-overlay');

    if (!video || !overlay || !source) {
        return;
    }

    var hlsInstance = null;
    var ready = false;

    var attachSource = function () {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        ready = true;
    };

    var startPlayback = function () {
        attachSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    };

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (!ready) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
