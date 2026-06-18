(function () {
  var video = document.getElementById('player-video');
  var sourceNode = document.getElementById('player-source');
  var cover = document.querySelector('[data-player-cover]');

  if (!video || !sourceNode) {
    return;
  }

  var payload = {};
  try {
    payload = JSON.parse(sourceNode.textContent || '{}');
  } catch (error) {
    payload = {};
  }

  var source = payload.source;
  var attached = false;

  function attachSource() {
    if (!source || attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function startPlayback() {
    attachSource().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
    if (cover) {
      cover.style.display = 'none';
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });
})();
