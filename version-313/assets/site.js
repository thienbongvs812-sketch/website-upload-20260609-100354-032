document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileLinks = document.querySelector('.mobile-links');

  if (menuButton && mobileLinks) {
    menuButton.addEventListener('click', function () {
      mobileLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
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
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var activeCategory = 'all';

  function applyFilter() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var category = card.getAttribute('data-category') || '';
      var matchText = !query || text.indexOf(query) !== -1;
      var matchCategory = activeCategory === 'all' || category === activeCategory;
      card.classList.toggle('is-hidden', !(matchText && matchCategory));
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-category-filter') || 'all';
      filterButtons.forEach(function (other) {
        other.classList.toggle('active', other === button);
      });
      applyFilter();
    });
  });

  applyFilter();
});
