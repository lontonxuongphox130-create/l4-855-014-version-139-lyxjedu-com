(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const opened = mobilePanel.hasAttribute('hidden');
      if (opened) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  let slideIndex = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === slideIndex);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(slideTimer);
    slideTimer = setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  const backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('visible', window.scrollY > 480);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const searchInput = document.querySelector('[data-search-input]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  function filterCards(value) {
    const query = (value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      card.classList.toggle('hidden-card', query && !haystack.includes(query));
    });
  }

  if (searchInput) {
    if (initialQuery) {
      searchInput.value = initialQuery;
      filterCards(initialQuery);
    }
    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value);
    });
  }

  const sortSelect = document.querySelector('[data-sort-select]');
  const grid = document.querySelector('[data-movie-grid]');
  if (sortSelect && grid) {
    sortSelect.addEventListener('change', function () {
      const list = Array.from(grid.querySelectorAll('[data-title]'));
      const key = sortSelect.value;
      list.sort(function (a, b) {
        if (key === 'year') {
          return (b.getAttribute('data-year') || '').localeCompare(a.getAttribute('data-year') || '');
        }
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
      });
      list.forEach(function (item) {
        grid.appendChild(item);
      });
    });
  }
})();
