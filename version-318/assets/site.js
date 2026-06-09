(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
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
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));
    var data = window.SiteMovieData || [];

    boxes.forEach(function (box) {
      var input = box.querySelector("[data-search-input]");
      var result = box.querySelector("[data-search-results]");

      if (!input || !result) {
        return;
      }

      input.addEventListener("input", function () {
        var query = text(input.value).trim();

        if (!query) {
          result.classList.remove("open");
          result.innerHTML = "";
          return;
        }

        var matches = data.filter(function (movie) {
          return text(movie.title).indexOf(query) !== -1 ||
            text(movie.region).indexOf(query) !== -1 ||
            text(movie.genre).indexOf(query) !== -1 ||
            text(movie.type).indexOf(query) !== -1 ||
            text(movie.year).indexOf(query) !== -1;
        }).slice(0, 8);

        if (!matches.length) {
          result.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
          result.classList.add("open");
          return;
        }

        result.innerHTML = matches.map(function (movie) {
          return '<a href="' + escapeHtml(movie.url) + '">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span>' +
            '</a>';
        }).join("");
        result.classList.add("open");
      });

      document.addEventListener("click", function (event) {
        if (!box.contains(event.target)) {
          result.classList.remove("open");
        }
      });
    });
  }

  function setupInlineFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

    inputs.forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]");

      if (!scope) {
        return;
      }

      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));

      input.addEventListener("input", function () {
        var query = text(input.value).trim();

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type")
          ].map(text).join(" ");

          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupInlineFilters();
  });
})();

function initializeMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);

  if (!video || !button || !source) {
    return;
  }

  var frame = video.closest(".player-frame");
  var hls = null;
  var prepared = false;
  var waiting = false;

  function markStarting() {
    if (frame) {
      frame.classList.add("is-starting");
    }
  }

  function markPlaying() {
    if (frame) {
      frame.classList.add("is-playing");
      frame.classList.remove("is-starting");
    }
    video.controls = true;
  }

  function markPaused() {
    if (frame) {
      frame.classList.remove("is-playing");
    }
  }

  function showCover() {
    if (frame) {
      frame.classList.remove("is-playing");
      frame.classList.remove("is-starting");
    }
  }

  function playVideo() {
    var promise = video.play();

    if (promise && typeof promise.then === "function") {
      promise.then(markPlaying).catch(showCover);
    } else {
      markPlaying();
    }
  }

  function bindSource(callback) {
    if (prepared) {
      callback();
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", callback, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, callback);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showCover();
          }
        }
      });
      return;
    }

    video.src = source;
    video.addEventListener("loadedmetadata", callback, { once: true });
    video.load();
  }

  function startPlayback() {
    if (waiting) {
      return;
    }

    waiting = true;
    markStarting();
    bindSource(function () {
      waiting = false;
      playVideo();
    });
  }

  button.addEventListener("click", startPlayback);

  video.addEventListener("click", function () {
    if (!prepared || video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", markPlaying);
  video.addEventListener("pause", markPaused);
  video.addEventListener("ended", showCover);

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
