// Deterministic scene engine: every visual state is a pure function of scene-local time t,
// so the preview can scrub anywhere and the renderer can capture frame by frame.
(() => {
  const registry = {};
  window.Scene = (id, opts, build) => { registry[id] = { id, opts, build }; };

  const ease = {
    linear: (p) => p,
    out: (p) => 1 - Math.pow(1 - p, 3),
    in: (p) => p * p * p,
    inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    back: (p) => { const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
  };

  const TRANSFORM = ['x', 'y', 'scale', 'rotate'];
  const UNIT = { x: 'px', y: 'px', width: 'px', height: 'px', left: 'px', top: 'px', opacity: '', scale: '', rotate: 'deg', clip: '%', blur: 'px' };

  function splitCaption(text) {
    // Break a narration segment into caption chunks at punctuation, about 30 characters each;
    // a chunk never runs on past the end of a sentence.
    const parts = text.match(/[^，。；：！？,;]+[，。；：！？,;]?/g) || [text];
    const chunks = [];
    let current = '';
    for (const part of parts) {
      if (current && ((current + part).length > 30 || /[。！？]$/.test(current))) { chunks.push(current); current = part; } else current += part;
    }
    if (current) chunks.push(current);
    return chunks.map((chunk) => chunk.replace(/[，。；：,;]$/, ''));
  }

  function buildScene(id, timing) {
    const entry = registry[id];
    const root = document.createElement('div');
    root.className = 'scene';
    root.dataset.scene = id;
    const tracks = new Map();   // el -> { prop -> [seg] }
    const classes = [];         // { el, name, t0, t1 }
    const texts = new Map();    // el -> { initial, keys: [[t, html]] }
    const fns = [];
    const segs = timing?.segments ?? {};
    const D = timing?.duration ?? 8;

    const resolve = (target) => (typeof target === 'string' ? root.querySelectorAll(target) : target instanceof Element ? [target] : target);
    const S = (segId, offset = 0) => (segs[segId] ? segs[segId].start + offset : offset);
    const E = (segId, offset = 0) => (segs[segId] ? segs[segId].end + offset : offset);

    function anim(target, t0, dur, props, easing = 'out') {
      for (const el of resolve(target)) {
        if (!tracks.has(el)) tracks.set(el, {});
        const elTracks = tracks.get(el);
        for (const [prop, value] of Object.entries(props)) {
          const [from, to] = Array.isArray(value) ? value : [undefined, value];
          (elTracks[prop] ||= []).push({ t0, t1: t0 + dur, from, to, ease: ease[easing] || easing });
        }
      }
      return t0 + dur;
    }
    function locate(x, y) {
      if (typeof x !== 'string') return [x, y];
      const el = root.querySelector(x);
      const stage = document.getElementById('stage').getBoundingClientRect();
      const scale = stage.width / 1920;
      if (!el) return [960, 540];
      // Measure the rest layout: clear transforms the engine animates on the element and its ancestors.
      const saved = [];
      for (let node = el; node && node !== root; node = node.parentElement) {
        if (tracks.has(node)) { saved.push([node, node.style.transform]); node.style.transform = ''; }
      }
      const r = el.getBoundingClientRect();
      for (const [node, transform] of saved) node.style.transform = transform;
      const [dx, dy] = Array.isArray(y) ? y : [0, 0];
      return [(r.left + r.width / 2 - stage.left) / scale + dx, (r.top + r.height / 2 - stage.top) / scale + dy];
    }
    // Measure a target as laid out at time `at`: render that frame, measure, then restore the current frame.
    // Pure renders make this safe; `measuring` keeps pointer/tap callbacks from recursing.
    let measuring = false, lastT = 0;
    function locateAt(at, x, y) {
      if (typeof x !== 'string') return [x, y];
      // Tracks without a `from` (hide(), …) leave their value untouched before t0, so restore inline styles verbatim.
      const saved = [...tracks.keys()].map((el) => [el, el.style.cssText]);
      measuring = true;
      render(at);
      const point = locate(x, y);
      render(lastT);
      for (const [el, css] of saved) el.style.cssText = css;
      measuring = false;
      return point;
    }
    const api = {
      root, D, S, E, segs, ease,
      $: (sel) => root.querySelector(sel),
      $$: (sel) => [...root.querySelectorAll(sel)],
      anim,
      show: (target, t0, dur = 0.45, dy = 18) => anim(target, t0, dur, { opacity: [0, 1], y: [dy, 0] }),
      fadeIn: (target, t0, dur = 0.4) => anim(target, t0, dur, { opacity: [0, 1] }),
      hide: (target, t0, dur = 0.3) => anim(target, t0, dur, { opacity: 0 }),
      pop: (target, t0, dur = 0.45) => anim(target, t0, dur, { opacity: [0, 1], scale: [0.86, 1] }, 'back'),
      slideIn: (target, t0, dx = 60, dur = 0.5) => anim(target, t0, dur, { opacity: [0, 1], x: [dx, 0] }),
      stagger: (target, t0, step = 0.12, fn = 'show') => resolve(target).forEach((el, index) => api[fn](el, t0 + index * step)),
      cls: (target, name, t0, t1 = Infinity) => { for (const el of resolve(target)) classes.push({ el, name, t0, t1 }); },
      text: (target, t0, html) => {
        for (const el of resolve(target)) {
          if (!texts.has(el)) texts.set(el, { initial: el.innerHTML, keys: [] });
          texts.get(el).keys.push([t0, arrowHtml(html)]);
        }
      },
      type: (target, t0, str, cps = 22, until = Infinity) => {
        const dur = str.length / cps;
        for (const el of resolve(target)) {
          const initial = el.innerHTML;
          fns.push((t) => {
            if (t < t0 || t >= until) return;
            const shown = Math.min(str.length, Math.floor((t - t0) * cps));
            const html = escapeHtml(str.slice(0, shown)) + (t < t0 + dur + 0.6 && Math.floor(t * 2.4) % 2 === 0 ? '<span class="caret"></span>' : '');
            if (el.__typed !== html) { el.innerHTML = html; el.__typed = html; }
          });
          fns.push((t) => { if (t < t0 && el.__typed !== undefined) { el.innerHTML = initial; el.__typed = undefined; } });
        }
        return t0 + dur;
      },
      count: (target, t0, dur, from, to, format = (v) => Math.round(v)) => {
        for (const el of resolve(target)) fns.push((t) => {
          const p = Math.min(1, Math.max(0, (t - t0) / dur));
          el.textContent = format(from + (to - from) * ease.out(p));
        });
      },
      fn: (callback) => fns.push(callback),
      // atKey: measure the target in the layout of time t0 (for scenes whose layout itself changes over time).
      tap: (x, y, t0, { atKey = false } = {}) => {
        const ripple = document.createElement('div');
        ripple.className = 'tap';
        const place = () => { const [px, py] = atKey ? locateAt(t0, x, y) : locate(x, y); ripple.style.left = `${px}px`; ripple.style.top = `${py}px`; };
        if (typeof x === 'string') fns.push(() => { if (!ripple.__placed && !measuring) { place(); ripple.__placed = true; } });
        else place();
        root.appendChild(ripple);
        anim(ripple, t0, 0.55, { opacity: [0.9, 0], scale: [0.3, 1.6] }, 'out');
        anim(ripple, t0 - 0.001, 0, { opacity: [0, 0] });
        return t0 + 0.3;
      },
      // Pointer: keyframes [[t, x, y, action], ...] in stage coordinates. action true = tap at that key;
      // 'hold' = pressed from that key until the next one. { touch: true } draws a finger touch (as Android's
      // "show touches") instead of a mouse arrow: visible only while touching, a pulsing ring while held.
      // { atKey: true } measures each selector key in the layout of its own time instead of the first rendered frame.
      pointer: (rawKeys, { touch = false, atKey = false } = {}) => {
        const el = document.createElement('div');
        el.className = touch ? 'pointer touch' : 'pointer';
        el.innerHTML = touch ? '<span class="tring"></span><span class="tdot"></span>'
          : '<svg viewBox="0 0 24 24" width="34" height="34"><path d="M5 3l14 8-6 1.6L10 19z" fill="#1f2933" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
        root.appendChild(el);
        const ring = el.querySelector('.tring'), dot = el.querySelector('.tdot');
        let resolved;
        fns.push((t) => {
          if (measuring) return;
          if (!resolved) resolved = rawKeys.map(([kt, kx, ky, action]) => [kt, ...(atKey ? locateAt(kt, kx, ky) : locate(kx, ky)), action]);
          const keys = resolved;
          const first = keys[0], last = keys[keys.length - 1];
          let x = first[1], y = first[2];
          for (let i = 1; i < keys.length; i++) {
            const [ta, xa, ya] = keys[i - 1], [tb, xb, yb] = keys[i];
            if (t >= tb) { x = xb; y = yb; continue; }
            if (t > ta) { const p = ease.inOut((t - ta) / (tb - ta)); x = xa + (xb - xa) * p; y = ya + (yb - ya) * p; }
            break;
          }
          el.style.transform = `translate(${x}px, ${y}px)`;
          if (!touch) { el.style.opacity = t < first[0] - 0.3 || t > last[0] + 0.8 ? 0 : 1; return; }
          // Touch: on screen only around a tap or through a hold.
          let opacity = 0, press = 0, held = -1;
          keys.forEach(([kt, , , action], i) => {
            if (action === true && t > kt - 0.18 && t < kt + 0.3) {
              opacity = Math.max(opacity, t < kt ? (t - (kt - 0.18)) / 0.18 : 1 - Math.max(0, t - kt - 0.12) / 0.18);
              press = Math.max(press, 1 - Math.abs(t - kt) / 0.18);
            }
            if (action === 'hold' && keys[i + 1] && t >= kt - 0.12 && t < keys[i + 1][0] + 0.18) {
              const end = keys[i + 1][0];
              opacity = Math.max(opacity, t < kt ? (t - (kt - 0.12)) / 0.12 : t > end ? 1 - (t - end) / 0.18 : 1);
              press = 1; held = t - kt;
            }
          });
          el.style.opacity = Math.max(0, Math.min(1, opacity));
          dot.style.transform = `scale(${1 - 0.12 * Math.max(0, Math.min(1, press))})`;
          dot.classList.toggle('held', held >= 0);
          const cycle = held >= 0 ? (held % 1.1) / 1.1 : 0;
          ring.style.opacity = held >= 0 ? 0.55 * (1 - cycle) : 0;
          ring.style.transform = `scale(${1 + cycle * 1.1})`;
        });
        rawKeys.forEach(([t, x, y, action]) => { if (action === true) api.tap(x, y, t, { atKey }); });
      },
    };

    // hideTag(t): the evidence tag leaves the screen from t on (end cards cover the whole frame).
    let tagOff = Infinity;
    api.hideTag = (t) => { tagOff = t; };

    root.innerHTML = '';
    if (entry) { entry.build(api); iconArrows(root); }
    else root.innerHTML = `<div class="placeholder"><div class="ph-id">${id}</div><div>${Object.values(segs).map((seg) => escapeHtml(seg.text)).join('<br><br>')}</div></div>`;

    function render(t) {
      if (!measuring) lastT = t;
      for (const [el, props] of tracks) {
        const values = {};
        for (const [prop, list] of Object.entries(props)) {
          let value;
          const sorted = list.slice().sort((a, b) => a.t0 - b.t0);
          if (t < sorted[0].t0) value = sorted[0].from;
          else {
            let previous;
            for (const seg of sorted) {
              if (seg.t0 > t) break;
              const from = seg.from ?? previous ?? seg.to;
              if (t >= seg.t1) value = seg.to;
              else value = from + (seg.to - from) * seg.ease((t - seg.t0) / (seg.t1 - seg.t0));
              previous = value;
            }
          }
          if (value !== undefined) values[prop] = value;
        }
        const transform = [];
        if (values.x !== undefined || values.y !== undefined) transform.push(`translate(${values.x ?? 0}px, ${values.y ?? 0}px)`);
        if (values.scale !== undefined) transform.push(`scale(${values.scale})`);
        if (values.rotate !== undefined) transform.push(`rotate(${values.rotate}deg)`);
        if (transform.length) el.style.transform = transform.join(' ');
        for (const [prop, value] of Object.entries(values)) {
          if (TRANSFORM.includes(prop)) continue;
          if (prop === 'clip') el.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
          else if (prop === 'clipY') el.style.clipPath = `inset(0 0 ${100 - value}% 0)`;
          else if (prop === 'blur') el.style.filter = `blur(${value}px)`;
          else if (prop === 'draw') el.style.strokeDashoffset = `${1 - value}`;
          else el.style[prop] = `${value}${UNIT[prop] ?? ''}`;
        }
      }
      for (const { el, name, t0, t1 } of classes) el.classList.toggle(name, t >= t0 && t < t1);
      for (const [el, { initial, keys }] of texts) {
        let html = initial;
        for (const [t0, value] of keys) if (t >= t0) html = value;
        if (el.__html !== html) { el.innerHTML = html; el.__html = html; }
      }
      for (const fn of fns) fn(t);
    }
    return { id, root, render, duration: D, opts: entry?.opts ?? {}, segs, get tagOff() { return tagOff; } };
  }

  // Text arrows (→) render as the Lucide arrow-right icon, sized and coloured like the text around them.
  // Code boxes keep the literal character.
  const ARROW = () => window.UI.icon('arrowRight', '0.95em', 'currentColor', 2.2).replace('class="icon"', 'class="icon ar"');
  const arrowHtml = (html) => (html.includes('→') ? html.replace(/→/g, ARROW()) : html);
  function iconArrows(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.nodeValue.includes('→') && !node.parentElement.closest('.codebox, svg') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const span = document.createElement('span');
      span.innerHTML = escapeHtml(node.nodeValue).replace(/→/g, ARROW());
      node.replaceWith(...span.childNodes);
    }
  }

  function escapeHtml(text) {
    return text.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  }

  // ── Player ────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const renderMode = params.has('render');
    const only = params.get('scene');
    document.body.classList.toggle('render', renderMode);
    const stage = document.getElementById('stage');
    const sceneHost = document.getElementById('scenes');
    const caption = document.getElementById('caption');
    const tag = document.getElementById('tag');
    const order = Object.keys(window.TIMING.scenes);
    const scenes = [];
    let offset = 0;
    for (const id of order) {
      if (renderMode && only && id !== only) { offset += window.TIMING.scenes[id].duration; continue; }
      const scene = buildScene(id, window.TIMING.scenes[id]);
      scene.offset = offset;
      scene.captions = Object.entries(scene.segs).flatMap(([, seg]) => {
        const chunks = splitCaption(seg.text);
        const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        let cursor = seg.start;
        return chunks.map((chunk) => {
          const start = cursor;
          cursor += ((seg.end - seg.start) * chunk.length) / total;
          return { start, end: cursor, text: chunk };
        });
      });
      offset += scene.duration;
      sceneHost.appendChild(scene.root);
      scenes.push(scene);
    }
    const total = offset;
    let active;

    function renderScene(scene, t) {
      if (active !== scene) {
        scenes.forEach((s) => { s.root.style.display = s === scene ? '' : 'none'; });
        active = scene;
        tag.innerHTML = scene.opts.tag ? `<span class="tag-dot ${scene.opts.tagKind || ''}"></span>${scene.opts.tag}` : '';
        tag.style.display = scene.opts.tag ? '' : 'none';
        // Split-view scenes keep captions over the left pane so they never cover the Agent composer.
        caption.style.right = scene.opts.captionRight ? `${scene.opts.captionRight}px` : '';
      }
      scene.render(t);
      tag.style.opacity = t >= scene.tagOff ? 0 : '';
      // holdEnd: the closing scene stays on its last frame instead of fading to the empty canvas.
      const fadeIn = Math.min(1, t / 0.35), fadeOut = scene.opts.holdEnd ? 1 : Math.min(1, (scene.duration - t) / 0.35);
      scene.root.style.opacity = Math.max(0, Math.min(fadeIn, fadeOut));
      const current = scene.captions.find((c) => t >= c.start && t < c.end + 0.15);
      const html = current ? current.text : '';
      if (caption.__html !== html) { caption.innerHTML = html ? `<span>${html}</span>` : ''; caption.__html = html; }
    }

    function seekGlobal(time) {
      const scene = scenes.find((s) => time < s.offset + s.duration) || scenes[scenes.length - 1];
      renderScene(scene, Math.max(0, time - scene.offset));
      return scene;
    }

    if (renderMode) {
      const scene = scenes[0];
      window.__duration = scene.duration;
      window.__seek = (t) => renderScene(scene, t);
      window.__ready = true;
      renderScene(scene, 0);
      return;
    }

    // Preview controls: audio drives the clock when available.
    const audio = new Audio('audio/narration.m4a');
    window.__audio = audio;
    let audioOk = false;
    audio.addEventListener('loadedmetadata', () => { audioOk = true; });
    audio.addEventListener('error', () => { audioOk = false; });
    // R5 embed: a static server without Range support (python -m http.server) leaves the audio unseekable;
    // fetch it once as a blob, which the browser can always seek.
    audio.addEventListener('loadedmetadata', () => {
      const seekable = audio.seekable.length && audio.seekable.end(0) >= audio.duration - 1;
      if (seekable || audio.src.startsWith('blob:')) return;
      fetch(audio.src).then((res) => res.blob()).then((blob) => {
        const at = audio.currentTime, wasPlaying = !audio.paused;
        audio.src = URL.createObjectURL(blob);
        audio.currentTime = at;
        if (wasPlaying) audio.play();
      }).catch(() => {});
    });
    let playing = false, clock = 0, last = 0, rate = 1;
    const RATES = [0.75, 1, 1.25, 1.5, 2];
    const $ = (id) => document.getElementById(id);
    const { icon } = window.UI;
    const bar = $('bar'), track = $('track'), thumb = $('thumb'), hoverTip = $('hoverTip');
    const sceneButton = $('sceneButton'), sceneMenu = $('sceneMenu'), rateButton = $('rateButton'), rateMenu = $('rateMenu');
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const sceneNo = (scene) => String(scenes.indexOf(scene)).padStart(2, '0');
    const sceneTitle = (scene) => scene.opts.title || scene.id;
    const sceneAt = (time) => scenes.find((s) => time < s.offset + s.duration) || scenes[scenes.length - 1];
    $('prevScene').innerHTML = icon('skipBack', 18);
    $('nextScene').innerHTML = icon('skipForward', 18);
    sceneButton.querySelector('.chev').innerHTML = icon('chevronUp', 16);
    rateButton.querySelector('.chev').innerHTML = icon('chevronUp', 16);
    $('timeTotal').textContent = fmt(total);
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', total.toFixed(1));

    // Menus open upward from the bar; one at a time, closed by outside click or Escape.
    const menus = [[sceneButton, sceneMenu], [rateButton, rateMenu]];
    function closeMenus() {
      for (const [button, menu] of menus) { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); }
    }
    for (const [button, menu] of menus) {
      button.onclick = (event) => {
        event.stopPropagation();
        const open = menu.hidden;
        closeMenus();
        if (!open) return;
        menu.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        menu.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
      };
    }
    document.addEventListener('click', (event) => { if (!event.target.closest('.menu')) closeMenus(); });
    const menuItem = (html, onPick) => {
      const item = document.createElement('button');
      item.className = 'menu-item';
      item.setAttribute('role', 'option');
      item.innerHTML = html;
      item.onclick = () => { closeMenus(); onPick(); };
      return item;
    };

    scenes.forEach((scene, index) => {
      scene.menuItem = menuItem(
        `<span class="no">${sceneNo(scene)}</span><span class="name">${sceneTitle(scene)}</span><span class="at">${fmt(scene.offset)}</span>`,
        () => setTime(scene.offset + 0.02),
      );
      sceneMenu.appendChild(scene.menuItem);
      // Segments sit at their exact share of the timeline; the gap comes out of each segment's end.
      scene.segment = document.createElement('div');
      scene.segment.className = 'tl-seg';
      scene.segment.style.left = `${(scene.offset / total) * 100}%`;
      scene.segment.style.width = `calc(${(scene.duration / total) * 100}%${index < scenes.length - 1 ? ' - 3px' : ''})`;
      scene.segment.innerHTML = '<div class="fill"></div>';
      scene.fill = scene.segment.firstChild;
      $('segments').appendChild(scene.segment);
    });

    const rateItems = RATES.map((value) => {
      const item = menuItem(`<span class="tick">${icon('check', 16)}</span><span class="name">${value}×</span>`, () => setRate(value));
      item.dataset.rate = value;
      rateMenu.appendChild(item);
      return item;
    });
    function setRate(value) {
      rate = RATES.includes(Number(value)) ? Number(value) : 1;
      $('rateText').textContent = `${rate}×`;
      rateItems.forEach((item) => item.setAttribute('aria-selected', String(Number(item.dataset.rate) === rate)));
      audio.playbackRate = rate;
      audio.preservesPitch = true;
      try { localStorage.setItem('demoRate', String(rate)); } catch { /* storage unavailable */ }
    }
    try { setRate(localStorage.getItem('demoRate') || 1); } catch { setRate(1); }

    // Paused at 0:00 the title is still empty (everything fades in), so show
    // its settled frame as a poster until playback starts.
    const viewport = $('viewport');
    let shownScene;
    function setTime(time, fromAudio = false) {
      clock = Math.max(0, Math.min(total, time));
      if (!fromAudio && audioOk) audio.currentTime = clock;
      const poster = !playing && clock === 0;
      viewport.classList.toggle('poster', poster);
      const scene = poster ? scenes[0] : seekGlobal(clock);
      if (poster) renderScene(scene, scene.duration - 0.5);
      thumb.style.left = `${(clock / total) * 100}%`;
      for (const s of scenes) s.fill.style.width = `${Math.max(0, Math.min(1, (clock - s.offset) / s.duration)) * 100}%`;
      if (shownScene !== scene) {
        shownScene?.segment.classList.remove('current');
        shownScene?.menuItem.setAttribute('aria-selected', 'false');
        scene.segment.classList.add('current');
        scene.menuItem.setAttribute('aria-selected', 'true');
        $('sceneNo').textContent = sceneNo(scene);
        $('sceneName').textContent = sceneTitle(scene);
        shownScene = scene;
      }
      const local = (clock - scene.offset).toFixed(1);
      $('sceneTime').textContent = `${local}s`;
      $('timeNow').textContent = fmt(clock);
      track.setAttribute('aria-valuenow', clock.toFixed(1));
      track.setAttribute('aria-valuetext', `${fmt(clock)} · ${sceneTitle(scene)}`);
      $('label').textContent = `${scene.id} · ${local}s   |   ${fmt(clock)} / ${fmt(total)}`;
      history.replaceState(null, '', `?t=${clock.toFixed(1)}`);
    }
    function toggle() {
      playing = !playing;
      $('play').innerHTML = icon(playing ? 'pause' : 'play', 18);
      $('play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
      if (playing && audioOk) { audio.currentTime = clock; audio.playbackRate = rate; audio.play(); } else audio.pause();
      if (clock === 0) setTime(0, true);
      last = performance.now();
    }
    $('play').innerHTML = icon('play', 18);
    function tick(now) {
      if (playing) {
        if (audioOk && !audio.paused) setTime(audio.currentTime, true);
        else setTime(clock + ((now - last) / 1000) * rate, true);
        if (clock >= total) toggle();
      }
      last = now;
      requestAnimationFrame(tick);
    }
    const stepScene = (delta) => {
      const index = scenes.indexOf(sceneAt(clock));
      const target = scenes[Math.max(0, Math.min(scenes.length - 1, index + delta))];
      setTime(target.offset + 0.02);
    };
    $('play').onclick = toggle;
    $('viewport').addEventListener('click', () => { if ($('viewport').classList.contains('poster')) toggle(); });
    $('prevScene').onclick = () => stepScene(-1);
    $('nextScene').onclick = () => stepScene(1);

    // Timeline: click or drag to seek; hover shows which scene a point belongs to.
    const timeAtX = (x) => {
      const rect = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (x - rect.left) / rect.width)) * total;
    };
    function showTip(x) {
      const rect = track.getBoundingClientRect();
      const time = timeAtX(x);
      const scene = sceneAt(time);
      hoverTip.innerHTML = `<span class="no">${sceneNo(scene)}</span> ${sceneTitle(scene)}<span class="at">${fmt(time)}</span>`;
      hoverTip.hidden = false;
      const half = hoverTip.offsetWidth / 2;
      hoverTip.style.left = `${Math.max(half, Math.min(rect.width - half, x - rect.left))}px`;
    }
    let dragging = false;
    track.addEventListener('pointerdown', (event) => {
      dragging = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('dragging');
      setTime(timeAtX(event.clientX));
    });
    track.addEventListener('pointermove', (event) => {
      showTip(event.clientX);
      if (dragging) setTime(timeAtX(event.clientX));
    });
    const endDrag = () => { dragging = false; track.classList.remove('dragging'); };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', () => { if (!dragging) hoverTip.hidden = true; });

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') closeMenus();
      if (event.code === 'Space') { event.preventDefault(); toggle(); }
      if (event.code === 'ArrowRight') setTime(clock + (event.shiftKey ? 0.2 : 2));
      if (event.code === 'ArrowLeft') setTime(clock - (event.shiftKey ? 0.2 : 2));
      if (event.key === ']') stepScene(1);
      if (event.key === '[') stepScene(-1);
      if (event.key === '>' || event.key === '.') setRate(RATES[Math.min(RATES.length - 1, RATES.indexOf(rate) + 1)]);
      if (event.key === '<' || event.key === ',') setRate(RATES[Math.max(0, RATES.indexOf(rate) - 1)]);
    });
    function fit() {
      const scale = Math.min(window.innerWidth / 1920, (window.innerHeight - bar.offsetHeight) / 1080);
      stage.style.transform = `scale(${scale})`;
      document.getElementById('viewport').style.height = `${1080 * scale}px`;
      document.getElementById('viewport').style.width = `${1920 * scale}px`;
    }
    window.addEventListener('resize', fit);
    fit();
    const start = params.get('t') ? +params.get('t') : only ? (scenes.find((s) => s.id === only)?.offset ?? 0) : 0;
    setTime(start);
    requestAnimationFrame(tick);
  });
})();
