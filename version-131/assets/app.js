(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (navToggle && mobileNav) {
            navToggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("is-open");
                navToggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero-carousel]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5600);
            }
        }

        var filterPanel = document.querySelector("[data-filter-panel]");
        if (filterPanel) {
            var searchInput = filterPanel.querySelector("[data-filter-search]");
            var regionSelect = filterPanel.querySelector("[data-filter-region]");
            var typeSelect = filterPanel.querySelector("[data-filter-type]");
            var yearSelect = filterPanel.querySelector("[data-filter-year]");
            var status = document.querySelector("[data-filter-status]");
            var empty = document.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query && searchInput) {
                searchInput.value = query;
            }

            function textIncludes(value, queryText) {
                return value.toLowerCase().indexOf(queryText.toLowerCase()) !== -1;
            }

            function applyFilters() {
                var keyword = searchInput ? searchInput.value.trim() : "";
                var region = regionSelect ? regionSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ");
                    var matched = true;

                    if (keyword && !textIncludes(haystack, keyword)) {
                        matched = false;
                    }
                    if (region && card.getAttribute("data-region") !== region) {
                        matched = false;
                    }
                    if (type && card.getAttribute("data-type") !== type) {
                        matched = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = visible > 0 ? "已更新筛选结果" : "没有找到匹配影片";
                }
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }

        var topButton = document.querySelector("[data-back-to-top]");
        if (topButton) {
            window.addEventListener("scroll", function () {
                topButton.classList.toggle("is-visible", window.scrollY > 360);
            });
            topButton.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }
    });
})();

function initVideoPlayer(streamUrl) {
    var video = document.querySelector("[data-player='video']");
    var cover = document.querySelector("[data-player='cover']");
    var start = document.querySelector("[data-player='start']");
    var connected = false;
    var hlsInstance = null;

    function connect() {
        if (!video || connected) {
            return;
        }
        connected = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function begin(event) {
        if (event) {
            event.preventDefault();
        }
        connect();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        if (video) {
            video.play().catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", begin);
    }
    if (start) {
        start.addEventListener("click", begin);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
