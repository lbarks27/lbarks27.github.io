(function () {
  function installGalleryVideos() {
    document.querySelectorAll(".gallery-item video").forEach((video) => {
      const item = video.closest(".gallery-item");
      if (!item) {
        return;
      }

      const playVideo = function () {
        video.currentTime = 0;
        const pendingPlay = video.play();
        if (pendingPlay && typeof pendingPlay.catch === "function") {
          pendingPlay.catch(function () {});
        }
      };

      const pauseVideo = function () {
        video.pause();
      };

      item.addEventListener("mouseenter", playVideo);
      item.addEventListener("focusin", playVideo);
      item.addEventListener("mouseleave", pauseVideo);
      item.addEventListener("focusout", pauseVideo);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installGalleryVideos, { once: true });
  } else {
    installGalleryVideos();
  }
})();
