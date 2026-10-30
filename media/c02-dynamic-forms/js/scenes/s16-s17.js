// s16 Move Damage on mobile · s17 evidence chain (end of the case) · s18 close: the comparison again, then the end cards
(() => {
  const { icon, logo, chapter, mHeader, askBar } = UI;
  const phone = window.PHONE_HTML;

  Scene('s16-move-run', { title: '执行 Move Damage', tag: '示意画面 · 基于本地 WMS 真实定义', tagKind: 'sim' }, ({ root, segs, S, E, show, pop, stagger, anim, fadeIn, text, cls, hide, pointer }) => {
    // The moment the narration reaches `phrase` inside a segment (by character position).
    const say = (seg, phrase, delta = 0) => {
      const g = segs[seg];
      if (!g) return delta;
      return g.start + (g.end - g.start) * (Math.max(0, g.text.indexOf(phrase)) / g.text.length) + delta;
    };
    const screens = `
      <div class="sA" style="position:absolute;inset:0;background:var(--canvas)">
        ${mHeader('My Tasks', 'Maria Garcia · Valley View', { back: false, acts: ['refresh', 'sparkles', 'more'] })}
        <div class="m-section-title">DYNAMIC TASKS</div>
        <div class="m-row rowmd" style="background:#f6f3fd">${icon('blocks', 22, 'var(--secondary)')}<div><div style="font-weight:600">Move Damage</div><div style="font-size:13.5px;color:var(--muted)">TASK-18652 · assigned by Emily Carter</div></div><span class="m-badge" style="margin-left:auto">1</span></div>
        <div class="m-section-title">OPEN TASKS</div>
        ${[['inbox', 'Receive', 17], ['box', 'Put Away', 14], ['route', 'Pick', 17]].map(([ic, n, c]) => `<div class="m-row">${icon(ic, 22, 'var(--secondary)')}${n}<span class="m-badge" style="margin-left:auto">${c}</span></div>`).join('')}
        ${askBar()}
      </div>
      <div class="sB" style="position:absolute;inset:0;background:var(--canvas)">
        ${mHeader('TASK-18652', 'Move Damage')}
        <div class="m-sec"><div class="m-label">Task</div><div class="m-value">Move Damage · Aisle A12</div></div>
        <div class="m-sec"><div class="m-label">Moves</div><div class="m-value lines">0/2 Lines</div><div style="display:flex;justify-content:flex-end;margin-top:6px"><span class="pill success steps" style="font-size:13px">0/1 steps</span></div></div>
        <div class="m-row step1" style="margin-top:10px"><span style="width:28px;height:28px;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:13px;font-weight:700">1</span><div><div style="font-weight:600">Move damaged stock to the damage location</div><div style="font-size:13.5px;color:var(--muted)" class="s1st">New</div></div></div>
        <div class="closeT" style="position:absolute;left:16px;right:16px;bottom:14px"><div class="m-btn">Close Task</div></div>
        <div class="closedT pill success" style="position:absolute;left:120px;bottom:30px;font-size:17px;padding:8px 20px">${icon('checkCircle', 18)} Task Closed</div>
      </div>
      <div class="sC" style="position:absolute;inset:0;background:var(--canvas)">
        ${UI.moveTakeScreen({ title: 'TASK-18652', sub: 'Move Damage · Move Inventory', step: '1 of 2', item: 'NB-BAT57-3C', itemName: '57Wh 3-Cell Notebook Battery', qty: 12, uom: 'EA', fromLpn: 'CLP-1005744', location: 'A12-05-1', next: 'A12-04-2 · NB-ADP65-USBC · 20 EA' })}
      </div>
      <div class="sD" style="position:absolute;inset:0;background:var(--canvas)">
        ${UI.movePlaceScreen({ title: 'TASK-18652', sub: 'Move Damage · Move Inventory', step: '1 of 2', toLpn: 'CLP-1005801', item: 'NB-BAT57-3C', qty: 12, uom: 'EA', suggestion: 'DMG-01' })}
        <div class="ff pill neutral" style="position:absolute;left:58px;top:430px;font-size:15px;padding:8px 16px">⏩ A12-04-2 · NB-ADP65-USBC · same phases</div>
      </div>`;
    const events = [
      ['e0', 'ban', 'danger', '拒绝', 'A12-05-2 不是这一行的来源库位', '提示正确位置 A12-05-1 · 没有任何库存写入'],
      ['e1', 'hand', 'info', 'Take', 'A12-05-1 · NB-BAT57-3C · 12 EA → To LPN CLP-1005801', 'takenByTask TASK-18652 · 货况保持 Damaged'],
      ['e2', 'pin', 'primary', '上架建议', 'Damaged → Damaged Goods → DMG-01', '上架策略映射 · 按货况'],
      ['e3', 'checkCircle', 'success', 'Place', 'CLP-1005801 → DMG-01 · followedSuggestion', 'Inventory Transaction · sourceDocType GenUI Task'],
      ['e4', 'listChecks', 'success', 'Task Lines', '2/2 Closed · TASK-18652 Closed', 'gatesClose：行未完成不能关闭'],
      ['e5', 'alert', 'success', 'Inventory Issue', 'ISSUE-106 · ISSUE-107 → Resolved', '任务关闭时自动结案'],
    ];
    root.innerHTML = `
      ${phone('ph', screens)}
      <div style="position:absolute;left:720px;top:110px;font-size:22px;font-weight:800" class="lt">${icon('history', 22, 'var(--primary)')} 系统回写与证据</div>
      <div style="position:absolute;left:720px;top:158px;width:1104px;display:flex;flex-direction:column;gap:14px">
        ${events.map(([c, ic, tone, kind, title, detail]) => `
          <div class="ev ${c} card" style="padding:15px 20px;display:flex;gap:16px;align-items:center">
            <div style="width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:var(--${tone === 'primary' ? 'primary-soft' : tone + '-bg'});color:var(--${tone})">${icon(ic, 23)}</div>
            <div style="flex:1"><div style="display:flex;gap:10px;align-items:center"><span class="pill ${tone}" style="font-size:13px">${kind}</span><span class="mono" style="font-size:16px;font-weight:600">${title}</span></div><div style="margin-top:5px;font-size:16.5px;color:var(--secondary)">${detail}</div></div>
          </div>`).join('')}
      </div>`;
    show('.pw', 0.1, 0.4, 20);
    fadeIn('.lt', 0.4);
    // mr-1: My Tasks → task page → step.
    const a = S('mr-1', 1.2);
    pointer([[a - 0.8, '.rowmd', [60, 120]], [a, '.rowmd', null, true], [a + 0.3, '.rowmd']], { touch: true });
    anim('.sB', a + 0.3, 0.45, { x: [400, 0] }, 'inOut');
    const b = a + 2.4;
    pointer([[b - 0.6, '.step1', [40, 80]], [b, '.step1', null, true], [b + 0.3, '.step1']], { touch: true });
    anim('.sC', b + 0.3, 0.45, { x: [400, 0] }, 'inOut');
    // mr-2: the wrong location is refused; then the phases in order: location, item, Qty · To LPN, Confirm Take.
    const w = S('mr-2', 0.6);
    text('.mt-loc .v', w, 'A12-05-2'); cls('.mt-loc', 'filled', w); cls('.mt-loc', 'err', w, w + 2.4);
    fadeIn('.mt-lerr', w + 0.1, 0.2); hide('.mt-lerr', w + 2.4, 0.2);
    show('.e0', w + 0.4);
    const r = Math.max(w + 2.8, say('mr-2', '到 A12-05-1'));
    text('.mt-loc .v', r, 'A12-05-1'); cls('.mt-loc', 'ok', r);
    cls('.sC .ph1', 'done', r); cls('.sC .ph2', 'on', r);
    const it = Math.max(r + 1.0, say('mr-2', '再扫物料'));
    text('.mt-item .v', it, 'NB-BAT57-3C'); cls('.mt-item', 'ok', it); fadeIn('.mt-ihint', it + 0.1, 0.3);
    cls('.sC .ph2', 'done', it); cls('.sC .ph3', 'on', it);
    const q = Math.max(it + 1.0, say('mr-2', '确认数量'));
    text('.mt-qty', q, '12');
    const lp = Math.max(q + 0.9, say('mr-2', '装进'));
    text('.mt-to .v', lp, 'CLP-1005801'); cls('.mt-to', 'ok', lp);
    const tk = lp + 1.0;
    pointer([[tk - 0.7, '.mt-to', [0, 80]], [tk, '.mt-btn', null, true], [tk + 0.4, '.mt-btn']], { touch: true });
    show('.e1', tk + 0.4);
    anim('.sD', tk + 0.4, 0.45, { x: [400, 0] }, 'inOut');
    // mr-3: the suggestion is the anchor badge; scan the held To LPN, then DMG-01; the second move fast-forwards.
    const p = S('mr-3', 0.5);
    pop('.sD .mv-badge', p, 0.5);
    show('.e2', p + 0.3);
    text('.mp-held .v', p + 1.8, 'CLP-1005801'); cls('.mp-held', 'ok', p + 1.8);
    cls('.sD .ph1', 'done', p + 1.8); cls('.sD .ph2', 'on', p + 1.8);
    text('.mp-dest .v', p + 3.0, 'DMG-01'); cls('.mp-dest', 'ok', p + 3.0); cls('.sD .ph2', 'done', p + 3.0);
    pointer([[p + 3.3, '.mp-dest', [0, 80]], [p + 3.9, '.mp-btn', null, true], [p + 4.3, '.mp-btn']], { touch: true });
    show('.e3', p + 4.4);
    anim('.ff', p + 4.6, 0.3, { opacity: [0, 1] });
    anim('.ff', p + 6.4, 0.3, { opacity: 0 });
    // Back to the task page and close.
    const c = p + 7.0;
    anim('.sC, .sD', c, 0.4, { x: 400 }, 'inOut');
    text('.lines', c, '2/2 Lines'); text('.steps', c, '1/1 steps'); text('.s1st', c, 'Closed');
    anim('.closeT', c + 0.3, 0.3, { opacity: [0, 1] });
    pointer([[c + 0.5, '.closeT', [0, -80]], [c + 1.1, '.closeT', null, true], [c + 1.5, '.closeT']], { touch: true });
    anim('.closeT', c + 1.4, 0.2, { opacity: 0 });
    anim('.closedT', c + 1.4, 0.35, { opacity: [0, 1], scale: [0.8, 1] }, 'back');
    show('.e4', c + 1.5);
    show('.e5', c + 2.6);
  });

  Scene('s17-evidence', { title: '闭环与证据链', tag: '真实机制 · 示意数据' }, ({ root, S, E, D, show, pop, stagger, anim, fadeIn, slideIn, hide }) => {
    const states = [
      ['Open', 'warning', '10:12 · John Smith', 'Patrol report · photo ×1 · Good → Damaged (ADJ-512)'],
      ['In Progress', 'info', '10:31 · Emily Carter', 'TASK-18652 · via Damaged Inventory Relocation v1'],
      ['Resolved', 'success', '10:47 · Maria Garcia', 'Move Damage closed · 12 EA at DMG-01 (CLP-1005801)'],
    ];
    const evidence = [
      ['alert', 'Inventory Issue', 'ISSUE-106 · photo · reportedByTask'],
      ['sliders', 'Inventory Adjustment', 'ADJ-512 · Good → Damaged'],
      ['route', 'Inventory Transactions', 'Take / Place · sourceDocType GenUI Task'],
      ['history', '数据变更日志', 'screen_id page:…@v1 · user · time'],
      ['branch', 'Definition Versions', 'Inventory Patrol v1 · Move Damage v1 · bodyHash'],
      ['cpu', 'View Invocations', 'routes called · purpose Page'],
    ];
    // One 3-column grid (560px columns, 24px gutters) holds every block: the Issue timeline in column 1, the evidence
    // in columns 2-3 as three equal rows, and the three roles below, so all edges line up.
    root.innerHTML = `
      ${chapter('Part 1 · 案例闭环', '终点不是表单提交，而是有证据的业务状态变化')}
      <div class="evg">
        <div class="evl">一条 Issue 的状态<span class="pill primary ev-span">从上报到结案 35 分钟</span></div><div class="evl" style="grid-column:2 / 4">每一步留下的证据</div>
        <div class="tlc card">
          <div class="tlh">${icon('alert', 22, 'var(--warning)')} ISSUE-106 · CLP-1005744</div>
          <div class="tll">
            ${states.map(([st, tone, who, what], i) => `
              <div class="sti${i < 2 ? ' grow' : ''}">
                <div class="rail"><span class="dot" style="background:var(--${tone})"></span>${i < 2 ? '<span class="line"></span>' : ''}</div>
                <div><div class="sth"><span class="pill ${tone}">${st}</span><span class="who">${who}</span></div><div class="what">${what}</div></div>
              </div>`).join('')}
          </div>
        </div>
        <div class="evs">
          ${evidence.map(([ic, t, d]) => `<div class="evc card"><div class="eic">${icon(ic, 22)}</div><div style="min-width:0"><div class="et">${t}</div><div class="ed mono">${d}</div></div></div>`).join('')}
        </div>
        <div class="evl roles-l" style="grid-column:1 / 4">分工</div>
        ${[['sparkles', 'Agent', '理解业务 · 生成计划、页面与 View'], ['shield', 'WMS', '权限 · 校验 · 数据隔离 · 审计 · 库存原语'], ['users', '人', '确认 · 发布 · 派工 · 回退']].map(([ic, who, what]) => `<div class="rl card"><div class="ric">${icon(ic, 28)}</div><div><div class="rt">${who}</div><div class="rd">${what}</div></div></div>`).join('')}
      </div>`;
    show('.tlc', S('ev-1', 0.5));
    stagger('.sti', S('ev-1', 3.0), 1.6, 'slideIn');
    stagger('.evc', S('ev-1', 8.0), 0.9, 'pop');
    fadeIn('.roles-l', S('ev-2', 0.1));
    stagger('.rl', S('ev-2', 0.3), 1.8, 'show');
    pop('.ev-span', S('ev-1', 7.0));
  });

  // Close: the opening comparison once more, in three lines, then the punchline card and the thank-you card the video
  // ends on (held to the last frame).
  Scene('s18-close', { title: '回到对比 · 结语', tag: '估算 · 传统按典型定制交付流程', tagKind: 'design', holdEnd: true }, ({ root, segs, S, E, show, pop, stagger, anim, fadeIn, hideTag }) => {
    const say = (seg, phrase, delta = 0) => {
      const g = segs[seg];
      if (!g) return delta;
      return g.start + (g.end - g.start) * (Math.max(0, g.text.indexOf(phrase)) / g.text.length) + delta;
    };
    const { before, after } = UI.COMPARE;
    const rows = [
      ['users', '工时', `≈ ${before.effort} 人天`, `${after.effortPer} ${after.effort} ${after.effortUnit}`],
      ['history', '周期', `${before.lead} ${before.leadUnit}`, after.lead],
      ['checkCircle', '效果', '层层转述 · 改一处等下个迭代', '当场试用 · 说一句就改'],
    ];
    root.innerHTML = `
      ${chapter('回到开头 · 同样三个应用', '从 2 周迭代，到当天上线')}
      <div class="rc-rows">
        ${rows.map(([ic, label, was, now], index) => `
          <div class="rc-row rc${index}">
            <div class="rc-l">${icon(ic, 28)}<b>${label}</b></div>
            <div class="rc-was">${was}</div>
            <div class="rc-to">${icon('arrowRight', 34, 'var(--primary)', 2.4)}</div>
            <div class="rc-now">${now}</div>
          </div>`).join('')}
      </div>
      <div class="endc">
        ${logo(84)}
        <div class="end-h">需求不再排队等开发</div>
        <div class="end-s">现场说出来，<span>当场就能用</span></div>
        <div class="end-roles">${['Agent 理解与生成', 'WMS 守住规则', '人来拍板'].map((r) => `<span>${r}</span>`).join('<i></i>')}</div>
      </div>
      <div class="thx">
        <div class="thx-logo">${logo(78)}</div>
        <div class="thx-h">谢谢观看</div>
        <div class="thx-en">Thank you for watching</div>
        <div class="thx-f">Item WMS · Dynamic Forms, powered by GenUI</div>
      </div>`;
    // close-1 names effort, lead time, then the new way: each row lands with its words.
    [say('close-1', '传统方式'), say('close-1', '一个迭代'), say('close-1', '现在')].forEach((t, index) => {
      show(`.rc${index}`, t);
      fadeIn(`.rc${index} .rc-was`, t);
    });
    stagger('.rc-row .rc-to, .rc-row .rc-now', say('close-1', '现在', 0.6), 0.35, 'pop');
    // close-2: the punchline card, then the thank-you card.
    const tEnd = S('close-2', -0.3);
    anim('.endc', tEnd, 0.6, { opacity: [0, 1] });
    show('.endc .end-roles', S('close-2', 0.2));
    show('.endc .end-h', say('close-2', '需求不再'));
    show('.endc .end-s', say('close-2', '现场说出来'));
    hideTag(tEnd + 0.6);
    anim('.thx', E('close-2', 1.2), 0.8, { opacity: [0, 1] });
    stagger('.thx .thx-h, .thx .thx-en, .thx .thx-f', E('close-2', 1.4), 0.3, 'show');
  });
})();
