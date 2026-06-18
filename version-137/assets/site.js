
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
            button.addEventListener("click", function () {
                document.body.classList.toggle("menu-open");
            });
        });
    }

    function initHero() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function getSearchText(card) {
        return [
            card.getAttribute("data-search") || "",
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
    }

    function initFilters() {
        var input = document.querySelector("[data-movie-filter]");
        var year = document.querySelector("[data-year-filter]");
        var region = document.querySelector("[data-region-filter]");
        var genre = document.querySelector("[data-genre-filter]");
        var count = document.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (!cards.length || (!input && !year && !region && !genre)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function matches(card) {
            var textValue = input ? input.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var regionValue = region ? region.value : "";
            var genreValue = genre ? genre.value : "";
            var haystack = getSearchText(card);
            var okText = !textValue || haystack.indexOf(textValue) !== -1;
            var okYear = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
            var okRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
            var okGenre = !genreValue || (card.getAttribute("data-genre") || "").indexOf(genreValue) !== -1 || (card.getAttribute("data-tags") || "").indexOf(genreValue) !== -1;
            return okText && okYear && okRegion && okGenre;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var show = matches(card);
                card.classList.toggle("hidden-card", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        [input, year, region, genre].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function initPlayers() {
        document.querySelectorAll("[data-hls-player]").forEach(function (box) {
            var video = box.querySelector("video");
            var toggleButtons = box.querySelectorAll("[data-player-toggle]");
            var muteButton = box.querySelector("[data-player-mute]");
            var fullscreenButton = box.querySelector("[data-player-fullscreen]");
            var status = box.querySelector("[data-player-status]");
            var source = video ? video.getAttribute("data-src") : "";
            var hls = null;
            var loaded = false;

            if (!video || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || "";
                }
            }

            function loadSource() {
                if (loaded) {
                    return;
                }
                loaded = true;
                setStatus("正在加载");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("");
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus("网络重连中");
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus("媒体恢复中");
                            hls.recoverMediaError();
                        } else {
                            setStatus("播放源加载失败");
                            hls.destroy();
                        }
                    });
                } else {
                    video.src = source;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.addEventListener("loadedmetadata", function () {
                            setStatus("");
                        }, { once: true });
                    } else {
                        setStatus("");
                    }
                }
            }

            function playOrPause() {
                loadSource();
                if (video.paused) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            setStatus("点击视频区域继续播放");
                        });
                    }
                } else {
                    video.pause();
                }
            }

            toggleButtons.forEach(function (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playOrPause();
                });
            });

            video.addEventListener("click", function () {
                playOrPause();
            });

            video.addEventListener("play", function () {
                box.classList.add("is-playing");
                box.classList.remove("is-paused");
                setStatus("");
            });

            video.addEventListener("pause", function () {
                box.classList.add("is-paused");
                box.classList.remove("is-playing");
            });

            if (muteButton) {
                muteButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    video.muted = !video.muted;
                    muteButton.textContent = video.muted ? "取消静音" : "静音";
                });
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (box.requestFullscreen) {
                        box.requestFullscreen();
                    }
                });
            }
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("visible", window.scrollY > 420);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
        initBackTop();
    });
})();
