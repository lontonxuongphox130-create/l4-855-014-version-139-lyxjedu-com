(function () {
  const video = document.querySelector('[data-player-video]');
  const cover = document.querySelector('[data-player-cover]');
  const message = document.querySelector('[data-player-message]');
  let ready = false;
  let hls = null;

  function sourceUrl() {
    if (!video) {
      return '';
    }
    const source = video.querySelector('source');
    return source ? source.getAttribute('src') : video.getAttribute('src');
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepare() {
    if (!video || ready) {
      return;
    }
    const url = sourceUrl();
    if (!url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage('');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setMessage('视频暂时无法加载');
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }
    ready = true;
  }

  function play() {
    prepare();
    if (!video) {
      return;
    }
    if (cover) {
      cover.classList.add('hidden');
    }
    video.play().catch(function () {
      setMessage('请再次点击播放');
    });
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (!video.ended && cover) {
        cover.classList.remove('hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
