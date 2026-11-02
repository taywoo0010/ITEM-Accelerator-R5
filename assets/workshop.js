(function () {
  'use strict';
  const metaNode = document.getElementById('page-data');
  if (!metaNode) return;
  const meta = JSON.parse(metaNode.textContent), NOTE_KEY = 'iss-r5.discussion.notes';
  const mem = {};
  function getNotes() { try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}'); } catch { return mem.notes || {}; } }
  function saveNotes(notes) { mem.notes = notes; try { localStorage.setItem(NOTE_KEY, JSON.stringify(notes)); return true; } catch { return false; } }
  function bi(tag, zh, en, cls) { const el = document.createElement(tag); if (cls) el.className = cls; for (const [lang, text] of [['zh', zh], ['en', en]]) { const s = document.createElement('span'); s.className = lang; s.textContent = text; el.appendChild(s); } return el; }
  function download(text, name, type) { const u = URL.createObjectURL(new Blob([text], { type })), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
  function noteMd(notes) { let out = '# ISS AI Native 工作坊 · 本机讨论记录\n\n这些记录来自当前浏览器，不表示正式审批或集中提交。\n'; for (const p of meta.pages) { const n = notes[p.id]; if (!n || !['leaderViews', 'conclusion', 'actions'].some(k => n[k])) continue; out += `\n## MD §${p.md} · ${p.title}\n\n领导意见／讨论：\n${n.leaderViews || ''}\n\n结论／共识：\n${n.conclusion || ''}\n\nOwner／下一步／日期：\n${n.actions || ''}\n`; } return out; }
  function exportNotes(format, onlyId) { const all = getNotes(), selected = onlyId ? { [onlyId]: all[onlyId] || {} } : all; if (format === 'md') download(noteMd(selected), 'ISS_R5_Discussion_Notes.md', 'text/markdown;charset=utf-8'); else download(JSON.stringify({ type: 'iss-r5-notes', version: meta.version, notes: selected, exportedAt: new Date().toISOString() }, null, 2), 'ISS_R5_Discussion_Notes.json', 'application/json;charset=utf-8'); }
  function mountNotes() {
    for (const p of meta.pages) {
      if (!p.notes) continue;
      const scene = document.getElementById(p.id); if (!scene || scene.querySelector('.notes-block')) continue;
      const detail = document.createElement('details'); detail.className = 'notes-block'; detail.open = p.day === 2;
      detail.appendChild(bi('summary', '讨论记录空间 · 仅本机保存', 'Discussion space · local storage only'));
      const grid = document.createElement('div'); grid.className = 'note-grid';
      const n = getNotes()[p.id] || {};
      const fields = [['leaderViews', '领导意见／现场讨论', 'Leadership views / discussion'], ['conclusion', '结论／共识／待补证据', 'Conclusions / agreement / evidence needed'], ['actions', 'Owner／下一步／约定日期', 'Owner / next action / agreed date']];
      const state = bi('p', '输入会自动保存到当前浏览器；不会自动提交到服务器。', 'Saved in this browser; never sent to the server automatically.', 'note-state');
      for (const [key, zh, en] of fields) {
        const label = bi('label', zh, en, 'note-field'), textarea = document.createElement('textarea'); textarea.rows = 3; textarea.maxLength = 10000; textarea.dataset.notePage = p.id; textarea.dataset.noteField = key; textarea.value = typeof n[key] === 'string' ? n[key] : ''; label.appendChild(textarea); grid.appendChild(label);
        textarea.addEventListener('input', () => { const current = getNotes(); current[p.id] = { ...(current[p.id] || {}), [key]: textarea.value, md: p.md, title: p.title, updatedAt: new Date().toISOString() }; const ok = saveNotes(current); state.replaceChildren(...bi('p', ok ? '本机草稿已保存；建议导出备份。' : '浏览器存储不可用，请立刻导出备份；当前内容暂存本窗口。', ok ? 'Local draft saved; export a backup.' : 'Browser storage is unavailable; export now. Data is only in this window.').childNodes); });
      }
      detail.appendChild(grid); detail.appendChild(state); const actions = document.createElement('div'); actions.className = 'notes-actions'; const btn = bi('button', '导出本节记录', 'Export this section', 'ctrl'); btn.type = 'button'; btn.onclick = () => exportNotes('md', p.id); actions.appendChild(btn); detail.appendChild(actions); scene.appendChild(detail);
    }
  }
  function safeMediaUrl(value) { if (!value || typeof value !== 'string') return ''; try { const u = new URL(value, window.ISS_CONFIG && window.ISS_CONFIG.siteBase || document.baseURI); return ['http:', 'https:', 'file:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; } }
  // HTML播放器（场景动画＋旁白）以iframe嵌入；外框按16:9画面加60px控制栏留高。
  function mountPlayer(slot, id, cfg, url) {
    slot.classList.add('has-player');
    const frame = document.createElement('div'); frame.className = 'player-frame';
    const iframe = document.createElement('iframe'); iframe.src = url; iframe.title = cfg.title || id; iframe.loading = 'lazy'; iframe.allow = 'autoplay; fullscreen'; iframe.allowFullscreen = true; iframe.dataset.casePlayer = id; frame.appendChild(iframe); slot.appendChild(frame);
    slot.appendChild(bi('p', '演示播放器：HTML 场景动画＋旁白，不是录屏；每个画面右上角标注真实机制或示意画面。空格播放，[ / ] 切换场景。', 'Demo player: HTML scene animation with narration, not a screen recording; each scene is labelled real mechanism or illustration. Space plays, [ / ] switches scenes.', 'video-status'));
    const actions = document.createElement('div'); actions.className = 'video-actions';
    if (frame.requestFullscreen) { const full = bi('button', '全屏播放', 'Full screen', 'ctrl'); full.type = 'button'; full.onclick = () => frame.requestFullscreen(); actions.appendChild(full); }
    const open = bi('a', '新窗口打开', 'Open in new window', 'ctrl'); open.href = url; open.target = '_blank'; open.rel = 'noopener'; actions.appendChild(open); slot.appendChild(actions);
  }
  function youtubeEmbed(value) {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return '';
      const host = url.hostname.toLowerCase();
      let id = '';
      if (host === 'youtu.be') id = url.pathname.slice(1);
      else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(host)) {
        if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
        else { const match = url.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})\/?$/); if (match) id = match[1]; }
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? 'https://www.youtube-nocookie.com/embed/' + id : '';
    } catch { return ''; }
  }
  function mountYoutube(slot, id, cfg, url) {
    slot.classList.add('has-player');
    const frame = document.createElement('div'); frame.className = 'player-frame youtube-frame';
    const iframe = document.createElement('iframe'); iframe.src = url; iframe.title = cfg.title || id; iframe.loading = 'lazy'; iframe.allow = 'encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin'; iframe.dataset.casePlayer = id; frame.appendChild(iframe); slot.appendChild(frame);
    const actions = document.createElement('div'); actions.className = 'video-actions';
    const open = bi('a', '在 YouTube 打开', 'Open on YouTube', 'ctrl'); open.href = 'https://www.youtube.com/watch?v=' + url.split('/').pop(); open.target = '_blank'; open.rel = 'noopener'; actions.appendChild(open); slot.appendChild(actions);
  }
  function mountMedia() {
    for (const slot of document.querySelectorAll('.video-slot[data-case-id]')) {
      const id = slot.dataset.caseId, cfg = window.ISS_CONFIG && window.ISS_CONFIG.media && window.ISS_CONFIG.media[id] || {};
      const youtubeUrl = youtubeEmbed(cfg.youtube); if (youtubeUrl) { mountYoutube(slot, id, cfg, youtubeUrl); continue; }
      const playerUrl = safeMediaUrl(cfg.player); if (playerUrl) { mountPlayer(slot, id, cfg, playerUrl); continue; }
      const player = document.createElement('video'); player.controls = true; player.preload = 'metadata'; player.playsInline = true; player.hidden = true; player.dataset.caseVideo = id; slot.appendChild(player);
      const configuredSrc = safeMediaUrl(cfg.src);
      if (configuredSrc) {
        slot.classList.add('has-player');
        player.src = configuredSrc; player.hidden = false;
        player.setAttribute('aria-label', cfg.title || id);
        const poster = safeMediaUrl(cfg.poster); if (poster) player.poster = poster;
        const captions = safeMediaUrl(cfg.captions); if (captions) { const track = document.createElement('track'); track.kind = 'captions'; track.src = captions; track.srclang = 'zh'; track.label = '中文字幕'; player.appendChild(track); }
        player.addEventListener('error', () => { slot.appendChild(bi('p', '视频加载失败，请检查文件路径或浏览器支持。', 'Video failed to load. Check the file path or browser support.', 'video-status')); });
        continue;
      }
      const isYoutubeSlot = Object.prototype.hasOwnProperty.call(cfg, 'youtube');
      const status = bi('p', cfg.youtube ? 'YouTube 链接无效，请检查视频地址。' : isYoutubeSlot ? 'YouTube 链接待更新，可先选择本机视频预览。' : '尚未配置预录视频。可选择本机文件预览；部署视频请编辑 assets/site-config.js。', cfg.youtube ? 'Invalid YouTube link. Check the video URL.' : isYoutubeSlot ? 'YouTube link coming soon. A local recording can be previewed.' : 'No recording configured. Preview a local file, or configure assets/site-config.js for deployment.', 'video-status'); slot.appendChild(status);
      let blobUrl = '';
      const setStatus = (zh, en) => status.replaceChildren(...bi('p', zh, en).childNodes);
      function load(url, local) { if (!url) return; player.src = url; player.hidden = false; player.load(); setStatus(local ? '本机视频已选择，仅当前窗口预览，不上传；刷新后请重新选择。' : '已加载部署配置中的视频，请核验真实／脱敏／模拟与共享授权。', local ? 'Local preview only; no upload. Select again after refresh.' : 'Deployment recording loaded. Verify source status and sharing permission.'); }
      player.addEventListener('error', () => setStatus('视频未能加载或格式不支持。请检查文件路径、授权及浏览器支持；不会用假视频替代。', 'Video failed or the format is unsupported. Check path, permission and browser support.'));
      const actions = document.createElement('div'); actions.className = 'video-actions'; const fileLabel = bi('label', '选择本机预录视频', 'Preview a local recording', 'ctrl'); const input = document.createElement('input'); input.type = 'file'; input.accept = 'video/*'; input.hidden = true; input.dataset.localVideo = id; fileLabel.appendChild(input); actions.appendChild(fileLabel);
      input.onchange = () => { const file = input.files && input.files[0]; if (!file) return; if (blobUrl) URL.revokeObjectURL(blobUrl); blobUrl = URL.createObjectURL(file); load(blobUrl, true); };
      const clear = bi('button', '停止／移除本次预览', 'Stop / clear preview', 'ctrl'); clear.type = 'button'; clear.onclick = () => { player.pause(); player.removeAttribute('src'); player.load(); player.hidden = true; if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = ''; } input.value = ''; setStatus('已移除当前预览；原视频文件没有被删除。', 'Preview cleared; the original recording was not deleted.'); }; actions.appendChild(clear); slot.appendChild(actions);
    }
  }
  function mountKnowledgeComparisons() {
    for (const root of document.querySelectorAll('[data-knowledge-compare]')) {
      const slider = root.querySelector('.compare-range');
      if (!slider || slider.dataset.compareReady === 'true') continue;
      const compactQuery = window.matchMedia('(max-width: 700px)');
      const setCompact = () => root.classList.toggle('is-compact', compactQuery.matches);
      const update = () => {
        const value = Math.max(0, Math.min(100, Number(slider.value) || 0));
        const before = Math.round(value), after = 100 - before;
        root.style.setProperty('--split', `${value}%`);
        slider.setAttribute('aria-valuetext', `抽取前 ${before}%，抽取后 ${after}% / Before ${before}%, after ${after}%`);
      };
      slider.dataset.compareReady = 'true';
      slider.addEventListener('input', update);
      slider.addEventListener('change', update);
      if (compactQuery.addEventListener) compactQuery.addEventListener('change', setCompact);
      else compactQuery.addListener(setCompact);
      setCompact();
      update();
    }
  }
  function importNotes(file) { if (!file || file.size > 5 * 1024 * 1024) { alert('请选择5MB以内的笔记JSON / Choose a note JSON under 5MB'); return; } file.text().then(text => { const data = JSON.parse(text); if (data.type !== 'iss-r5-notes' || !data.notes || typeof data.notes !== 'object' || Array.isArray(data.notes)) throw Error('Invalid notes'); const next = getNotes(); for (const p of meta.pages) { const n = data.notes[p.id]; if (!n || typeof n !== 'object') continue; const value = { md: p.md, title: p.title }; for (const key of ['leaderViews', 'conclusion', 'actions']) { if (n[key] !== undefined && typeof n[key] !== 'string') throw Error('Invalid note'); value[key] = String(n[key] || '').slice(0, 10000); } next[p.id] = value; } saveNotes(next); document.querySelectorAll('textarea[data-note-page]').forEach(el => el.value = next[el.dataset.notePage] && next[el.dataset.notePage][el.dataset.noteField] || ''); alert('笔记已导入本机，未提交 / Imported locally, not submitted'); }).catch(() => alert('笔记文件无效 / Invalid note file')); }
  const exportBtn = document.getElementById('export-meeting-notes'); if (exportBtn) exportBtn.onclick = () => exportNotes('json'); const importInput = document.getElementById('import-meeting-notes'); if (importInput) importInput.onchange = () => { importNotes(importInput.files[0]); importInput.value = ''; };
  for (const link of document.querySelectorAll('a[href$=".zip"]')) {
    const url = safeMediaUrl(window.ISS_CONFIG && window.ISS_CONFIG.packageUrl);
    if (url) link.href = url;
    else { link.removeAttribute('href'); link.removeAttribute('download'); link.setAttribute('aria-disabled', 'true'); link.replaceChildren(...bi('span', '完整Git安装包由组织者另行分享', 'The organizer shares the Git installation package separately').childNodes); }
  }
  mountKnowledgeComparisons(); mountMedia(); mountNotes();
  window.ISSNotes = { exportNotes, getNotes, key: NOTE_KEY };
}());
