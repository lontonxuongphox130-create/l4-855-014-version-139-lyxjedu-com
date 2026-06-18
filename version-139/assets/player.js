
(function () {
  var shell = document.querySelector('.player-shell');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var mask = shell.querySelector('.play-mask');
  var stream = shell.getAttribute('data-stream');
  var loaded = false;

  function loadVideo() {
    if (loaded || !stream || !video) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls) {
      var hls = new Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function playVideo() {
    loadVideo();
    shell.classList.add('is-playing');
    var action = video.play();
    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
})();
