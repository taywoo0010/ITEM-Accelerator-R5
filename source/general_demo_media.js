(() => {
  const root = document.documentElement;
  const englishMedia = JSON.parse(document.getElementById('general-demo-media').textContent);
  const players = Array.from(document.querySelectorAll('.scene'), scene => {
    const player = scene.querySelector('video, iframe');
    if (!player) return null;
    const slot = player.closest('.video-slot, .video-stage, .cinema') || player.parentElement;
    const chineseSource = player.getAttribute('src') || player.querySelector('source[src]')?.getAttribute('src');
    const original = Array.from(slot.childNodes);
    return { scene, slot, chineseSource, original };
  }).filter(Boolean);

  let currentLanguage = 'zh';
  function updateMedia() {
    const language = root.dataset.lang;
    if (language === currentLanguage) return;
    currentLanguage = language;
    for (const { scene, slot, chineseSource, original } of players) {
      slot.querySelector('video')?.pause();
      if (language !== 'en') {
        slot.replaceChildren(...original);
        continue;
      }

      const english = englishMedia[scene.id];
      if (english?.src) {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.src = english.src;
        if (english.poster) video.poster = english.poster;
        video.setAttribute('aria-label', 'English demo video');
        slot.replaceChildren(video);
        continue;
      }

      const status = document.createElement('div');
      status.className = 'general-demo-media-status';
      const message = document.createElement('p');
      message.textContent = 'English video coming soon.';
      status.append(message);
      if (chineseSource) {
        const link = document.createElement('a');
        link.href = chineseSource;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open Chinese version in a new tab';
        status.append(link);
      }
      slot.replaceChildren(status);
    }
  }

  new MutationObserver(updateMedia).observe(root, {
    attributes: true,
    attributeFilter: ['data-lang'],
  });
  updateMedia();
})();
