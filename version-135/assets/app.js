(function() {
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');

  if (menuButton) {
    menuButton.addEventListener('click', function() {
      const isOpen = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const headerForms = document.querySelectorAll('.header-search, .mobile-search');

  headerForms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  const hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startSlider() {
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    function resetSlider() {
      if (timer) {
        window.clearInterval(timer);
      }
      startSlider();
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        const next = Number(dot.getAttribute('data-slide'));
        showSlide(next);
        resetSlider();
      });
    });

    if (slides.length > 1) {
      startSlider();
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const cardList = document.querySelector('[data-card-list]');
  const filterBar = document.querySelector('[data-filter-bar]');
  let activeFilter = '全部';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.textContent
    ].join(' ');
  }

  function applyFilters() {
    if (!cardList) {
      return;
    }
    const query = normalize(searchInput ? searchInput.value : '');
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));

    cards.forEach(function(card) {
      const text = normalize(cardText(card));
      const matchQuery = !query || text.indexOf(query) !== -1;
      const matchFilter = activeFilter === '全部' || text.indexOf(normalize(activeFilter)) !== -1;
      card.classList.toggle('is-hidden', !(matchQuery && matchFilter));
    });
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applyFilters);
  }

  if (filterBar) {
    const chips = Array.from(filterBar.querySelectorAll('.filter-chip'));
    if (chips.length) {
      chips[0].classList.add('is-active');
    }
    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        activeFilter = chip.getAttribute('data-filter') || '全部';
        chips.forEach(function(item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilters();
      });
    });
  }

  applyFilters();
}());
