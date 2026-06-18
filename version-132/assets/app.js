(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 320) {
          backTop.classList.add("is-visible");
        } else {
          backTop.classList.remove("is-visible");
        }
      });

      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
        var holder = image.closest(".poster-frame, .hero-visual, .detail-poster, .rank-poster");
        if (holder) {
          holder.classList.add("image-missing");
        }
      }, { once: true });
    });

    setupHero();
    setupSearch();
    setupPlayer();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (!slides.length || !dots.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    restart();
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var catalog = window.SITE_CATALOG || [];

    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var results = form.parentElement.querySelector("[data-search-results]");

      if (!input || !results) {
        return;
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        results.innerHTML = "";

        if (!keyword) {
          results.classList.remove("is-open");
          return;
        }

        var matches = catalog.filter(function (item) {
          return item.search.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          results.classList.add("is-open");
          results.innerHTML = '<div class="search-result-item"><strong>未找到匹配影片</strong><span>换个关键词试试</span></div>';
          return;
        }

        results.classList.add("is-open");
        matches.forEach(function (item) {
          var link = document.createElement("a");
          link.className = "search-result-item";
          link.href = item.url;
          link.innerHTML = "<strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.meta) + "</span>";
          results.appendChild(link);
        });
      }

      input.addEventListener("input", render);

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player]");

    if (!video) {
      return;
    }

    var overlay = document.querySelector("[data-play-button]");
    var state = document.querySelector("[data-player-state]");
    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hlsPlayer = null;

    function setState(text) {
      if (state) {
        state.textContent = text || "";
      }
    }

    function attach() {
      if (attached || !stream) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({ enableWorker: true });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setState("播放暂时不可用，请稍后再试");
          }
        });
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      var request = video.play();

      if (request && request.catch) {
        request.catch(function () {
          setState("点击视频区域继续播放");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        overlay.classList.add("is-hidden");
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setState("");
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
