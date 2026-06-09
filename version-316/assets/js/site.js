(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var dotsWrap = slider.querySelector("[data-hero-dots]");
        var active = 0;
        var timer = null;

        function drawDots() {
            if (!dotsWrap) {
                return;
            }
            dotsWrap.innerHTML = "";
            slides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = index === active ? "hero-dot is-active" : "hero-dot";
                dot.setAttribute("aria-label", "切换推荐 " + (index + 1));
                dot.addEventListener("click", function () {
                    go(index);
                });
                dotsWrap.appendChild(dot);
            });
        }

        function go(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            drawDots();
        }

        function play() {
            timer = window.setInterval(function () {
                go(active + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                go(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                go(active + 1);
                restart();
            });
        }
        go(0);
        play();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list]"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector("[data-movie-search]");
        var select = document.querySelector("[data-year-filter]");
        var empty = document.querySelector("[data-empty-state]");

        function filter() {
            var keyword = normalize(input ? input.value : "");
            var year = select ? select.value : "all";
            var visible = 0;
            lists.forEach(function (list) {
                Array.prototype.slice.call(list.children).forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" "));
                    var cardYear = card.getAttribute("data-year") || "";
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okYear = year === "all" || cardYear === year;
                    var show = okKeyword && okYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", filter);
        }
        if (select) {
            select.addEventListener("change", filter);
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

function setupVideoPlayer(streamUrl) {
    var player = document.querySelector("[data-video-player]");
    if (!player) {
        return;
    }
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var started = false;
    var hlsInstance = null;

    function attach() {
        if (!video || started) {
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        attach();
        video.controls = true;
        if (button) {
            button.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }
    player.addEventListener("click", function (event) {
        if (!started && event.target !== video) {
            play();
        }
    });
    video.addEventListener("click", function () {
        if (!started) {
            play();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
