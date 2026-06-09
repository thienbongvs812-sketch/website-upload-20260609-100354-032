(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuToggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        start();
    }

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    var filterPanel = qs('[data-filter-panel]');
    if (filterPanel) {
        var input = qs('[data-filter-input]', filterPanel);
        var yearFilter = qs('[data-year-filter]', filterPanel);
        var regionFilter = qs('[data-region-filter]', filterPanel);
        var typeFilter = qs('[data-type-filter]', filterPanel);
        var clear = qs('[data-filter-clear]', filterPanel);
        var cards = qsa('[data-card-list] .movie-card');

        function norm(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = norm(input ? input.value : '');
            var year = yearFilter ? yearFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            cards.forEach(function (card) {
                var text = norm(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesType = !type || card.getAttribute('data-type') === type;
                card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesRegion && matchesType));
            });
        }

        if (preset && input) {
            input.value = preset;
        }
        [input, yearFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                if (regionFilter) {
                    regionFilter.value = '';
                }
                if (typeFilter) {
                    typeFilter.value = '';
                }
                applyFilter();
            });
        }
        applyFilter();
    }

    var player = qs('[data-player]');
    if (player) {
        var video = qs('[data-video-player]', player);
        var buttons = qsa('[data-play-toggle]', player);
        var mute = qs('[data-mute-toggle]', player);
        var fullscreen = qs('[data-fullscreen-toggle]', player);
        var hlsInstance = null;
        var ready = false;

        function attachStream() {
            if (!video || ready) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            ready = true;
        }

        function sync() {
            if (!video) {
                return;
            }
            player.classList.toggle('is-playing', !video.paused && !video.ended);
            buttons.forEach(function (button) {
                button.textContent = video.paused ? '播放' : '暂停';
            });
            if (mute) {
                mute.textContent = video.muted ? '取消静音' : '静音';
            }
        }

        function togglePlay() {
            attachStream();
            if (!video) {
                return;
            }
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', togglePlay);
        });
        if (video) {
            video.addEventListener('click', togglePlay);
            video.addEventListener('play', sync);
            video.addEventListener('pause', sync);
            video.addEventListener('ended', sync);
        }
        if (mute && video) {
            mute.addEventListener('click', function () {
                video.muted = !video.muted;
                sync();
            });
        }
        if (fullscreen) {
            fullscreen.addEventListener('click', function () {
                var target = player;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (target.requestFullscreen) {
                    target.requestFullscreen();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
        attachStream();
        sync();
    }
})();
