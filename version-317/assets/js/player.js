function initMoviePlayer(videoId, sourceUrl, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var hlsInstance = null;

  function bindSource() {
    if (loaded || !video || !sourceUrl) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function start() {
    bindSource();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("play", bindSource);
    video.addEventListener("ended", function () {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
