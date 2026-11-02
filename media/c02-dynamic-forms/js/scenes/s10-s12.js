// s10 case intro · s11 patrol plan on mobile · s12 patrol run
(() => {
  const { icon, chapter, phoneShell, mHeader, agentPage, maTool, maWorked, maCard, damagedBoxSvg } = UI;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const hlJson = (line) => esc(line)
    .replace(/("[^"]*")(\s*:)/g, '<span class="k">$1</span>$2')
    .replace(/(:\s*|\[\s*|,\s*)("[^"]*")/g, '$1<span class="s">$2</span>')
    .replace(/\b(true|false|\d+)\b/g, '<span class="n">$1</span>');

  // Phone placement shared by the mobile scenes: a T1Pro-sized frame (404x794, see .phone) at (157, 133), unscaled.
  const PHONE = { left: 157, top: 133, scale: 1 };
  const screenOrigin = {
    x: PHONE.left + 404 * (1 - PHONE.scale) / 2 + 7 * PHONE.scale,
    y: PHONE.top + 794 * (1 - PHONE.scale) / 2 + 7 * PHONE.scale,
  };
  const at = (sx, sy) => [screenOrigin.x + sx * PHONE.scale, screenOrigin.y + sy * PHONE.scale];
  window.PHONE_AT = at;
  const phone = (cls, inner) => `<div class="pw ${cls}" style="position:absolute;left:${PHONE.left}px;top:${PHONE.top}px;width:404px;height:794px"><div class="phone" style="position:relative;transform:scale(${PHONE.scale})">${phoneShell(inner)}</div></div>`;
  window.PHONE_HTML = phone;

  // The moment the narration reaches `phrase` inside a segment (by character position).
  const sayIn = (segs) => (seg, phrase, delta = 0) => {
    const g = segs[seg];
    if (!g) return delta;
    return g.start + (g.end - g.start) * (Math.max(0, g.text.indexOf(phrase)) / g.text.length) + delta;
  };

  // Background for viewers outside warehousing: where the warehouse sits, what Item WMS keeps, and why
  // floor-level requests pile up behind the dev backlog. The damage note it ends on opens the case.
  Scene('s10-context', { title: '背景：Item 体系里的仓库', tag: '业务背景示意', tagKind: '' }, ({ root, segs, S, E, show, pop, stagger, fadeIn, anim, cls }) => {
    const say = sayIn(segs);
    const stages = [
      ['inbox', '收货', 'Receive'],
      ['download', '上架', 'Put Away'],
      ['warehouse', '在库保管', 'Storage'],
      ['listChecks', '拣货', 'Pick'],
      ['truck', '发运', 'Ship'],
    ];
    const notes = [
      ['这个客户收货，要多拍一张封条照片', '客户 A'],
      ['退货先质检，再决定放到哪', '退货组'],
      ['外箱破损，要拍照上报，别再被拣走', '巡检员'],
      ['电池类订单，出库前要多复核一次', '客户 B'],
      ['大客户发货前，要再点一次数', '发运主管'],
    ];
    const W = 300, GAP = 57, X0 = 96;
    const cx = (index) => X0 + index * (W + GAP);
    root.innerHTML = `
      ${chapter('背景 · Item 体系里的仓库', '仓库：货物流转的枢纽，也是问题冒出来的现场')}
      <div class="cx-std pill success">${icon('checkCircle', 17)} 标准功能 · 主流程</div>
      ${stages.map(([ic, zh, en], index) => `
        <div class="cx-stage card s${index}" style="left:${cx(index)}px;width:${W}px">
          <div class="cx-ic">${icon(ic, 34)}</div>
          <div><div class="cx-zh">${zh}</div><div class="cx-en">${en}</div></div>
        </div>`).join('')}
      ${[0, 1, 2, 3].map((index) => `<div class="cx-arrow a${index}" style="left:${cx(index) + W + 8}px">${icon('chevronRight', 40, 'rgba(85,53,160,.5)', 2.6)}</div>`).join('')}
      <div class="cx-track"><i></i></div>
      <div class="cx-goods">${icon('box', 26, '#fff')}</div>
      <div class="cx-wms card">
        <div class="cx-wms-h">${UI.logo(40)}<b>Item WMS</b><span>记录每一件货</span></div>
        ${[['pin', '在哪里', '库位 · LPN'], ['tag', '什么状态', '货况 · 可用 / 冻结'], ['history', '谁动过它', '每一次移动都有流水']].map(([ic, k, v]) => `
          <div class="cx-fact">${icon(ic, 24, 'var(--primary)')}<div><b>${k}</b><span>${v}</span></div></div>`).join('')}
      </div>
      ${notes.map(([quote, who], index) => `
        <div class="cx-note n${index}${index === 2 ? ' hot' : ''}" style="left:${cx(index)}px;width:${W}px">
          <div class="cx-q">“${quote}”</div>
          <div class="cx-who">${icon('user', 16)} ${who}<span class="cx-wait">${icon('clock', 14)} 待排期</span></div>
        </div>`).join('')}`;

    // ctx-1: the stages light up as they are named; one carton travels the flow; then what WMS records.
    ['收货', '上架', '在库', '拣货', '发运'].forEach((phrase, index) => {
      const t = Math.max(S('ctx-1', 0.3) + index * 0.35, say('ctx-1', phrase, -0.25));
      show(`.cx-stage.s${index}`, t);
      if (index) fadeIn(`.cx-arrow.a${index - 1}`, t - 0.15);
    });
    fadeIn('.cx-track', say('ctx-1', '收货', -0.2));
    anim('.cx-track i', say('ctx-1', '收货'), say('ctx-1', '发运') - say('ctx-1', '收货') + 0.6, { clip: [0, 100] }, 'linear');
    anim('.cx-goods', say('ctx-1', '收货', -0.2), 0.3, { opacity: [0, 1] });
    anim('.cx-goods', say('ctx-1', '收货'), say('ctx-1', '发运') - say('ctx-1', '收货') + 0.6, { x: [0, 4 * (W + GAP)] }, 'inOut');
    show('.cx-wms', say('ctx-1', '货在哪里', -0.4));
    stagger('.cx-fact', say('ctx-1', '货在哪里', -0.1), 0.7, 'pop');
    // ctx-2: the floor. The WMS card and carton make way; requests pop up under each stage.
    anim('.cx-wms', S('ctx-2', -0.2), 0.4, { opacity: [1, 0], y: [0, 20] });
    anim('.cx-goods, .cx-track', S('ctx-2', -0.2), 0.4, { opacity: [1, 0] });
    const firstNote = say('ctx-2', '问题随时', -0.4);
    [2, 0, 3, 1, 4].forEach((index, order) => pop(`.cx-note.n${index}`, firstNote + order * Math.max(0.45, (say('ctx-2', '各不相同') - firstNote) / 5)));
    // ctx-3: the standard flow is covered; everything else waits in line.
    pop('.cx-std', say('ctx-3', '标准功能', -0.2));
    stagger('.cx-stage', say('ctx-3', '标准功能'), 0.08, 'fadeIn');
    cls('.cx-stage', 'ok', say('ctx-3', '标准功能'));
    stagger('.cx-wait', say('ctx-3', '排队', -0.2), 0.12, 'pop');
    cls('.cx-note', 'waiting', say('ctx-3', '排队'));
    // The damage note is the case we are about to open.
    cls('.cx-note.hot', 'lit', E('ctx-3', -0.4));
    anim('.cx-note.hot', E('ctx-3', -0.4), 0.5, { scale: [1, 1.08] }, 'back');
  });

  // Part 1 opens on one carton: what the floor sees, what the system still believes, and where that leads.
  // Only then the three apps that close the gap.
  Scene('s10-case', { title: '用例：库存巡检与破损处理', tag: '示意画面 · 基于本地 WMS 真实定义', tagKind: 'sim' }, ({ root, segs, S, E, show, pop, stagger, fadeIn, anim, cls }) => {
    const say = sayIn(segs);
    const acts = [
      ['phone', 'Mobile · Dynamic Task', 'Inventory Patrol', 'John Smith · 巡检员', '巡检中发现破损，拍照上报 Inventory Issue', 'Dynamic Task → Save as Task Type'],
      ['monitor', 'Web · Dynamic Page', 'Damaged Inventory Relocation', 'Emily Carter · 主管', '集中审核破损记录，派出 Move Damage 任务', 'Agent 起草 → 发布'],
      ['phone', 'Mobile · Dynamic Task Type', 'Move Damage', 'Maria Garcia · 搬运员', 'Take → Place，按上架策略放入 DMG 坏货区', 'Composable Move Inventory'],
    ];
    const chain = [['listChecks', '明天被拣走'], ['truck', '打包发运'], ['users', '终端客户']];
    root.innerHTML = `
      <div class="chapter"><div class="eyebrow">Part 1 · 用例</div>
        <div class="headline cs-hl"><span class="hA">一箱破损的电池，明天可能就发到客户手里</span><span class="hB">库存巡检 → 破损上报 → 集中处理 → 搬到坏货区</span></div>
        <div class="subline">Valley View 仓 · 客户 Northbridge Service Parts · NB-BAT57-3C 57Wh 笔记本电池</div></div>
      <div class="cs-a">
        <div class="cs-floor card">
          <div class="cs-h">${icon('user', 22)} 现场 · 巡检员看到的</div>
          <div class="cs-box">${damagedBoxSvg(330)}<span class="cs-crack">外箱破损</span></div>
          <div class="cs-facts">
            <div>${icon('pin', 18)} A12-05-1</div><div>${icon('tag', 18)} CLP-1005744</div><div>${icon('box', 18)} NB-BAT57-3C · 12 EA</div>
          </div>
        </div>
        <div class="cs-ne">≠</div>
        <div class="cs-sys card">
          <div class="cs-h">${icon('monitor', 22)} 系统里 · Item WMS 记录的</div>
          <div class="cs-row">
            <div><span>Item</span><b>NB-BAT57-3C</b></div><div><span>LPN</span><b>CLP-1005744</b></div><div><span>Location</span><b>A12-05-1</b></div><div><span>Qty</span><b>12 EA</b></div>
            <div><span>Condition</span><b class="pill success cs-good">Good</b></div><div><span>Pickable</span><b class="pill success cs-pick">Yes</b></div>
          </div>
          <div class="cs-if">${icon('alert', 20)} 如果没人处理</div>
          <div class="cs-chain">${chain.map(([ic, label], index) => `<div class="cs-hop h${index}">${icon(ic, 26)}<span>${label}</span></div>${index < chain.length - 1 ? `<div class="cs-dash d${index}"></div>` : ''}`).join('')}</div>
          <div class="cs-risk"><span class="pill danger r0">${icon('message', 16)} 客诉 · 退货</span><span class="pill danger r1">${icon('zap', 16)} 锂电池安全隐患</span></div>
        </div>
      </div>
      ${acts.map(([ic, surface, name, who, what, how], i) => `
        <div class="act card" style="position:absolute;left:${96 + i * 600}px;top:330px;width:528px;height:420px;padding:30px">
          <div style="display:flex;align-items:center;gap:14px"><div style="width:60px;height:60px;border-radius:16px;background:var(--primary);color:#fff;display:grid;place-items:center">${icon(ic, 32)}</div><div><div style="font-size:16px;font-weight:700;letter-spacing:1.5px;color:var(--primary)">0${i + 1} · ${surface}</div><div style="font-size:27px;font-weight:800;margin-top:2px">${name}</div></div></div>
          <div style="margin-top:30px;display:flex;align-items:center;gap:10px;font-size:20px">${icon('user', 22, 'var(--secondary)')} ${who}</div>
          <div style="margin-top:18px;font-size:21px;line-height:1.6">${what}</div>
          <div style="position:absolute;left:30px;bottom:28px" class="pill primary">${how}</div>
        </div>`).join('')}
      <div class="need pill primary" style="position:absolute;left:96px;top:262px;font-size:18px;padding:6px 16px">${icon('blocks', 18)} 需要 3 个应用：2 个手机任务 + 1 个 Web 工作台</div>
      ${[0, 1].map((i) => `<div class="aa" style="position:absolute;left:${626 + i * 600}px;top:510px">${icon('chevronRight', 60, 'rgba(85,53,160,.55)', 2.6)}</div>`).join('')}`;

    // case-1: the carton on the shelf, as the patroller sees it.
    show('.cs-floor', S('case-1', -0.3));
    pop('.cs-box', S('case-1', 0.2));
    pop('.cs-crack', say('case-1', '外箱破了', -0.1));
    stagger('.cs-facts > div', say('case-1', '笔记本锂电池', -0.3), 0.25, 'fadeIn');
    // case-2: the system still believes it is good stock, and the order flow would carry it to a customer.
    show('.cs-sys', say('case-2', '可在系统里', -0.3));
    stagger('.cs-row > div', say('case-2', '可在系统里'), 0.12, 'fadeIn');
    pop('.cs-ne', say('case-2', '好货', -0.2));
    cls('.cs-good, .cs-pick', 'flag', say('case-2', '好货'));
    show('.cs-if', say('case-2', '如果没人处理', -0.2));
    ['拣走', '发到', '终端客户'].forEach((phrase, index) => {
      const t = say('case-2', phrase, -0.25);
      pop(`.cs-hop.h${index}`, t);
      if (index) anim(`.cs-dash.d${index - 1}`, t - 0.35, 0.35, { opacity: [0, 1], clip: [0, 100] });
    });
    pop('.cs-risk .r0', say('case-2', '客诉', -0.2));
    pop('.cs-risk .r1', say('case-2', '安全隐患', -0.3));
    // case-3: the story gives way to the three apps that close the gap, each landing with its name.
    const tSwap = S('case-3', -0.3);
    anim('.cs-a', tSwap, 0.45, { opacity: [1, 0], y: [0, -16] });
    anim('.cs-hl .hA', tSwap, 0.4, { opacity: [1, 0] });
    anim('.cs-hl .hB', tSwap + 0.2, 0.45, { opacity: [0, 1], y: [10, 0] });
    const actCards = root.querySelectorAll('.act'), arrows = root.querySelectorAll('.aa');
    // The first card lands with "三个应用" so the stage is never empty after the swap.
    [['三个应用', -0.1], ['派工工作台', -0.3], ['Move Damage', -0.3]].forEach(([phrase, delta], index) => {
      const t = say('case-3', phrase, delta);
      show(actCards[index], t);
      if (index) fadeIn(arrows[index - 1], t - 0.2);
    });
    fadeIn('.need', S('case-3', 0.3));
  });

  Scene('s11-patrol-plan', { title: '构建巡检任务', tag: '示意画面 · 基于本地 WMS 真实定义', tagKind: 'sim' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, slideIn, type, text, cls, hide, pointer, fn }) => {
    const plan = [
      '{',
      '  "title": "Inventory Patrol",',
      '  "context": { "customer": { "type": "string", "label": "Customer", "input": true } },',
      '  "records": { "reports": { "fields": {',
      '      "issueId": { "type": "string" }, "lpn": { "type": "string" },',
      '      "photo": { "type": "file[]" } } } },',
      '  "steps": [{ "id": "report", "kind": "generated", "title": "Report Issue",',
      '    "page": {',
      '      "info": [{ "type": "fields", "fields": ["Customer", "Reports"] }],',
      '      "work": [',
      '        { "type": "scan", "key": "location", "label": "Location" },',
      '        { "type": "scan", "key": "lpn", "label": "LPN",',
      '          "check": { "path": "/inventory/lpn/{{item}}/inventory" } },',
      '        { "type": "lookup", "key": "item", "label": "Item", "required": false },',
      '        { "type": "select", "key": "issueType", "options": ["Damaged", "Missing", "Other"] },',
      '        { "type": "qty", "key": "qty", "uom": true },',
      '        { "type": "photo", "key": "photo", "required": true } ],',
      '      "footer": [{ "type": "request", "label": "Report Issue",',
      '        "method": "POST", "path": "/inventory/inventory-issue",',
      '        "resetInputs": true,',
      '        "saveTo": { "records": { "reports": "{{response.issue}}" } } }] } }]',
      '}',
    ];
    const chat = agentPage('New conversation', `
          <div class="u1 ma-user">给 Northbridge 做一轮库存巡检，看到破损就拍照上报。</div>
          <div class="a1" style="display:flex;flex-direction:column;gap:4px">
            <div class="t1">${maTool('brain', '[Skill] wms-flows · Inventory Issue')}</div>
            <div class="t2">${maTool('sparkles', '[wms_api] POST /inventory/inventory-issue')}</div>
            <div class="t3">${maTool('brain', '[Skill] genui-task-pages')}</div>
          </div>
          <div class="a2" style="display:flex;flex-direction:column;gap:10px">
            <div class="ma-text">按这个计划巡检，确认后我就创建任务：</div>
            ${maCard({ title: 'Inventory Patrol', subtitle: 'Dynamic · 1 step', badge: ['Draft', 'warning'], body: `
              <div style="padding:8px 13px;font-size:14.5px;line-height:1.55">
                客户：Northbridge Service Parts<br>
                <b>Report Issue</b>（可反复上报）<br>
                ${icon('scan', 15, 'var(--muted)')} 扫库位 → ${icon('scan', 15, 'var(--muted)')} 扫 LPN<br>
                ${icon('checkCircle', 15, 'var(--success)')} 自动带出客户、物料、在库数量<br>
                ${icon('camera', 15, 'var(--muted)')} 照片（必填）· 类型 · 数量<br>
                ${icon('send', 15, 'var(--muted)')} Report Issue → Inventory Issue
              </div>`, actions: ['同意并开始', '提修改意见'] })}
          </div>
          <div class="u2 ma-user">同意并开始</div>
          <div class="a3" style="display:flex;flex-direction:column;gap:8px">${maTool('sparkles', '[propose_genui_task] TASK-18651 created')}<div class="ma-text">已创建 TASK-18651，正在打开任务页。</div>${maWorked('21s')}</div>`);
    const task = `
      <div class="taskpage" style="position:absolute;inset:0;background:var(--canvas)">
        ${mHeader('TASK-18651', 'Dynamic')}
        <div class="m-sec"><div class="m-label">Task</div><div class="m-value">Inventory Patrol</div></div>
        <div class="m-sec"><div class="m-label">Customer</div><div class="m-value">Northbridge Service Parts</div><div style="display:flex;justify-content:flex-end;margin-top:6px"><span class="pill success" style="font-size:13px">0/1 steps</span></div></div>
        <div class="m-row" style="margin-top:10px"><span style="width:28px;height:28px;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:13px;font-weight:700">1</span><div><div style="font-weight:600">Report Issue</div><div style="font-size:13.5px;color:var(--muted)">New</div></div><span style="margin-left:auto">${icon('chevronRight', 20, 'var(--muted)')}</span></div>
        ${UI.askBar()}
      </div>`;
    root.innerHTML = `
      ${phone('ph', chat + task)}
      <div class="ptitle" style="position:absolute;left:720px;top:96px;font-size:22px;font-weight:800">${icon('sparkles', 22, 'var(--primary)')} Agent 生成的计划 <span class="pill neutral" style="font-size:14px;vertical-align:3px">Draft v1 · 256 KB 以内 · 由服务端校验</span></div>
      <div class="codebox plan" style="left:720px;top:142px;width:1104px;height:620px;font-size:16.5px;line-height:1.58;white-space:normal">
        ${plan.map((line) => `<div class="cl">${hlJson(line)}</div>`).join('')}
      </div>
      <div class="notes" style="position:absolute;left:720px;top:806px;width:1104px;display:flex;gap:12px;flex-wrap:wrap">
        ${['context / records 先声明再写', 'LPN 扫描先调只读接口校验', '照片必填，缺失不发请求', 'Report 调真实业务接口', 'resetInputs：一次任务多次上报'].map((n) => `<span class="chip nt">${icon('check', 16, 'var(--success)', 3)} ${n}</span>`).join('')}
      </div>`;
    const [phoneEl] = root.querySelectorAll('.pw');
    show(phoneEl, 0.2, 0.5, 30);
    // Chat: the user's dictated request, the Agent's lookups, the plan, the go-ahead.
    // Hold to talk, as wms-mobile does it: a blue glow rises with the live transcript, the release hint and a
    // waveform; on release the words land in the box while a blue fill shows the transcription finishing; then Send.
    const SAID = '给 Northbridge 做一轮库存巡检，看到破损就拍照上报。';
    const tPress = 0.9, tGlow = 1.1, tSpeak = 2.4, tSpoken = 6.9, tRelease = 7.4, tSend = 8.4;
    // The finger holds on the composer, under the glow; centre the touch on the waveform so the two read as one.
    pointer([[0.3, '.mg-wave', [40, 70]], [tPress, '.mg-wave', null, 'hold'], [tRelease, '.mg-wave'], [tSend, '.ma-composer .send', null, true], [tSend + 0.4, '.ma-composer .send']], { touch: true });
    anim('.ma-glow', tGlow, 0.22, { opacity: [0, 1], y: [48, 0] }, 'out');
    anim('.ma-glow', tRelease, 0.16, { opacity: 0, y: 48 }, 'out');
    anim('.ma-composer .box', tGlow, 0.15, { opacity: [1, 0] });
    anim('.ma-composer .box', tRelease, 0.15, { opacity: 1 });
    const transcript = root.querySelector('.mg-tr');
    // Recognition arrives a word at a time: whole Latin words, single CJK characters.
    const pieces = SAID.match(/[A-Za-z]+|\s+|./g);
    fn((t) => {
      const count = Math.max(0, Math.min(pieces.length, Math.floor(((t - tSpeak) / (tSpoken - tSpeak)) * pieces.length)));
      const shown = pieces.slice(0, count).join('');
      if (transcript.__said !== shown) { transcript.textContent = shown; transcript.__said = shown; }
    });
    // Waveform: 41 bars; the level enters at the centre and travels outward, over a slow ripple.
    const wave = root.querySelector('.ma-glow path');
    const BARS = Array.from({ length: 41 }, (_, index) => {
      const seed = Math.abs(Math.sin((index + 1) * 12.9898) * 43758.5453) % 1;
      const fromCentre = (index - 20) / (41 * 0.3);
      const dome = Math.exp(-fromCentre * fromCentre);
      return { distance: Math.abs(index - 20), dome, envelope: (0.45 + 0.55 * dome) * (0.7 + 0.3 * seed), idle: 0.03 + 0.06 * seed * dome, phase: seed * 1.2 };
    });
    const level = (t) => (t < tSpeak - 0.2 || t > tSpoken + 0.2 ? 0 : 0.25 + 0.55 * Math.abs(Math.sin(t * 9.1) * Math.sin(t * 3.7 + 1.3)));
    fn((t) => {
      if (t < tGlow || t > tRelease + 0.2) return;
      let d = '';
      BARS.forEach(({ distance, dome, envelope, idle, phase }, index) => {
        const sound = level(t - distance * 0.05) * envelope;
        const ripple = 0.2 * dome * (0.5 + 0.5 * Math.sin(t * 5.6 - distance * 0.55 + phase));
        const amount = Math.min(1, Math.max(idle, ripple + sound));
        const reach = Math.max(0.5, (4 + 40 * amount - 3) / 2);
        const x = index * 7 + 1.5;
        d += `M${x} ${22 - reach}V${22 + reach}`;
      });
      wave.setAttribute('d', d);
    });
    // Release: the words are in the box, the blue fill sweeps while the last words are transcribed, Send waits.
    anim('.ma-composer', tRelease, 0.2, { height: [96, 118] }, 'out');
    text('.ma-typed', tRelease, SAID);
    anim('.ma-typed', tRelease + 0.05, 0.15, { opacity: [0, 1] });
    anim('.ma-composer .ph', tRelease, 0.1, { opacity: [1, 0] });
    anim('.ma-fill', tRelease + 0.05, 0.9, { clip: [0, 100] }, 'linear');
    anim('.ma-fill', tRelease + 0.95, 0.2, { opacity: [0.5, 0] });
    cls('.ma-composer .send', 'ready', tRelease + 1.0, tSend + 0.15);
    // Send: the box clears and the message joins the conversation.
    anim('.ma-typed', tSend + 0.1, 0.1, { opacity: 0 });
    anim('.ma-composer .ph', tSend + 0.1, 0.2, { opacity: 1 });
    anim('.ma-composer', tSend + 0.1, 0.2, { height: 96 }, 'out');
    anim('.u1', tSend + 0.15, 0.4, { opacity: [0, 1], y: [12, 0] });
    // The conversation is titled from its first message, a moment after it is sent.
    text('.ma-head .s', tSend + 1.0, 'Northbridge 库存巡检');
    anim('.ma-head .s', tSend + 0.85, 0.15, { opacity: [1, 0.2] });
    anim('.ma-head .s', tSend + 1.0, 0.3, { opacity: 1 });
    stagger('.a1, .t1, .t2, .t3', S('pp-2', 0.3), 1.3, 'show');
    show('.a2', S('pp-2', 5.0));
    // The list follows its newest message, as a chat does: keep the plan card's buttons clear of the composer.
    anim('.ma-msgs', S('pp-2', 5.0), 0.5, { y: [0, -30] }, 'inOut');
    // The worker taps the plan card's approve button; the reply shows as their message.
    // Positions are measured at rest, without the list's scroll; by now the list sits 30px up (see .ma-msgs below).
    pointer([[S('pp-3', -2.4), '.a2 .cbtn.solid', [50, 30]], [S('pp-3', -1.7), '.a2 .cbtn.solid', [0, -30], true], [S('pp-3', -1.3), '.a2 .cbtn.solid', [0, -30]]], { touch: true });
    show('.u2', S('pp-3', -1.2));
    show('.a3', S('pp-3', 0.4));
    anim('.ma-msgs', S('pp-3', -1.2), 0.5, { y: -150 }, 'inOut');
    // Plan JSON on the right, line by line while the Agent explains it.
    fadeIn('.ptitle', S('pp-2', 1.0));
    show('.plan', S('pp-2', 1.0));
    stagger('.plan .cl', S('pp-2', 1.6), 0.42, 'fadeIn');
    stagger('.nt', S('pp-2', 9.8), 0.25, 'pop');
    // Task created: the immersive task page slides over the chat.
    anim('.taskpage', S('pp-3', 1.6), 0.6, { x: [400, 0], opacity: [1, 1] }, 'inOut');
  });

  Scene('s12-patrol-run', { title: '执行巡检任务', tag: '示意画面 · 基于本地 WMS 真实定义', tagKind: 'sim' }, ({ root, S, E, ease, show, pop, stagger, anim, fadeIn, slideIn, type, text, cls, hide, pointer, tap, fn }) => {
    const check = `<span class="ck">${icon('check', 18, 'var(--success)', 2.5)}</span>`;
    const page = `
      ${mHeader('TASK-18651', 'Dynamic · Report Issue', { acts: ['sparkles', 'more'] })}
      <div class="m-body m-page" style="bottom:130px"><div class="pgsc">
        <div class="m-info"><div><div class="m-label">Customer</div><div class="m-value">Northbridge Service Parts</div></div><div><div class="m-label">Reports</div><div class="m-value rc">0</div></div></div>
        <div class="m-work">
          <div class="m-wf"><div class="m-label">Location</div><div class="m-scan sl"><span class="v vl"></span>${check}<span class="ph1">Scan location</span><span class="ico">${icon('scan', 18)}</span></div></div>
          <div class="m-wf"><div class="m-label">LPN</div><div class="m-scan sp"><span class="v vp"></span>${check}<span class="ph2">Scan LPN</span><span class="ico">${icon('scan', 18)}</span></div>
            <div class="m-hint lpnd">Northbridge Service Parts · 12 EA · Good</div></div>
          <div class="m-srs">
            <div class="m-selrow itrow"><span class="l">Item</span><span class="opt itopt">Optional</span><span class="r itv"></span>${icon('chevronRight', 20, 'var(--muted)')}</div>
            <div class="m-selrow selrow"><span class="l">Issue Type</span><span class="req selreq">Required</span><span class="r selv"></span>${icon('chevronRight', 20, 'var(--muted)')}</div>
          </div>
          <div class="m-qtyu"><div class="ql"><div class="m-label">Qty</div><div class="row"><span class="btn">−</span><span class="val qv">0</span><span class="btn">+</span></div></div><div class="qr"><div class="m-label">UOM</div><div class="uomv">EA</div></div></div>
          <div class="m-wphoto"><div class="m-label">Photo</div>
            <div class="tiles">
              <div class="thumbw thumb">${damagedBoxSvg(66)}<span style="position:absolute;right:3px;top:3px;width:20px;height:20px;border-radius:10px;background:#fff;display:grid;place-items:center">${icon('x', 12, 'var(--text)', 3)}</span></div>
              <div class="add addph">${icon('camera', 20)}Photo</div>
            </div>
            <div class="perr m-err" style="padding-left:0">Photo is required</div>
          </div>
        </div>
      </div></div>
      <div class="m-footer" style="bottom:54px"><div class="m-btn rb">Report Issue</div></div>
      <div class="m-toast tok">${icon('check', 18, '#fff')}<span class="tx">ISSUE-106 reported · Good → Damaged</span><span class="x">✕</span></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:54px;z-index:11">${UI.askBar()}</div>
      <div class="cam" style="position:absolute;inset:0;background:#000;z-index:12;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 8px">
          <span style="width:48px;height:48px;display:grid;place-items:center">${icon('x', 24, '#fff')}</span>
          <span style="color:#fff;font-size:18px;font-weight:600">Camera</span>
          <span style="width:48px;height:48px;display:grid;place-items:center">${icon('zap', 22, '#fff')}</span>
        </div>
        <div style="position:relative;flex:1;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(#6b5b4a calc(50% + 47px), #4d4034 0)">
          ${damagedBoxSvg(390)}
          <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.5);border-radius:16px;padding:6px 12px;color:#fff;font-size:13px;white-space:nowrap">Tap to focus</div>
        </div>
        <div style="display:flex;justify-content:center;padding:20px 0">
          <div class="cshut" style="width:76px;height:76px;box-sizing:border-box;border-radius:38px;border:4px solid #fff;display:grid;place-items:center"><div style="width:58px;height:58px;border-radius:29px;background:#fff"></div></div>
        </div>
        <div class="flash" style="position:absolute;inset:0;background:#fff"></div>
      </div>
      <div class="sel-bg" style="position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:9"></div>
      <div class="selsheet" style="position:absolute;left:0;right:0;bottom:54px;background:#fff;border-radius:22px 22px 0 0;z-index:10;padding:10px 0 16px">
        <div style="width:40px;height:4px;border-radius:2px;background:var(--muted);margin:0 auto 14px"></div>
        <div style="font-size:18px;font-weight:700;padding:0 16px 8px">Issue Type</div>
        ${['Damaged', 'Missing', 'Other'].map((o, i) => `<div class="sopt sopt${i}" style="display:flex;align-items:center;padding:14px 16px;font-size:16px;border-top:1px solid var(--line)">${o}<span class="ock${i}" style="margin-left:auto;display:inline-flex">${icon('check', 20, 'var(--primary)', 2.5)}</span></div>`).join('')}
      </div>
      <div class="sheet-bg" style="position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:9"></div>
      ${UI.saveTypeSheet({ cls: 'sheet above-dock', nameCls: 'nm', saveCls: 'sv' })}`;
    const events = [
      ['ev1', 'scan', 'info', '只读校验', 'GET /inventory/lpn/CLP-1005744/inventory', 'Northbridge Service Parts · NB-BAT57-3C · 12 EA · Good'],
      ['ev2', 'ban', 'danger', '必填校验', 'Photo is required', '提交被拦截，没有发出任何写请求'],
      ['ev3', 'alert', 'warning', '业务接口', 'POST /inventory/inventory-issue', 'ISSUE-106 · Damaged · Open · 照片 ×1 · reportedBy John Smith'],
      ['ev4', 'sliders', 'primary', '库存状态回写', 'Inventory Adjustment ADJ-512', 'CLP-1005744 · Goods Condition Good → Damaged · 立即不可拣货'],
      ['ev5', 'database', 'primary', '任务数据', 'Task Record · reports +1', 'TASK-18651 · issueId ISSUE-106 · lpn CLP-1005744'],
      ['ev6', 'rocket', 'success', '沉淀', 'Save as Task Type → Inventory Patrol v1', '明天直接从 Dynamic Tasks 新建，不必再对话'],
    ];
    const rg = (cls, top, height, name, en) => `<div class="rg ${cls}" style="left:20px;width:130px;top:${top}px;height:${height}px;justify-content:flex-end"><div class="tx"><b>${name}</b><span>${en}</span></div><div class="br"></div></div>`;
    root.innerHTML = `
      ${phone('ph', page)}
      ${rg('rg1', 212, 58, '信息区', 'Info · 读')}
      ${rg('rg2', 274, 462, '作业区', 'Work · 做')}
      ${rg('rg3', 740, 72, '步骤操作', 'Step Footer')}
      <div style="position:absolute;left:720px;top:96px;font-size:22px;font-weight:800" class="lt">${icon('history', 22, 'var(--primary)')} 系统回写与证据</div>
      <div style="position:absolute;left:720px;top:144px;width:1104px;display:flex;flex-direction:column;gap:14px">
        ${events.map(([cls, ic, tone, kind, title, detail]) => `
          <div class="ev ${cls} card" style="padding:16px 20px;display:flex;gap:16px;align-items:center">
            <div style="width:48px;height:48px;border-radius:12px;display:grid;place-items:center;background:var(--${tone === 'primary' ? 'primary-soft' : tone + '-bg'});color:var(--${tone})">${icon(ic, 24)}</div>
            <div style="flex:1"><div style="display:flex;gap:10px;align-items:center"><span class="pill ${tone}" style="font-size:13px">${kind}</span><span class="mono" style="font-size:16px;font-weight:600">${title}</span></div><div style="margin-top:5px;font-size:16.5px;color:var(--secondary)">${detail}</div></div>
          </div>`).join('')}
      </div>`;
    show('.pw', 0.1, 0.4, 20);
    fadeIn('.lt', 0.4);
    root.querySelectorAll('.rg').forEach((el, index) => fadeIn(el, 0.6 + index * 0.2));
    // pr-1: scan location, scan LPN (its check result shows under the box), choose Damaged, qty from the LPN.
    const s1 = S('pr-1', 0.6);
    const c1 = S('pr-4', -1.0);
    text('.vl', s1, 'A12-05-1'); hide('.ph1', s1, 0.01);
    cls('.sl', 'ok', s1, c1);
    const s2 = s1 + 1.4;
    text('.vp', s2, 'CLP-1005744'); hide('.ph2', s2, 0.01); cls('.sp', 'ok', s2, c1);
    anim('.lpnd', s2 + 0.2, 0.4, { opacity: [0, 1] });
    text('.itv', s2 + 0.2, 'NB-BAT57-3C'); cls('.itopt', 'gone', s2 + 0.2, c1);
    text('.qv', s2 + 0.2, '12');
    show('.ev1', s2 + 0.5);
    const o = s2 + 1.2;
    pointer([[o - 0.6, '.lpnd', [60, 30]], [o, '.selrow', null, true], [o + 0.4, '.selrow']], { touch: true });
    anim('.sel-bg', o + 0.2, 0.25, { opacity: [0, 1] });
    anim('.selsheet', o + 0.2, 0.4, { y: [320, 0] }, 'out');
    pointer([[o + 0.7, '.selrow'], [o + 1.2, '.sopt0', null, true], [o + 1.6, '.sopt0']], { touch: true });
    anim('.ock0', o + 1.25, 0.15, { opacity: [0, 1] });
    anim('.ock1, .ock2', 0, 0.01, { opacity: [0, 0] });
    anim('.selsheet', o + 1.6, 0.3, { y: 320 }, 'in');
    anim('.sel-bg', o + 1.6, 0.25, { opacity: 0 });
    text('.selv', o + 1.6, 'Damaged'); cls('.selreq', 'gone', o + 1.6, c1);
    // pr-2: Report without a photo is refused on the page; nothing is sent.
    const r1 = S('pr-2', -1.2);
    pointer([[r1 - 0.6, '.addph', [0, 40]], [r1, '.rb', null, true], [r1 + 1.0, '.rb']], { touch: true });
    fadeIn('.perr', r1 + 0.3, 0.2);
    // The page scrolls to the error, which sits just under the fold above the footer and the docked agent bar,
    // and back to the top when the page clears. How far depends on the browser's fonts: measure the overflow.
    // The later pointer keys get their offsets from the same measure (they are resolved on the first frame,
    // with whatever scroll that frame shows, hence `- shown`).
    const photoShift = [0, 0], thumbShift = [0, 40];
    const clamp01 = (value) => Math.max(0, Math.min(1, value));
    let overflow = null;
    fn((t) => {
      const content = root.querySelector('.pgsc');
      const scroll = (value) => -(overflow ?? 0) * ease.out(clamp01((value - (r1 + 0.3)) / 0.35)) * (1 - ease.inOut(clamp01((value - c1) / 0.35)));
      if (overflow === null) {
        overflow = Math.max(0, content.offsetHeight - content.parentElement.clientHeight);
        const shown = scroll(t);
        photoShift[1] = -overflow - shown;
        thumbShift[1] = 40 - overflow - shown;
      }
      content.style.transform = `translateY(${scroll(t)}px)`;
    });
    show('.ev2', r1 + 0.6);
    // pr-3: take the photo, report, the issue and the adjustment are written.
    const p1 = S('pr-3', 0.2);
    pointer([[p1 - 0.5, '.rb', [0, -60]], [p1, '.addph', photoShift, true], [p1 + 0.4, '.addph', photoShift], [p1 + 1.55, '.cshut', null, true], [p1 + 1.9, '.cshut']], { touch: true });
    anim('.cam', p1 + 0.3, 0.3, { opacity: [0, 1] });
    anim('.flash', p1 + 1.6, 0.35, { opacity: [0.9, 0] });
    anim('.flash', p1 + 1.59, 0.01, { opacity: [0, 0] });
    anim('.cam', p1 + 2.0, 0.3, { opacity: 0 });
    cls('.thumb', 'shown', p1 + 2.1, c1);
    hide('.perr', p1 + 2.1, 0.2);
    const rep = p1 + 3.4;
    pointer([[rep - 0.6, '.thumb', thumbShift], [rep, '.rb', null, true], [rep + 0.8, '.rb']], { touch: true });
    anim('.tok', rep + 0.6, 0.3, { opacity: [0, 1], y: [-10, 0] });
    anim('.tok', S('pr-4', 0.6), 0.3, { opacity: 0 });
    show('.ev3', rep + 0.9);
    show('.ev4', rep + 3.2);
    show('.ev5', rep + 6.0);
    // pr-4: the page clears for the next report; then Save as Task Type from the ⋮ menu.
    text('.rc', c1, '1');
    text('.vl', c1, ''); text('.vp', c1, ''); text('.qv', c1, '0'); text('.selv', c1, ''); text('.itv', c1, '');
    anim('.ph1, .ph2', c1, 0.2, { opacity: 1 });
    anim('.lpnd', c1, 0.3, { opacity: 0 });
    const m1 = S('pr-4', 3.0);
    pointer([[m1 - 0.8, '.lpnd', [60, -40]], [m1, '.m-header .acts svg:last-child', null, true], [m1 + 0.4, '.m-header .acts svg:last-child']], { touch: true });
    anim('.sheet-bg', m1 + 0.4, 0.3, { opacity: [0, 1] });
    anim('.sheet', m1 + 0.4, 0.45, { y: [440, 0] }, 'out');
    type('.nm', m1 + 1.0, 'Inventory Patrol', 16);
    pointer([[m1 + 2.4, '.nm', [40, 60]], [m1 + 3.1, '.sv', null, true], [m1 + 3.6, '.sv']], { touch: true });
    anim('.sheet', m1 + 3.5, 0.35, { y: 440 }, 'in');
    anim('.sheet-bg', m1 + 3.5, 0.3, { opacity: 0 });
    show('.ev6', m1 + 3.6);
  });
})();
