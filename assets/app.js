
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.textContent
    ].join(' '));
  }

  function filterCards(query) {
    var q = normalize(query);
    cards.forEach(function (card) {
      var hit = !q || cardText(card).indexOf(q) !== -1;
      card.classList.toggle('hidden-card', !hit);
    });
  }

  if (inputs.length && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      inputs.forEach(function (input) {
        input.value = initial;
      });
      filterCards(initial);
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        filterCards(input.value);
      });
    });
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-term]'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      filterCards(button.getAttribute('data-filter-term') || '');
    });
  });
})();
