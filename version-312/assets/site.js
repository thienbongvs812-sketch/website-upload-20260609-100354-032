(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var navLinks = document.querySelector("[data-nav-links]");
  var navSearch = document.querySelector(".nav-search");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
      if (navSearch) {
        navSearch.classList.toggle("is-open");
      }
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-empty");
    });
  });

  var backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var filterPanel = document.querySelector("[data-page-filter]");
  var list = document.querySelector("[data-card-list]");
  if (filterPanel && list) {
    var queryInput = document.getElementById("movieSearch");
    var yearFilter = document.getElementById("yearFilter");
    var categoryFilter = document.getElementById("categoryFilter");
    var sortFilter = document.getElementById("sortFilter");
    var clearButton = filterPanel.querySelector("[data-filter-clear]");
    var emptyResult = filterPanel.querySelector("[data-empty-result]");
    var initialCards = Array.prototype.slice.call(list.children);
    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get("q") || "";

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function getText(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-category") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
    }

    function sortCards(cards) {
      var value = sortFilter ? sortFilter.value : "score";
      return cards.slice().sort(function (a, b) {
        if (value === "year") {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }
        if (value === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
      });
    }

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var category = categoryFilter ? categoryFilter.value : "";
      var shown = 0;
      var sorted = sortCards(initialCards);

      sorted.forEach(function (card) {
        list.appendChild(card);
        var matchesQuery = !query || getText(card).indexOf(query) !== -1;
        var matchesYear = !year || (card.getAttribute("data-year") || "") === year;
        var matchesCategory = !category || (card.getAttribute("data-category") || "") === category;
        var visible = matchesQuery && matchesYear && matchesCategory;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });

      if (emptyResult) {
        emptyResult.classList.toggle("is-visible", shown === 0);
      }
    }

    [queryInput, yearFilter, categoryFilter, sortFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (queryInput) {
          queryInput.value = "";
        }
        if (yearFilter) {
          yearFilter.value = "";
        }
        if (categoryFilter) {
          categoryFilter.value = "";
        }
        if (sortFilter) {
          sortFilter.value = "score";
        }
        applyFilter();
      });
    }

    applyFilter();
  }
})();
