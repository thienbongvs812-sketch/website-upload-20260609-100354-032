function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var prev = document.querySelector(".hero-control.prev");
  var next = document.querySelector(".hero-control.next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  if (slides.length) {
    showSlide(0);
    startSlider();

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startSlider();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startSlider();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startSlider();
      });
    });
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chips button"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector(".empty-state");
  var activeFilter = "";

  function cardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function applySearch() {
    if (!cards.length) {
      return;
    }

    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");
    var shown = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchQuery = !query || text.indexOf(query) >= 0;
      var matchFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) >= 0;
      var visible = matchQuery && matchFilter;
      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", shown === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applySearch);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "";
      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applySearch();
    });
  });
});
