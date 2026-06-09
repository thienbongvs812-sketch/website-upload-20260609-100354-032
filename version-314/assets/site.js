(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
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
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
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

  function bindSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll(".site-search-form"), function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
        }
      });
    });
  }

  function bindFilters() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter-section]"), function (section) {
      var search = section.querySelector("[data-filter-search]");
      var year = section.querySelector("[data-filter-year]");
      var type = section.querySelector("[data-filter-type]");
      var region = section.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card-grid] .movie-card, [data-card-grid] .rank-table-row"));
      var empty = section.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && search) {
        search.value = query;
      }

      function pass(card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var q = search ? normalize(search.value) : "";
        var y = year ? normalize(year.value) : "";
        var t = type ? normalize(type.value) : "";
        var r = region ? normalize(region.value) : "";
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          return false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          return false;
        }
        if (r && normalize(card.getAttribute("data-region")) !== r) {
          return false;
        }
        return true;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = pass(card);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var cover = document.querySelector(".player-cover");
      var button = document.querySelector("[data-player-start]");
      var prepared = false;
      var hlsInstance = null;

      if (!video || !streamUrl) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        prepare();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    bindMenu();
    bindHero();
    bindSearchForms();
    bindFilters();
  });
})();
