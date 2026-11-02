// s07 view module + Wasm sandbox · s07b Custom Object (VAS) · s08 composable Move Inventory · s09 controlled release
(() => {
  const { icon, chapter } = UI;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // Tiny highlighter for the code panels: strings, keywords, comments, numbers.
  const hl = (line) => esc(line)
    .replace(/(\/\/.*)$/, '<span class="c">$1</span>')
    .replace(/('[^']*')/g, '<span class="s">$1</span>')
    .replace(/\b(export|const|async|await|return)\b/g, '<span class="k">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');

  Scene('s07-view', { title: 'Dynamic View API', tag: '架构示意 · 真实机制' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, slideIn, fn, ease }) => {
    // The real `overview` View API behind the Inventory Issue Overview page (F26102701, module 25c4a743…ee62d).
    const code = [
      '// views.ts — Dynamic View API · read-only, evaluated in the Wasm sandbox',
      "const TYPES = ['Damaged', 'Item Not Found', 'Empty Location', 'Location Not Reachable'];",
      "const STATUSES = ['Open', 'In Progress', 'Resolved'];",
      'export const views = {',
      '  overview: async ({ wms }) => {',
      '    // one exact count per type × status: the total of a filtered search',
      '    const count = async (issueType, status) =>',
      "      (await wms.search('/inventory/inventory-issue/search', {",
      '        page: 1, pageSize: 1,',
      "        criteria: [{ field: 'issueType', operator: 'eq', value: issueType },",
      "                   { field: 'status', operator: 'eq', value: status }],",
      '      })).total;',
      '    const counts = await Promise.all(TYPES.flatMap((t) => STATUSES.map((s) => count(t, s))));',
      '    const byType = TYPES.map((type, i) => {',
      '      const [open, inProgress, resolved] = counts.slice(i * 3, i * 3 + 3);',
      '      return { type, open, inProgress, resolved, total: open + inProgress + resolved };',
      '    });',
      '    const sum = (key) => byType.reduce((n, row) => n + row[key], 0);',
      "    return { open: sum('open'), inProgress: sum('inProgress'),",
      "             resolved: sum('resolved'), byType };",
      '  },',
      '};',
    ];
    const api = (text) => `<div class="bapi mono" style="height:40px;display:flex;align-items:center;padding:0 12px;border-radius:10px;background:#fff;border:1px solid var(--line);font-size:13px;color:#3b2a72;white-space:nowrap">${text}</div>`;
    const consumer = (ic, title, sub) => `<div class="bcons card" style="padding:12px 14px;display:flex;align-items:center;gap:10px">${icon(ic, 20, 'var(--primary)')}<div><div style="font-size:16px;font-weight:700">${title}</div><div style="font-size:13.5px;color:var(--muted)">${sub}</div></div></div>`;
    root.innerHTML = `
      ${chapter('Part 2 · Dynamic View API', 'Agent 按场景生成只读 View API，WMS 在 Wasm 沙箱里受控执行')}
      <div class="codebox cb" style="left:96px;top:240px;width:880px;height:600px;font-size:14.5px;white-space:normal">
        <div class="code-h">${icon('code', 15)} views.ts · module 25c4a743…ee62d <span style="margin-left:auto">${icon('sparkles', 14, '#c4a7ff')} written by Agent</span></div>
        ${code.map((line) => `<div class="cl">${hl(line) || ' '}</div>`).join('')}
      </div>
      <div class="pv chip" style="position:absolute;left:96px;top:864px;font-size:17px;border-color:var(--success-line);background:var(--success-bg);color:var(--success)">${icon('checkCircle', 18)} <b class="mono">preview_view overview</b> · 4 types · 12 WMS calls · 1 response</div>
      <div class="bff" style="position:absolute;left:1030px;top:240px;width:794px;height:600px">
        <div style="display:flex;align-items:center;gap:10px;font-size:20px;font-weight:800">${icon('layers', 22, 'var(--primary)')} BFF 模式 <span style="font-size:16px;font-weight:500;color:var(--secondary)">整合现有接口 → 一份界面要的数据</span></div>
        <svg style="position:absolute;left:0;top:0;overflow:visible" width="794" height="600"><g stroke="#8b74c9" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path class="blink1" d="M126 120 V140 H668 V120 M397 120 V162"/>
          <path class="blink2" d="M397 254 V284"/>
          <path class="blink3" d="M397 396 V470 M120 432 H674 M120 432 V470 M674 432 V470"/></g></svg>
        <div class="bff-l bl1" style="top:56px">① WMS 现有接口 · 只读</div>
        <div style="position:absolute;left:0;top:80px;width:794px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
          ${api('search · Damaged / Open')}${api('search · Damaged / Resolved')}${api('… 共 12 次 · 类型 × 状态')}
        </div>
        <div class="bview" style="position:absolute;left:87px;top:162px;width:620px;height:92px;border-radius:16px;background:linear-gradient(160deg,#6b4cc0,#4a2d91);color:#fff;padding:0 20px;display:flex;align-items:center;gap:14px;box-shadow:0 14px 32px rgba(85,53,160,.3)">
          <div style="width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.14);display:grid;place-items:center">${icon('cpu', 24, '#fff')}</div>
          <div style="white-space:nowrap"><div style="font-size:13px;opacity:.85">Dynamic View API · Wasm 层</div><div class="mono" style="font-size:22px;font-weight:700">overview</div></div>
          <div style="margin-left:auto;display:flex;gap:6px">${['Wasm 沙箱', '只读令牌', '整合 · 计算 · 拼装'].map((t) => `<span style="padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.14);font-size:13px;white-space:nowrap">${t}</span>`).join('')}</div>
        </div>
        <div class="codebox bout" style="left:177px;top:284px;width:440px;height:112px;padding:14px 20px;font-size:14px;line-height:1.6;box-shadow:none"><span class="c">// one response</span>
{ <span class="k">open</span>: <span class="n">7</span>, <span class="k">inProgress</span>: <span class="n">0</span>, <span class="k">resolved</span>: <span class="n">2</span>,
  <span class="k">byType</span>: [ <span class="c">4 rows</span> ] }</div>
        <div class="bff-l bl2" style="top:199px">② Wasm 层</div>
        <div class="bff-l bl3" style="top:331px">③ 一份数据</div>
        <div class="bff-l bl4" style="top:442px">④ 消费者</div>
        <div style="position:absolute;left:0;top:470px;width:794px;display:grid;grid-template-columns:repeat(3,1fr);gap:37px">
          ${consumer('monitor', 'Dynamic Page', '统计看板：数字 · 柱状 · 环形 · 进度')}${consumer('message', 'Dynamic Card', '对话里的一张结果卡')}${consumer('phone', 'Dynamic Task', '手机任务页的信息区')}
        </div>
        ${[0, 1, 2].map((lane) => `<span class="bdot bd${lane}"></span>`).join('')}
        <div class="bnote" style="position:absolute;left:0;top:576px;width:794px;font-size:16px;color:var(--secondary)">像页面专用的只读接口：按需计算、不存储，以当前用户身份执行。</div>
      </div>
      <div class="sb" style="position:absolute;left:1030px;top:240px;width:794px;height:600px;border-radius:20px;border:2px dashed var(--line-strong);padding:20px 24px">
        <div style="display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700;color:var(--secondary)">${icon('cpu', 22)} Dynamic View API runtime</div>
        <div class="wasm" style="position:absolute;left:24px;right:24px;top:64px;height:140px;border-radius:18px;background:linear-gradient(160deg,#6b4cc0,#4a2d91);color:#fff;padding:20px 24px;box-shadow:0 16px 40px rgba(85,53,160,.3)">
          <div style="font-size:22px;font-weight:800">WebAssembly 沙箱</div>
          <div style="font-size:15.5px;opacity:.85">固定的 QuickJS 解释器 · 冻结 realm · 每次调用隔离</div>
          <div class="mod" style="margin-top:14px;display:inline-flex;gap:8px;align-items:center;padding:7px 14px;border-radius:10px;background:rgba(255,255,255,.14);font-family:var(--mono);font-size:14.5px">${icon('hash', 16, '#fff')} sha256 25c4a743…ee62d · 代码不可变</div>
        </div>
        <div style="position:absolute;left:24px;right:24px;top:226px;display:flex;flex-direction:column;gap:14px">
          ${[
            ['sr1', 'ban', 'danger', '隔离运行', '只在沙箱里执行，碰不到宿主机', [['folder', '文件系统'], ['terminal', '环境变量'], ['globe', '其他网络']].map(([ic, t]) => `<span class="chip sr-chip no">${icon(ic, 15)} ${t} ${icon('x', 14, 'var(--danger)', 3)}</span>`).join('')],
            ['sr2', 'eye', 'success', '只读访问', '只能调用 WMS 的只读接口，不能写入', `<span class="chip sr-chip yes">${icon('checkCircle', 15)} GET · HEAD · POST …/search</span>`],
            ['sr3', 'key', 'primary', '用户身份', '用当前用户的只读令牌调用，权限不超过本人', `<span class="chip sr-chip id">${icon('shield', 15)} 角色权限 · 仓库隔离 同样生效</span>`],
          ].map(([cls, ic, tone, title, desc, chips]) => `
            <div class="sr ${cls} card">
              <div class="sr-ic ${tone}">${icon(ic, 22)}</div>
              <div class="sr-tx"><b>${title}</b><span>${desc}</span></div>
              <div class="sr-chips">${chips}</div>
            </div>`).join('')}
        </div>
      </div>
`;
    show('.cb', S('view-1', 0.2), 0.5);
    stagger('.cl', S('view-1', 1.0), 0.28, 'fadeIn');
    // view-1: the BFF picture — existing APIs in, one shaped response out to every GenUI surface.
    const at = (seg, frac) => S(seg) + (E(seg) - S(seg)) * frac;
    fadeIn('.bl1', at('view-1', 0.35) - 0.2);
    stagger('.bapi', at('view-1', 0.35), 0.3, 'slideIn');
    // Each link appears just before the box it leads into: APIs → view, view → response, response → surfaces.
    anim('.blink1', at('view-1', 0.45), 0.6, { clip: [0, 100] });
    fadeIn('.bl2', at('view-1', 0.5));
    pop('.bview', at('view-1', 0.5));
    anim('.blink2', at('view-1', 0.6), 0.3, { clip: [0, 100] });
    fadeIn('.bl3', at('view-1', 0.62));
    show('.bout', at('view-1', 0.62));
    anim('.blink3', at('view-1', 0.71), 0.6, { clipY: [0, 100] });
    fadeIn('.bl4', at('view-1', 0.74) - 0.2);
    stagger('.bcons', at('view-1', 0.74), 0.3, 'pop');
    // The response travels to each consumer: dots slide along the three branches until the scene moves on.
    const lanes = [[[397, 396], [397, 432], [120, 432], [120, 470]], [[397, 396], [397, 470]], [[397, 396], [397, 432], [674, 432], [674, 470]]];
    const along = (points, f) => {
      const segs = points.slice(1).map((pt, i) => Math.hypot(pt[0] - points[i][0], pt[1] - points[i][1]));
      let d = f * segs.reduce((a, b) => a + b, 0);
      for (let i = 0; i < segs.length; i++) {
        if (d <= segs[i]) { const r = d / segs[i]; return [points[i][0] + (points[i + 1][0] - points[i][0]) * r, points[i][1] + (points[i + 1][1] - points[i][1]) * r]; }
        d -= segs[i];
      }
      return points[points.length - 1];
    };
    // One round at a time: the three dots leave together, arrive together, and the next round leaves after a pause.
    const flowFrom = at('view-1', 0.8), flowTo = S('view-2', 0), travel = 1.1, pause = 0.5;
    lanes.forEach((points, lane) => {
      const dot = root.querySelector(`.bd${lane}`);
      fn((t) => {
        const local = (t - flowFrom) % (travel + pause);
        const live = t >= flowFrom && t < flowTo && local < travel;
        dot.style.opacity = live ? 1 : 0;
        if (!live) return;
        const f = ease.inOut(local / travel);
        const [x, y] = along(points, f);
        dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
        if (f > 0.9) dot.style.opacity = (1 - f) * 10;
      });
    });
    fadeIn('.bnote', at('view-1', 0.85));
    anim('.bff', S('view-2', 0), 0.4, { opacity: 0 });
    pop('.pv', E('view-1', -0.8));
    show('.sb', S('view-2', 0.2));
    pop('.wasm', S('view-2', 0.8));
    pop('.mod', S('view-2', 2.4));
    show('.sr1', at('view-2', 0.32));
    show('.sr2', at('view-2', 0.62));
    show('.sr3', at('view-2', 0.8));
  });

  Scene('s07b-object', { title: 'Custom Object', tag: '架构示意 · 示意数据' }, ({ root, segs, S, show, pop, stagger, anim, fadeIn, hide, cls }) => {
    // The moment the narration reaches `phrase` inside a segment (by character position).
    const say = (seg, phrase, delta = 0) => {
      const g = segs[seg];
      if (!g) return delta;
      const index = g.text.indexOf(phrase);
      return g.start + (g.end - g.start) * (Math.max(0, index) / g.text.length) + delta;
    };
    // obj-1 picture: a VAS Order object page drawn after wms-web CustomObjectView (Details · Lines · Records ·
    // Related Tasks) beside the type the Agent drafted (ODEF body: preset, header fields, statuses, line set, record collection).
    const K = (k) => `<span style="color:var(--primary)">${k}</span>`;
    const V = (v) => `<span style="color:var(--success)">${v}</span>`;
    const N = (n) => `<span style="color:var(--warning)">${n}</span>`;
    const ocard = (cls, title, trailing, layer, body) => `
      <div class="ocd ${cls}"><div class="ocd-h">${title}${trailing ? `<span class="ocd-t">${trailing}</span>` : ''}<span class="ol-tag">${layer}</span></div>${body}</div>`;
    const status = (st) => `<span class="pill ${st === 'Closed' ? 'success' : st === 'In Progress' ? 'info' : 'neutral'}" style="font-size:12px;padding:1px 9px">${st}</span>`;
    const lines = [
      [1, 'Apply price label', 'NB-BAT57-3C', '120 EA', 'Closed'],
      [2, 'Bundle 2-pack · shrink wrap', 'NB-ADP65-USBC', '60 EA', 'Closed'],
      [3, 'Insert user guide', 'NB-BAT57-3C', '120 EA', 'In Progress'],
      [4, 'Repack to retail carton', 'NB-BAT57-3C', '20 CS', 'New'],
    ];
    const records = [['10/28/2026 09:42', 1, '120 EA', 'Maria Garcia'], ['10/28/2026 10:15', 2, '60 EA', 'John Smith'], ['10/28/2026 11:03', 3, '48 EA', 'Maria Garcia']];
    const tasks = [['Price Labeling', 'TASK-18660', 'Closed'], ['Bundling', 'TASK-18661', 'Closed'], ['Insert & Repack', 'TASK-18662', 'In Progress']];
    // obj-2: Custom Object beside Dynamic Task — the same three-layer storage (genui-row-store serves both).
    const tcard = (title, body, plain) => `<div class="card" style="height:100%;padding:16px 16px;${plain ? 'padding-left:21px;background:var(--raised);box-shadow:none;border-color:transparent' : 'border-left:5px solid var(--primary)'}"><div style="font-size:18px;font-weight:800">${title}</div><div style="margin-top:3px;font-size:14.5px;color:var(--secondary)">${body}</div></div>`;
    const orow = (cls, leftTitle, leftBody, rightTitle, rightBody, mark, style = '', plain = false) => `
      <div class="${cls}" style="display:grid;grid-template-columns:330px 1fr 330px;align-items:stretch;${style}">
        <div class="oleft">${tcard(leftTitle, leftBody, plain)}</div>
        <div class="omark" style="align-self:center;text-align:center;font-size:24px;font-weight:700;color:#8b74c9">${mark}</div>
        <div class="oright">${tcard(rightTitle, rightBody, plain)}</div>
      </div>`;
    const chain = ['Requested', 'In Progress', 'Closed'];
    root.innerHTML = `
      ${chapter('Part 2 · Custom Object', '需要长期保存的客户数据，用 Custom Object', '以仓库常见的增值服务（VAS）为例：单头 · VAS 指令 · 完成记录')}
      <div class="ow window" style="left:96px;top:228px;width:900px;height:658px">
        <div class="chrome"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">/custom-objects/ODEF-3/VAS-12</span></div>
        <div class="web" style="position:relative;width:900px;height:624px">
          <div class="content" style="padding:12px 18px">
            <div class="crumb" style="font-size:13px">VAS Order</div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:2px">
              <div class="title" style="margin:0;font-size:19px">Retail Prep · VAS-12</div>
              <span class="ost" style="margin-left:auto">${status('In Progress')}</span><span class="ost" style="color:var(--primary);font-weight:600;font-size:13.5px">Close</span>
            </div>
            ${ocard('ohdr', 'Details', '', 'Header', `<div class="ocd-b" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:12px">${[['Customer', 'Northbridge Service Parts'], ['Outbound Order', 'OB-2318'], ['Due Date', '10/30/2026'], ['Requested By', 'Emily Carter']].map(([l, v]) => `<div><div style="font-size:11.5px;color:var(--muted)">${l}</div><div style="font-size:13.5px;font-weight:500;white-space:nowrap">${v}</div></div>`).join('')}</div>`)}
            ${ocard('olin', 'VAS Instructions', '2 of 4 closed', 'Lines', `<table><tr><th>Line</th><th>Instruction</th><th>Item</th><th>Qty</th><th>Status</th></tr>${lines.map(([no, what, item, qty, st]) => `<tr class="olr"><td>${no}</td><td>${what}</td><td>${item}</td><td>${qty}</td><td>${status(st)}</td></tr>`).join('')}</table>`)}
            ${ocard('orec', 'Completion Records', '3 records', 'Records', `<table><tr><th>Recorded At</th><th>Line</th><th>Done Qty</th><th>Photo</th><th>By</th></tr>${records.map(([at, no, qty, by]) => `<tr class="orr"><td>${at}</td><td>${no}</td><td>${qty}</td><td><span class="oph">${icon('image', 14, 'var(--muted)')}</span></td><td>${by}</td></tr>`).join('')}</table>`)}
            ${ocard('otsk', 'Related Tasks', '', '3 个任务', `<div class="ocd-b" style="display:flex;gap:10px">${tasks.map(([title, id, st]) => `<div class="otk"><span style="color:var(--primary);font-weight:500">${title}</span><span class="mono" style="font-size:12px;color:var(--muted)">${id}</span>${status(st)}</div>`).join('')}</div>`)}
          </div>
        </div>
      </div>
      <div class="odef card" style="position:absolute;left:1060px;top:228px;width:764px;height:658px;padding:24px 26px">
        <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--primary)">${UI.agentMark(15, 'var(--primary)', 2)}Agent 按客户要求起草 · 有权限的人审核发布</div>
        <div style="margin-top:12px;display:flex;align-items:center;gap:12px">${icon('tag', 24, 'var(--primary)')}<span style="font-size:26px;font-weight:800">VAS Order</span>
          <span class="pill neutral" style="font-size:13px;padding:2px 10px">Custom Object Type · ODEF-3</span><span class="odp pill success" style="margin-left:auto;font-size:13px;padding:2px 10px">v1 · Published</span></div>
        <div class="mono odecl">
          <div class="dg dg0">${K('prefix')}: ${V('"VAS"')},  ${K('preset')}: ${V('"Transactional"')},</div>
          <div class="dg dg1">${K('fields')}: {
  ${K('customer')}:      { type: ${V('"ref"')}, ref: { target: ${V('"organization"')} } },
  ${K('outboundOrder')}: { type: ${V('"string"')} },
  ${K('dueDate')}:       { type: ${V('"date"')} } },</div>
          <div class="dg dg2">${K('statuses')}: { ${V('Requested')}, ${V('In Progress')}, ${V('Closed')}, ${V('Cancelled')} },
${K('transitions')}: [ Requested → In Progress → Closed, … ],</div>
          <div class="dg dg3">${K('lines')}: { ${K('instructions')}: {
  fields: { ${K('instruction')}, ${K('item')}, ${K('qty')} },
  trackStatus: ${N('true')} } },</div>
          <div class="dg dg4">${K('records')}: { ${K('completions')}: {
  fields: { ${K('line')}, ${K('doneQty')}, ${K('photo')} } } }</div>
        </div>
        <div style="position:absolute;left:26px;right:26px;bottom:22px;display:flex;align-items:center;gap:8px;font-size:14.5px;color:var(--secondary)">${icon('check', 15, 'var(--success)', 3)}不建表：定义与数据存在平台管理的通用表里，全程审计</div>
      </div>
      <div class="obj" style="position:absolute;left:1060px;top:228px;width:764px">
        <div style="display:grid;grid-template-columns:330px 1fr 330px;align-items:center">
          <div class="oleft ohead" style="display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800">${icon('listChecks', 22, 'var(--primary)')} Dynamic Task</div>
          <div></div>
          <div class="oright ohead" style="display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800">${icon('box', 22, 'var(--primary)')} Custom Object</div>
        </div>
        ${orow('o1', 'Task Context', '即任务的单头 · 一个文档', 'Object Header', `VAS 单头 · 一个文档 <b style="color:var(--primary)">+ 自己的状态流转</b>
          <div class="ochain" style="margin-top:8px;display:flex;align-items:center;gap:3px;white-space:nowrap">${chain.map((st, i) => `${i ? `<span class="ocha" style="display:inline-flex">${icon('arrowRight', 11, 'var(--muted)')}</span>` : ''}<span class="pill ${i === 2 ? 'neutral' : 'primary'}" style="font-size:11px;padding:0 6px">${st}</span>`).join('')}</div>`, '=', 'margin-top:14px')}
        <div class="oeng" style="position:relative;margin:38px -14px 0;padding:24px 14px 14px;border:1.5px dashed #8b74c9;border-radius:16px">
          <div style="position:absolute;left:50%;top:0;transform:translate(-50%,-50%);display:flex;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;background:var(--canvas);border:1.5px solid var(--primary-line);color:var(--primary);font-weight:600;font-size:15px;white-space:nowrap">${icon('layers', 16)} 同一套文档集合引擎 · 同一份代码</div>
          ${orow('o2', 'Task Lines', '要做什么 · 任务明细', 'Object Lines', 'VAS 指令 · 计划要做的工作', '=')}
          ${orow('o3', 'Task Records', '采集到了什么', 'Object Records', '完成数量 · 照片', '=', 'margin-top:10px')}
        </div>
        ${orow('o4', 'Task Definition', 'TDEF · 版本化 · 审核发布', 'Custom Object Type', 'ODEF · 版本化 · 审核发布', '↔', 'margin-top:29px', true)}
        <div class="odiff" style="margin-top:24px;display:grid;grid-template-columns:330px 1fr 330px;align-items:center;font-size:15.5px;color:var(--secondary)">
          <div>${icon('checkCircle', 16, 'var(--success)')} 任务做完就关闭</div><div style="text-align:center;font-weight:700;color:var(--muted)">vs</div>
          <div>${icon('history', 16, 'var(--primary)')} 对象长期存在，被多个任务引用</div>
        </div>
      </div>
      <div class="take pill primary" style="position:absolute;left:1060px;top:901px;font-size:19px;padding:9px 20px">${icon('layers', 19)} 和入库单、出库单一样：单头 · 明细 · 记录 → Agent 建模自然贴合 WMS</div>`;

    // obj-1: the object page, then the type the Agent drafted; each layer lights up on the page and in the
    // definition as the narration names it.
    show('.ow', S('obj-1', 0.3), 0.6, 30);
    stagger('.ocd', S('obj-1', 0.9), 0.2, 'fadeIn');
    show('.odef', say('obj-1', 'Agent 按客户'));
    stagger('.dg', say('obj-1', 'Agent 按客户', 0.4), 0.25, 'fadeIn');
    pop('.odp', say('obj-1', '审核发布'));
    const beats = [
      ['.ohdr', '.dg1', say('obj-1', '单头')],
      ['.ost', '.dg2', say('obj-1', '状态流转')],
      ['.olin', '.dg3', say('obj-1', '每条 VAS 指令')],
      ['.orec', '.dg4', say('obj-1', '现场完成的数量')],
    ];
    beats.forEach(([card, decl, t], index) => {
      const until = beats[index + 1]?.[2] ?? S('obj-2', 0);
      cls(card, 'hl', t, until);
      cls(decl, 'on', t, until);
      if (card !== '.ost') pop(`${card} .ol-tag`, t);
    });
    stagger('.olr', say('obj-1', '每条 VAS 指令', 0.3), 0.18, 'fadeIn');
    stagger('.orr', say('obj-1', '现场完成的数量', 0.3), 0.2, 'fadeIn');
    // obj-2: the definition steps aside; Custom Object is compared layer by layer with Dynamic Task.
    hide('.odef', S('obj-2', 0), 0.4);
    stagger('.obj .oleft', S('obj-2', 0.4), 0.15, 'fadeIn');
    show('.o1 .oright', say('obj-2', 'Object Header'));
    anim('.o1 .omark, .obj .ohead.oright', say('obj-2', 'Object Header'), 0.4, { opacity: [0, 1] });
    stagger('.ochain .pill', say('obj-2', 'Object Header', 0.5), 0.2, 'pop');
    stagger('.ochain .ocha', say('obj-2', 'Object Header', 0.62), 0.2, 'fadeIn');
    anim('.oeng', say('obj-2', 'Lines 和 Records'), 0.5, { opacity: [0, 1] });
    stagger('.o2 .oright, .o3 .oright, .o2 .omark, .o3 .omark', say('obj-2', 'Lines 和 Records', 0.2), 0.15, 'fadeIn');
    stagger('.o4 .oright, .o4 .omark', say('obj-2', '区别是'), 0.15, 'fadeIn');
    show('.odiff', say('obj-2', '区别是', 0.3));
    cls('.otsk', 'hl', say('obj-2', '被多个任务引用'));
    pop('.otsk .ol-tag', say('obj-2', '被多个任务引用'));
    pop('.take', say('obj-2', '和入库单'));
  });

  Scene('s08-composable', { title: 'Composable Step', tag: '架构示意 · 真实机制' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, slideIn, cls, text, hide }) => {
    const uses = [
      ['puzzle', '组装 Assembly', '从各料位 LPN 取组件 → 放入工位的 LPN', 96, 300],
      ['refresh', '补货 Replenish', '从存储位 LPN 取货 → 放入拣货位 VLP', 96, 520],
      ['merge', '库位优化 Consolidation', '把多个 LPN 的零散库存取到一个 LPN', 1344, 300],
      ['alert', '坏货处理 Move Damage', '取出破损库存（整托或部分）→ 放到坏货区', 1344, 520],
    ];
    root.innerHTML = `
      ${chapter('Part 2 · Composable Step', '把反复出现的常用模块，抽象成可组合的步骤', '随系统演进持续发现、沉淀，供 Agent 和用户按需选用 · Move Inventory 是其中一个典型')}
      <div class="lib" style="position:absolute;left:96px;top:232px;width:1728px;display:flex;align-items:center;gap:12px">
        <span class="lib-h">${icon('layers', 20, 'var(--primary)')} Composable Step 库</span>
        <span class="lib-step on">${icon('box', 16)} Move Inventory <em>本页示例</em></span>
        ${['其他常用模块', '其他常用模块'].map((t) => `<span class="lib-step next">${icon('plus', 15)} ${t}</span>`).join('')}
        <span class="lib-note">随系统演进持续抽象</span>
      </div>
      <div class="core" style="position:absolute;left:600px;top:300px;width:720px;height:420px;border-radius:24px;background:#fff;border:2px solid var(--primary-line);box-shadow:0 20px 50px rgba(85,53,160,.14);padding:22px 28px">
        <div style="display:flex;align-items:baseline;gap:12px"><span style="font-size:28px;font-weight:800">Move Inventory</span><span class="pill primary" style="font-size:13px">composable-move-inventory</span></div>
        <div style="font-size:16.5px;color:var(--secondary);margin-top:2px">在 LPN 之间移动物料库存，再把装好的 LPN 放到目标库位</div>
        <div class="dg" style="position:absolute;left:28px;top:96px;width:664px;height:200px">
          <div class="mi-frame" style="left:0"><div class="mi-fl">${icon('pin', 14)} 来源库位 <span class="mono">A-03-01</span></div></div>
          <div class="mi-frame custody" style="left:234px"><div class="mi-fl">${icon('hand', 14)} 任务托管 · 无库位</div></div>
          <div class="mi-frame mi-slot" style="left:468px"><span class="mi-scan sc3">Scan</span><div class="mi-fl">${icon('pin', 14)} 目标库位 <span class="mono">DMG-01</span></div><span class="mi-placed">${icon('checkCircle', 14)} Placed</span></div>
          <div class="mi-arrow" style="left:202px">${icon('chevronRight', 26, 'rgba(85,53,160,.5)', 2.6)}</div>
          <div class="mi-arrow" style="left:436px">${icon('chevronRight', 26, 'rgba(85,53,160,.5)', 2.6)}</div>
          <div class="mi-lpn mi-src" style="left:12px"><div class="mi-h"><b class="mono">CLP-1005601</b></div><span class="mi-scan sc1">Scan</span></div>
          <div class="tolpn mi-lpn mi-to" style="z-index:2;left:246px"><div class="mi-h"><b class="mono tolbl">新 To LPN（空）</b></div><span class="mi-scan sc2">Scan</span></div>
          ${[[0, 0, 'a'], [1, 0, 'a'], [2, 0, 'a'], [0, 1, 'a'], [1, 1, 'b'], [2, 1, 'b']].map(([c, r, k], i) => `<div class="tile mi-tile t${i} ${k}" style="left:${24 + c * 51}px;top:${52 + r * 46}px">1 EA</div>`).join('')}
        </div>
        <div style="position:absolute;left:28px;right:28px;top:318px;display:flex;flex-direction:column;gap:7px;font-size:15px">
          <div class="lbl-take"><span class="pill info" style="font-size:13.5px">① Take</span> 扫来源 LPN → 选库存行与数量 → 扫 To LPN</div>
          <div class="lbl-place"><span class="pill success" style="font-size:13.5px">② Place</span> 扫持有的 LPN → 扫目标库位</div>
          <div class="note" style="color:var(--muted);font-size:14px">整托移动（Entire LPN）只是其中一种；也支持部分取货、多次取货并入同一 To LPN</div>
        </div>
        <div style="position:absolute;right:28px;top:318px;display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--secondary)">
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#6b4cc0;vertical-align:-1px"></span> NB-BAT57-3C</span>
          <span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#14a394;vertical-align:-1px"></span> NB-ADP65-USBC</span>
        </div>
      </div>
      ${uses.map(([ic, title, desc, x, y]) => `
        <div class="use card" style="position:absolute;left:${x}px;top:${y}px;width:480px;height:190px;padding:24px">
          <div style="display:flex;align-items:center;gap:14px"><div style="width:52px;height:52px;border-radius:14px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center">${icon(ic, 28)}</div><div style="font-size:24px;font-weight:800">${title}</div></div>
          <div style="margin-top:18px;font-size:19px;color:var(--secondary)">${desc}</div>
        </div>`).join('')}
      <div class="caps" style="position:absolute;left:96px;top:744px;width:980px;display:flex;flex-wrap:wrap;gap:12px">
        <div style="width:100%;font-size:20px;font-weight:800">封装的通用逻辑</div>
        ${['扫描确认 LPN', '部分拆分 Split', '任务托管 Custody', '幂等命令 Command Id', '库存流水 Take / Place', '上架建议 Put-away Suggestion', '并发锁与冻结检查'].map((c) => `<span class="chip cap">${icon('check', 16, 'var(--success)', 3)} ${c}</span>`).join('')}
      </div>
      <div class="codebox plan" style="left:1120px;top:736px;width:704px;font-size:15.5px">
        <div class="code-h">${icon('fileJson', 15)} plan.steps[0] · Agent 只声明「搬什么、搬到哪」</div>{ <span class="k">"kind"</span>: <span class="s">"composable"</span>,
  <span class="k">"stepDefinitionCode"</span>: <span class="s">"composable-move-inventory"</span>,
  <span class="k">"inputs"</span>: { <span class="k">"moves"</span>: <span class="s">"{{task.lines.moves}}"</span>,
              <span class="k">"goodsCondition"</span>: <span class="s">"Damaged"</span> } }</div>`;
    const at = (seg, frac) => S(seg) + (E(seg) - S(seg)) * frac;
    // comp-1 first half: the step library — one shipped step, more to come as the system evolves.
    fadeIn('.lib-h', at('comp-1', 0.06));
    pop('.lib-step.on', at('comp-1', 0.2));
    stagger('.lib-step.next', at('comp-1', 0.3), 0.4, 'pop');
    fadeIn('.lib-note', at('comp-1', 0.4));
    show('.core', at('comp-1', 0.52));
    // Take all 4 EA of NB-BAT57-3C (purple) from the source LPN into the To LPN in custody; the other item stays and
    // closes up. Then Place the To LPN at DMG-01.
    // Frames and LPNs share one geometry, so a tile moves by exactly one frame step (234) each time.
    const t = at('comp-1', 0.74);
    const blip = (sel, when) => { anim(sel, when, 0.25, { opacity: [0, 1], scale: [0.7, 1] }, 'back'); anim(sel, when + 0.9, 0.3, { opacity: 0 }); };
    fadeIn('.lbl-take', t - 0.6);
    blip('.sc1', t - 0.5);
    blip('.sc2', t - 0.1);
    [0, 1, 2, 3].forEach((i) => {
      const when = t + 0.2 + i * 0.32;
      anim(`.t${i}`, when, 0.7, { x: [0, 234] }, 'inOut');
      anim(`.t${i}`, when, 0.35, { y: [0, -24] }, 'out');
      anim(`.t${i}`, when + 0.35, 0.35, { y: 0 }, 'in');
    });
    cls('.tolpn', 'held', t + 0.3);
    text('.tolbl', t + 0.3, 'CLP-1005790');
    anim('.t4, .t5', t + 1.7, 0.5, { x: [0, -51], y: [0, -46] }, 'inOut');
    const p = t + 2.8;
    fadeIn('.lbl-place', p - 0.6);
    blip('.sc3', p - 0.5);
    anim('.tolpn', p, 1.0, { x: [0, 234] }, 'inOut');
    anim('.tolpn', p, 0.5, { y: [0, -18] }, 'out');
    anim('.tolpn', p + 0.5, 0.5, { y: 0 }, 'in');
    [0, 1, 2, 3].forEach((i) => {
      anim(`.t${i}`, p, 1.0, { x: 468 }, 'inOut');
      anim(`.t${i}`, p, 0.5, { y: -18 }, 'out');
      anim(`.t${i}`, p + 0.5, 0.5, { y: 0 }, 'in');
    });
    cls('.mi-slot', 'done', p + 1.0);
    pop('.mi-placed', p + 1.05);
    fadeIn('.note', p + 1.4);
    stagger('.use', S('comp-2', 0.5), 2.6, 'pop');
    show('.caps', S('comp-3', 0.5));
    stagger('.cap', S('comp-3', 1.2), 0.7, 'pop');
    show('.plan', at('comp-3', 0.45));
    anim('.lib-step.next', at('comp-3', 0.72), 0.5, { scale: [1, 1.06] }, 'out');
    anim('.lib-step.next', at('comp-3', 0.72) + 0.5, 0.5, { scale: 1 }, 'inOut');
  });

  Scene('s09-release', { title: '开发、测试与发布', tag: '流程示意 · 真实机制' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, slideIn }) => {
    // Two environments: build and verify with the Agent in Test, export; import into Production, approve, publish.
    const lanes = [
      ['test', 'flask', '测试环境', 230, [
        ['sparkles', '与 Agent 生成', '对话中起草任务类型 / 页面'],
        ['pencil', '修改', '继续对话调整'],
        ['flask', '试运行验证', 'Trial · 真实执行'],
        ['download', '导出', '打包验证过的定义'],
      ]],
      ['prod', 'building', '生产环境', 430, [
        ['upload', '导入', '一律落为草稿'],
        ['eye', '审批', '审核定义与影响面'],
        ['rocket', '发布', '有权限的人确认'],
        ['refresh', '跟随新版本', '进行中的任务继续，结果保留'],
      ]],
    ];
    const X0 = 266, W = 350, STEP = 398;
    const cx = (k) => X0 + k * STEP + W / 2;
    root.innerHTML = `
      ${chapter('Part 2 · 开发、测试与发布', '生成成功 ≠ 上线：发布始终是人的决定')}
      ${lanes.map(([lane, ic, name, top, steps]) => `
        <div class="rl-band ${lane}" style="top:${top}px">
          <div class="rl-env">${icon(ic, 22, 'var(--primary)')}<b>${name}</b></div>
        </div>
        ${steps.map(([sic, title, sub], k) => `
          <div class="rl-step ${lane}${k} ${lane === 'prod' && k === 2 ? 'key' : ''}" style="left:${X0 + k * STEP}px;top:${top + 12}px">
            <div class="rl-ic">${icon(sic, 22)}</div><div><b>${title}</b><span>${sub}</span></div>
          </div>`).join('')}
        ${[0, 1, 2].map((k) => `<div class="rl-arrow ${lane}a${k}" style="left:${X0 + k * STEP + W + 9}px;top:${top + 45}px">${icon('chevronRight', 30, 'rgba(85,53,160,.5)', 2.6)}</div>`).join('')}`).join('')}
      <svg class="rl-hand" style="position:absolute;left:0;top:0;overflow:visible" width="1920" height="1080"><path d="M${cx(3)} 338 V380 H${cx(0)} V442" stroke="#8b74c9" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#rl-tip)"/>
        <defs><marker id="rl-tip" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M2 1.5 L9 6 L2 10.5" fill="none" stroke="#8b74c9" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></marker></defs></svg>
      <div class="rl-pkg" style="left:${(cx(0) + cx(3)) / 2}px;top:380px">${icon('fileJson', 18, 'var(--primary)')}<span class="mono">move-damage.genui-package.json</span></div>
      <div class="dlg card" style="position:absolute;left:96px;top:600px;width:840px;padding:0;overflow:hidden">
        <div style="padding:18px 24px;font-size:21px;font-weight:800;border-bottom:1px solid var(--line)">Publish Move Damage v2?</div>
        <div style="padding:18px 24px;font-size:18px;line-height:1.9">
          <div>${icon('listChecks', 18, 'var(--primary)')} Open tasks running this type: <b>3</b></div>
          <div>${icon('checkCircle', 18, 'var(--success)')} Will follow v2: <b>3</b></div>
          <div>${icon('database', 18, 'var(--primary)')} Saved results kept <span style="color:var(--muted)">· lines · records · step outputs</span></div>
        </div>
        <div style="padding:14px 24px;display:flex;justify-content:flex-end;gap:12px;background:#fafbfd;border-top:1px solid var(--line)"><span class="gbtn ghost">Cancel</span><span class="gbtn">Publish</span></div>
      </div>
      <div class="fol card" style="position:absolute;left:984px;top:600px;width:840px;padding:20px 24px">
        <div style="display:flex;gap:10px;align-items:center;font-size:20px;font-weight:800">${icon('refresh', 22, 'var(--primary)')} 跟随最新版本</div>
        <div style="margin-top:10px;font-size:17.5px;line-height:1.6;color:var(--secondary)">页面步骤即使已经开始，也会换成新版本，已保存的结果保留；<br>只有已开始的 Move Inventory 步骤保持执行事实，这类任务先按原版本做完。</div>
      </div>
      <div class="rb card" style="position:absolute;left:984px;top:759px;width:840px;padding:20px 24px">
        <div style="display:flex;gap:10px;align-items:center;font-size:20px;font-weight:800">${icon('undo', 22, 'var(--primary)')} 可回退</div>
        <div style="margin-top:10px;font-size:17.5px;color:var(--secondary)">每个版本不可变保留 · 可从旧版本起草再发布 · Retire 停止新建，进行中的任务继续</div>
      </div>`;
    const at = (seg, frac) => S(seg) + (E(seg) - S(seg)) * frac;
    // rel-1 follows the sentence: test steps, the hand-off, production steps.
    fadeIn('.rl-band.test', at('rel-1', 0.04));
    [0, 1, 2, 3].forEach((k) => {
      show(`.test${k}`, at('rel-1', 0.1 + k * 0.1));
      if (k) fadeIn(`.testa${k - 1}`, at('rel-1', 0.1 + k * 0.1) - 0.2);
    });
    anim('.rl-hand', at('rel-1', 0.5), 0.6, { clipY: [0, 100] });
    pop('.rl-pkg', at('rel-1', 0.52));
    fadeIn('.rl-band.prod', at('rel-1', 0.58));
    [0, 1, 2, 3].forEach((k) => {
      show(`.prod${k}`, at('rel-1', 0.62 + k * 0.1));
      if (k) fadeIn(`.proda${k - 1}`, at('rel-1', 0.62 + k * 0.1) - 0.2);
    });
    show('.dlg', at('rel-2', 0.04));
    show('.fol', at('rel-2', 0.28));
    show('.rb', at('rel-2', 0.55));
  });
})();
