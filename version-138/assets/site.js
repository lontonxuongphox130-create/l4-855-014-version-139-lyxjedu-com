(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalizeText(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, "");
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
        activate(next);
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-card-search]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var category = scope.querySelector("[data-filter-category]");
      var result = scope.querySelector("[data-result-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      function apply() {
        var query = normalizeText(input ? input.value : "");
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var categoryValue = category ? category.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category"),
            card.getAttribute("data-keywords")
          ].join(" "));
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            matched = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            matched = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matched = false;
          }
          if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
            matched = false;
          }
          card.classList.toggle("filtered-out", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (result) {
          result.textContent = visible > 0 ? "当前筛选：" + visible + " 部" : "没有找到匹配内容";
        }
      }
      [input, region, type, year, category].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function setupPlayer() {
    var video = document.getElementById("movie-video");
    var shell = document.querySelector("[data-player-shell]");
    var startButton = document.querySelector("[data-player-start]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-hls");
    var attached = false;
    function attachSource() {
      if (attached || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.src = source;
      }
      attached = true;
    }
    function playVideo() {
      attachSource();
      if (shell) {
        shell.classList.add("is-playing");
      }
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (startButton) {
            startButton.classList.remove("is-hidden");
          }
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }
    if (startButton) {
      startButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function toggle() {
      button.classList.toggle("is-visible", window.scrollY > 360);
    }
    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupPlayer();
    setupBackTop();
  });
})();
