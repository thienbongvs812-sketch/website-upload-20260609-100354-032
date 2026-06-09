(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 520) {
                backTop.classList.add("is-visible");
            } else {
                backTop.classList.remove("is-visible");
            }
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle("is-active", currentIndex === index);
            });

            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle("is-active", currentIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        restart();
    }

    var filterForm = document.querySelector("[data-page-filter]");
    var emptyState = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (filterForm && cards.length) {
        var input = filterForm.querySelector("input");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (input && query) {
            input.value = query;
        }

        function applyFilter() {
            var value = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        applyFilter();
    }
})();
