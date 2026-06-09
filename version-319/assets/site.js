(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('.js-global-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './library.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAuto();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startAuto();
      });
    });

    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    showSlide(0);
    startAuto();
  }

  var pageSearch = document.querySelector('[data-page-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  var activeCategory = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var keyword = normalize(pageSearch ? pageSearch.value : '');
    cards.forEach(function (card) {
      var category = card.getAttribute('data-category') || '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
      var categoryMatch = activeCategory === 'all' || category === activeCategory;
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(categoryMatch && keywordMatch));
    });
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      pageSearch.value = query;
    }
    pageSearch.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-category') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });

  applyFilters();

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var hlsInstance = null;

    function attachAndPlay() {
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-video-url');
      if (!url) {
        return;
      }
      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        video.dataset.ready = '1';
      }
      box.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', attachAndPlay);
    }

    box.addEventListener('click', function (event) {
      if (event.target === video || event.target === box) {
        attachAndPlay();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
        hlsInstance.stopLoad();
      }
    });
  });
})();
