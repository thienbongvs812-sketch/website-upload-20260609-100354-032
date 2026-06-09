function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', function () {
    panel.classList.toggle('open');
  });
}

function setupHeroCarousel() {
  var root = document.querySelector('[data-hero]');

  if (!root) {
    return;
  }

  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  var prev = root.querySelector('[data-hero-prev]');
  var next = root.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(target) {
    if (!slides.length) {
      return;
    }

    index = (target + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  function restart() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      restart();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
      restart();
    });
  });

  show(0);
  restart();
}

function setupCatalogSearch() {
  var input = document.querySelector('[data-catalog-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var empty = document.querySelector('[data-empty-state]');

  if (!input || !cards.length) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (query && input.hasAttribute('data-query-input')) {
    input.value = query;
  }

  function filter() {
    var keyword = input.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  input.addEventListener('input', filter);
  filter();
}

function initializePlayer(source) {
  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-play-overlay]');
  var hlsInstance = null;
  var attached = false;

  if (!video || !source) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start() {
    attach();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupCatalogSearch();
});
