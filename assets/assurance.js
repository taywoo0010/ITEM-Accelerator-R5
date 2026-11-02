(function () {
  'use strict';
  const hosts = [...document.querySelectorAll('[data-assurance]')];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  hosts.forEach(host => {
    const viewport = host.querySelector('.trust-viewport');
    const panels = [...host.querySelectorAll('.trust-panel')];
    const navigation = host.querySelector('.trust-steps');
    const steps = [...host.querySelectorAll('[data-trust-step]')];
    const prev = host.querySelector('[data-trust-prev]');
    const next = host.querySelector('[data-trust-next]');
    const count = host.querySelector('.trust-count');
    const attachment = host.querySelector('.trust-attachment');
    const video = host.querySelector('[data-trust-video]');
    const play = host.querySelector('[data-trust-play]');
    const videoError = host.querySelector('.trust-video-error');
    const videoFile = host.querySelector('[data-trust-video-file]');
    const animations = new Set();
    let index = 0, scrollFrame = 0, motionFrame = 0, sliding = false, videoLoad, playRequest = 0;

    function syncIndicator() {
      const button = steps[index].getBoundingClientRect();
      const nav = navigation.getBoundingClientRect();
      navigation.style.setProperty('--trust-step-width', `${button.width}px`);
      navigation.style.setProperty('--trust-step-offset', `${button.left - nav.left}px`);
    }
    function activate(value) {
      index = Math.max(0, Math.min(panels.length - 1, value));
      panels.forEach((panel, i) => {
        panel.classList.toggle('is-active', i === index);
        panel.inert = i !== index;
        panel.setAttribute('aria-hidden', String(i !== index));
      });
      steps.forEach((step, i) => {
        step.setAttribute('aria-selected', String(i === index));
        step.tabIndex = i === index ? 0 : -1;
        if (i === index) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
      prev.disabled = index === 0;
      next.disabled = index === panels.length - 1;
      attachment.hidden = index !== panels.length - 1;
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
      syncIndicator();
    }
    function cancelMotion() {
      cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      sliding = false;
      viewport.classList.remove('is-transitioning');
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }
    function animate(element, keyframes, options) {
      if (!element || !element.animate) return;
      const animation = element.animate(keyframes, options);
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    }
    // Resolve beside the PDF so native, built and installation pages share one attachment folder.
    function mediaUrl(name) {
      return new URL(name, new URL(attachment.querySelector('a').getAttribute('href'), document.baseURI)).href;
    }
    async function prepareVideo() {
      if (video.getAttribute('src')) return;
      if (videoLoad) return videoLoad;
      videoLoad = loadVideo().catch(error => { videoLoad = null; throw error; });
      return videoLoad;
    }
    async function loadVideo() {
      const embedded = document.getElementById('assurance-video-data');
      if (embedded) {
        const binary = atob(embedded.textContent.trim());
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        video.src = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
        embedded.remove();
      } else {
        const url = mediaUrl(video.dataset.videoFile);
        if (new URL(url).protocol === 'file:') video.src = url;
        else {
          // The local preview server has no byte-range support; a Blob keeps native seeking usable.
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
          video.src = URL.createObjectURL(await response.blob());
        }
      }
      videoFile.href = video.src;
    }
    function pauseVideo() {
      // Invalidate a pending download so leaving and returning cannot resume it.
      playRequest++;
      video.pause();
      play.disabled = false;
      play.removeAttribute('aria-busy');
    }
    async function playVideo() {
      const request = ++playRequest;
      videoError.hidden = true;
      play.disabled = true;
      play.setAttribute('aria-busy', 'true');
      try {
        await prepareVideo();
        if (request !== playRequest || document.hidden) return;
        const meeting = window.ISS_MEETING;
        if (meeting && meeting.pages[meeting.current]?.id !== host.closest('.scene')?.id) return;
        video.controls = true;
        await video.play();
      } catch (error) {
        if (error.name === 'AbortError' || request !== playRequest) return;
        play.hidden = false;
        videoError.hidden = false;
      } finally {
        if (request === playRequest) {
          play.disabled = false;
          play.removeAttribute('aria-busy');
        }
      }
    }
    function reveal(panel, delay = 0) {
      if (motionPreference.matches) {
        animate(panel, [{ opacity: .85 }, { opacity: 1 }], { duration: 120 });
        return;
      }
      // A short group reveal supports the argument without animating every line of copy.
      [...panel.querySelectorAll('.trust-reveal')].filter(element => !element.closest('.trust-panel-footer')).forEach((element, i) => {
        animate(element, [
          { opacity: .55 },
          { opacity: 1 }
        ], { duration: 420, delay: delay + Math.min(i * 70, 140), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      });
      // Keep the shared callout baseline still while the new content settles.
      animate(panel.querySelector('.trust-panel-footer .discussion'), [{ opacity: .55 }, { opacity: 1 }],
        { duration: 300, delay, easing: 'ease-out', fill: 'backwards' });
      // Trace the evidence chain in reading order, finishing within 700 ms.
      [...panel.querySelectorAll('.trust-eval-stage')].forEach((stage, i) => {
        animate(stage, [
          { opacity: .5, transform: 'translateX(6px)' },
          { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 340, delay: delay + i * 130, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      });
      [...panel.querySelectorAll('.trust-eval-line')].forEach((line, i) => {
        animate(line, [{ clipPath: 'inset(-5px 100% -5px 0)' }, { clipPath: 'inset(-5px -5px -5px 0)' }],
          { duration: 240, delay: delay + 100 + i * 130, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      });
      // Draw reference scales, then reveal their fixed targets; never count up scores.
      [...panel.querySelectorAll('.trust-benchmark-scale')].forEach((scale, i) => {
        animate(scale, [{ clipPath: 'inset(-5px 100% -5px 0)' }, { clipPath: 'inset(-5px -5px -5px 0)' }],
          { duration: 320, delay: delay + 220 + i * 70, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        animate(scale.querySelector('.trust-benchmark-marker'), [
          { opacity: .35, transform: 'translate(-50%, -4px)' },
          { opacity: 1, transform: 'translate(-50%, 0)' }
        ], { duration: 180, delay: delay + 420 + i * 70, easing: 'ease-out', fill: 'backwards' });
      });
    }
    function go(value, instant = false) {
      const target = Math.max(0, Math.min(panels.length - 1, value));
      const changed = target !== index;
      cancelMotion();
      activate(target);
      const start = viewport.scrollLeft;
      const end = index * viewport.clientWidth;
      if (instant || motionPreference.matches || Math.abs(end - start) < 1) {
        viewport.scrollTo({ left: end, behavior: 'instant' });
        if (changed && !instant) reveal(panels[index]);
        return;
      }
      sliding = true;
      viewport.classList.add('is-transitioning');
      if (changed) reveal(panels[index], 80);
      const started = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - started) / 420);
        viewport.scrollTo({ left: start + (end - start) * easeOut(progress), behavior: 'instant' });
        if (progress < 1) motionFrame = requestAnimationFrame(tick);
        else {
          motionFrame = 0;
          sliding = false;
          viewport.classList.remove('is-transitioning');
        }
      }
      motionFrame = requestAnimationFrame(tick);
    }
    function step(delta) {
      if (index + delta < 0 || index + delta >= panels.length) return false;
      go(index + delta);
      return true;
    }
    steps.forEach((button, i) => button.addEventListener('click', () => go(i)));
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    if (!video.poster) video.poster = mediaUrl(video.dataset.posterFile);
    if (!document.getElementById('assurance-video-data')) videoFile.href = mediaUrl(video.dataset.videoFile);
    video.controls = false;
    play.addEventListener('click', playVideo);
    video.addEventListener('play', () => { play.hidden = true; videoError.hidden = true; });
    video.addEventListener('error', () => { videoError.hidden = false; play.hidden = false; });
    viewport.addEventListener('scroll', () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (sliding || !viewport.clientWidth) return;
        const selected = Math.round(viewport.scrollLeft / viewport.clientWidth);
        if (selected !== index) activate(selected);
      });
    }, { passive: true });
    // Native gestures take control immediately; repeated navigation starts from the current position.
    ['pointerdown', 'touchstart', 'wheel'].forEach(type => viewport.addEventListener(type, cancelMotion, { passive: true }));
    if ('ResizeObserver' in window) {
      let width = viewport.clientWidth;
      new ResizeObserver(() => {
        const nextWidth = viewport.clientWidth;
        if (!nextWidth) return;
        if (nextWidth !== width) { width = nextWidth; go(index, true); }
        else syncIndicator();
      }).observe(viewport);
    }
    if ('IntersectionObserver' in window) {
      const entrance = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        if (!sliding) reveal(panels[index]);
        entrance.disconnect();
      }, { threshold: .15 });
      entrance.observe(host);
      const playbackVisibility = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.intersectionRatio >= .1) && !document.fullscreenElement?.contains(video)) pauseVideo();
      }, { threshold: .1 });
      playbackVisibility.observe(video);
    }
    motionPreference.addEventListener('change', () => go(index, true));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      pauseVideo();
      go(index, true);
    });
    window.addEventListener('beforeprint', () => { pauseVideo(); go(index, true); });
    activate(0);
    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      if (document.querySelector('dialog[open]') || event.target.isContentEditable || event.target.closest?.('input,textarea,select')) return;
      const meeting = window.ISS_MEETING;
      if (!meeting || meeting.pages[meeting.current]?.id !== host.closest('.scene')?.id) return;
      // Video keeps native seeking; tab navigation never resets or pauses playback.
      if (event.target.closest?.('video')) { event.stopPropagation(); return; }
      if (navigation.contains(event.target)) {
        const target = (index + (event.key === 'ArrowRight' ? 1 : -1) + panels.length) % panels.length;
        go(target);
        steps[target].focus({ preventScroll: true });
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (step(event.key === 'ArrowRight' ? 1 : -1)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, { capture: true });
  });
})();
