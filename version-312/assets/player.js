function initPlayer(streamUrl) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playOverlay");
  var box = document.querySelector("[data-player-box]");
  var hlsInstance = null;
  var started = false;

  if (!video || !streamUrl) {
    return;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function attachStream() {
    if (started) {
      hideOverlay();
      playVideo();
      return;
    }
    started = true;
    hideOverlay();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
          video.src = streamUrl;
          playVideo();
        }
      });
      return;
    }

    video.src = streamUrl;
    playVideo();
  }

  if (overlay) {
    overlay.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      attachStream();
    });
  }

  if (box) {
    box.addEventListener("click", function (event) {
      if (event.target === video && video.paused) {
        attachStream();
      }
    });
  }

  video.addEventListener("play", hideOverlay);
  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
}
