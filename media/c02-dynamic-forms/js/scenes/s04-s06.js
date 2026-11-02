// s04 GenUI concepts · s05 task storage · s06 Dynamic Page (Custom Object is s07b, after the View API)
(() => {
  const { icon, chapter } = UI;

  // A concept-card phone: the same full-size T1Pro markup as the mobile scenes (real dp x 390/360), shrunk as a
  // whole so type, controls and screen keep the app's proportions.
  const MINI = 0.74;
  const miniPhone = (inner) => `
    <div style="position:relative;width:${404 * MINI}px;height:${794 * MINI}px;margin:0 auto">
      <div class="phone" style="left:0;top:0;transform:scale(${MINI});transform-origin:0 0">${UI.phoneShell(inner)}</div>
    </div>`;

  Scene('s04-concepts', { title: '核心概念', tag: '架构示意' }, ({ root, S, show, pop, stagger, anim, fadeIn, cls }) => {
    const col = (i) => 96 + i * 444;
    const head = (no, title, desc, extra = '') => `
      <div style="display:flex;justify-content:space-between"><div class="pill primary">${no}</div>${extra}</div>
      <div style="margin-top:12px;font-size:28px;font-weight:800">${title}</div>
      <div style="font-size:17.5px;color:var(--secondary);margin-top:4px">${desc}</div>`;
    root.innerHTML = `
      ${chapter('Part 2 · GenUI 核心概念', '从一次对话，到日常应用，再到跨环境发布')}
      <div class="c c1 card" style="position:absolute;left:${col(0)}px;top:200px;width:400px;height:760px;padding:24px">
        ${head('01', 'Dynamic Card', '在 Agent 对话里：一次确认、一张结果表')}
        <div style="margin-top:18px">${miniPhone(UI.agentPage('库存位置查询', `
          <div class="ma-user">TCL-55C6-QLED 哪里还有货？</div>
          <div class="cc1" style="display:flex;flex-direction:column;gap:10px">
            ${UI.maTool('sparkles', '2 actions · [wms_api] Inventory by location', true)}
            <div class="ma-text">Valley View 可用 70 EA，分布在 5 个库位：</div>
            <div class="ma-card ma-inv">
              <div class="ch"><div><div class="ct">TCL 55" C6 QLED TV</div><div class="cs">TCL-55C6-QLED · TCL North America</div></div></div>
              <div class="ma-body">
                <div class="ma-stats"><div><div class="cl">Available</div><div class="sv ok">70 EA</div></div><div><div class="cl">Locations</div><div class="sv">5</div></div></div>
                <div class="ma-rows">${[['A-01-01', '50 EA', '3 LPNs'], ['01.001.01', '8 EA', '2 LPNs'], ['C-05-02', '8 EA', '1 LPN']]
                  .map(([loc, qty, meta]) => `<div class="ma-trow"><div class="th"><span>${loc}</span><b class="ok">${qty}</b></div><div class="tm">${meta}</div></div>`).join('')}
                  <div class="ma-more">+2 more locations · 4 EA</div></div>
              </div>
            </div>
            ${UI.maWorked('5s')}
          </div>`))}</div>
      </div>
      <div class="c c2 card" style="position:absolute;left:${col(1)}px;top:200px;width:400px;height:760px;padding:24px">
        ${head('02', 'Dynamic Task', '对话里商定计划，生成手机上的沉浸式任务页')}
        <div style="margin-top:18px">${miniPhone(`
          ${UI.mHeader('TASK-18651', 'Dynamic · Report Issue')}
          <div class="m-body m-page" style="bottom:76px">
            <div class="m-info"><div><div class="m-label">Customer</div><div class="m-value">Northbridge Service Parts</div></div><div><div class="m-label">Reports</div><div class="m-value">0</div></div></div>
            <div class="m-work">
              <div class="m-wf"><div class="m-label">Location</div><div class="m-scan ok"><span class="v">A12-05-1</span><span class="ck">${icon('check', 18, 'var(--success)', 2.5)}</span><span class="ico">${icon('scan', 18)}</span></div></div>
              <div class="m-wf"><div class="m-label">LPN</div><div class="m-scan ok"><span class="v">CLP-1005744</span><span class="ck">${icon('check', 18, 'var(--success)', 2.5)}</span><span class="ico">${icon('scan', 18)}</span></div>
                <div class="m-hint">Northbridge Service Parts · 12 EA · Good</div></div>
              <div class="m-srs">
                <div class="m-selrow"><span class="l">Item</span><span class="r">NB-BAT57-3C</span>${icon('chevronRight', 20, 'var(--muted)')}</div>
                <div class="m-selrow"><span class="l">Issue Type</span><span class="r">Damaged</span>${icon('chevronRight', 20, 'var(--muted)')}</div>
              </div>
              <div class="m-qtyu"><div class="ql"><div class="m-label">Qty</div><div class="row"><span class="btn">−</span><span class="val">12</span><span class="btn">+</span></div></div><div class="qr"><div class="m-label">UOM</div><div class="uomv">EA</div></div></div>
              <div class="m-wphoto"><div class="m-label">Photo</div>
                <div class="tiles"><div class="thumbw">${UI.damagedBoxSvg(66)}</div><div class="add">${icon('camera', 20)}Photo</div></div>
              </div>
            </div>
          </div>
          <div class="m-footer"><div class="m-btn">Report Issue</div></div>`)}</div>
      </div>
      <div class="c c3 card" style="position:absolute;left:${col(2)}px;top:200px;width:400px;height:760px;padding:24px">
        ${head('03', 'Save as Task Type', '在手机上沉淀为 Dynamic Task Type', `<div style="display:flex;align-items:center;gap:3px">
          <span class="chip ver" style="font-size:13px;padding:3px 8px;gap:5px">${icon('pencil', 12)} Draft</span><span class="vera">${icon('arrowRight', 13, 'var(--muted)')}</span>
          <span class="chip ver" style="font-size:13px;padding:3px 8px;gap:5px">${icon('flask', 12)} Trial</span><span class="vera">${icon('arrowRight', 13, 'var(--muted)')}</span>
          <span class="chip ver" style="font-size:13px;padding:3px 8px;gap:5px;border-color:var(--primary-line);color:var(--primary)">${icon('rocket', 12)} Published</span></div>`)}
        <div style="margin-top:18px">${miniPhone(`
          ${UI.mHeader('TASK-18651', 'Dynamic')}
          <div class="m-sec"><div class="m-label">Task</div><div class="m-value">Inventory Patrol</div></div>
          <div class="m-sec"><div class="m-label">Customer</div><div class="m-value">Northbridge Service Parts</div></div>
          <div class="m-sec"><div class="m-label">Reports</div><div class="m-value">3</div></div>
          <div class="mbg3" style="position:absolute;inset:0;background:rgba(0,0,0,.45)"></div>
          ${UI.saveTypeSheet({ cls: 'sheet3', name: 'Inventory Patrol' })}
        `)}</div>
      </div>
      <div class="c c4 card" style="position:absolute;left:${col(3)}px;top:200px;width:400px;height:760px;padding:24px">
        ${head('04', 'Export / Import', '测试环境开发验证，生产环境审批发布', `<div class="pill neutral" style="font-size:13px">${icon('layers', 13)} Custom Apps · 定制包</div>`)}
        <div style="margin-top:18px;height:${794 * MINI}px;display:flex;flex-direction:column">
          <div class="env xp-env">
            <div class="xp-h">${icon('flask', 20, 'var(--primary)')}<b>Test</b><span class="pill success xp-badge">${icon('checkCircle', 12)} 验证通过 v1</span></div>
            <div class="xp-steps"><span>调整</span>${icon('arrowRight', 13, 'var(--muted)')}<span>试运行验证</span></div>
          </div>
          <div class="flow1 xp-flow"><div class="xp-line"></div><span class="xp-verb">导出</span><div class="xp-line"></div></div>
          <div class="pkg xp-pkg">${icon('fileJson', 22, 'var(--primary)')}<span class="mono">move-damage.genui-package.json</span></div>
          <div class="flow2 xp-flow"><div class="xp-line"></div><span class="xp-verb">导入</span><div class="xp-line"></div><svg width="14" height="9" viewBox="0 0 14 9"><path d="M0 0 H14 L7 9 Z" fill="#8b74c9"/></svg></div>
          <div class="env2 xp-env">
            <div class="xp-h">${icon('building', 20, 'var(--primary)')}<b>Production</b></div>
            <div class="xp-track">
              <div class="xp-stop"><span class="pill warning xp-badge">Draft</span><span>导入为草稿</span></div>
              <span class="xp-arrow">${icon('arrowRight', 14, 'var(--muted)')}</span>
              <div class="xp-stop"><span class="pill info xp-badge">Approved</span><span>审批</span></div>
              <span class="xp-arrow">${icon('arrowRight', 14, 'var(--muted)')}</span>
              <div class="xp-stop"><span class="pill success xp-badge">Published</span><span>发布</span></div>
            </div>
          </div>
          <div class="pkgc" style="margin-top:22px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);font-size:14.5px;line-height:1.9;color:var(--secondary)">
            <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:2px">包里带什么</div>
            ${['定义：Task Type · Page · Object Type', 'Dynamic View API 源码', '依赖清单：接口路由 · 前置条件', '环境绑定：库位、物料等，导入时重新映射', '同租户其他仓库：不用文件，直接复制'].map((t) => `<div style="display:flex;align-items:center;gap:8px;white-space:nowrap">${icon('check', 15, 'var(--success)', 3)}${t}</div>`).join('')}
          </div>
        </div>
      </div>
      ${[0, 1, 2].map((i) => `<div class="ca" style="position:absolute;left:${col(i) + 401}px;top:559px">${icon('chevronRight', 42, 'rgba(85,53,160,.55)', 2.6)}</div>`).join('')}`;
    show('.c1', S('conc-1', 0.3), 0.55, 30);
    show('.cc1', S('conc-1', 1.6));
    show('.c2', S('conc-2', 0.3), 0.55, 30);
    show('.c3', S('conc-3', 0.3), 0.55, 30);
    anim('.mbg3', S('conc-3', 1.6), 0.3, { opacity: [0, 1] });
    anim('.sheet3', S('conc-3', 1.6), 0.45, { y: [440, 0] }, 'out');
    stagger('.ver', S('conc-3', 5.0), 0.6, 'pop');
    stagger('.vera', S('conc-3', 5.0) + 0.6, 0.6, 'fadeIn');
    show('.c4', S('conc-4', 0.3), 0.55, 30);
    show('.env', S('conc-4', 1.5));
    anim('.flow1', S('conc-4', 2.6), 0.4, { clipY: [0, 100] });
    anim('.pkg', S('conc-4', 3.0), 0.5, { opacity: [0, 1], y: [-30, 0] });
    anim('.flow2', S('conc-4', 5.0), 0.5, { clipY: [0, 100] });
    show('.env2', S('conc-4', 5.5));
    root.querySelectorAll('.xp-stop').forEach((el, i) => anim(el, S('conc-4', 5.9 + i * 0.7), 0.35, { opacity: [0, 1] }));
    root.querySelectorAll('.xp-arrow').forEach((el, i) => anim(el, S('conc-4', 5.9 + (i + 1) * 0.7), 0.35, { opacity: [0, 1] }));
    show('.pkgc', S('conc-4', 8.0));
    root.querySelectorAll('.ca').forEach((el, i) => fadeIn(el, S(['conc-2', 'conc-3', 'conc-4'][i], 0)));
  });

  Scene('s05-storage', { title: '三层存储', tag: '架构示意' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, slideIn }) => {
    // Light box = what the Task Definition (TDEF version body, the Agent's plan) declares; dark box = the JSON
    // documents stored for this task.
    const K = (k) => `<span style="color:var(--primary)">${k}</span>`;
    const V = (v) => `<span style="color:var(--success)">${v}</span>`;
    const N = (n) => `<span style="color:var(--warning)">${n}</span>`;
    const decl = (lines) => `
      <div class="m-label" style="margin-top:16px;font-size:13px;letter-spacing:.5px;display:flex;align-items:center;gap:6px;color:var(--primary)">${UI.agentMark(14, 'var(--primary)', 2)}Agent 为巡检定制 · Task Definition</div>
      <div class="mono decl" style="margin-top:6px;padding:10px 14px;border-radius:10px;background:var(--raised);font-size:14px;line-height:1.6;white-space:pre;color:var(--secondary)">${lines}</div>`;
    const dataLabel = (label) => `<div class="m-label" style="margin-top:16px;font-size:13px;letter-spacing:.5px">${label}</div>`;
    const dark = (cls, html) => `<div class="codebox ${cls}" style="position:relative;margin-top:6px;padding:9px 16px;font-size:14px;line-height:1.6;box-shadow:none;border-radius:10px">${html}</div>`;
    const head = (title, kind, sub, extra = '') => `
      <div style="display:flex;align-items:center;gap:10px"><div style="font-size:26px;font-weight:800">${title}</div><span class="pill neutral" style="font-size:13px;padding:2px 10px">${kind}</span>${extra}</div>
      <div style="font-size:16.5px;color:var(--secondary);margin-top:2px">${sub}</div>`;
    const trait = (text) => `<div style="position:absolute;left:24px;right:24px;bottom:20px;display:flex;align-items:center;gap:8px;font-size:14.5px;color:var(--secondary)">${icon('check', 15, 'var(--success)', 3)}${text}</div>`;
    const lineRows = ['A12-05-1', 'A12-05-2', 'A12-06-1', 'A12-06-2'];
    root.innerHTML = `
      ${chapter('Part 2 · 持久化积木', 'GenUI 通用三层存储，结构由 Agent 按场景定制', 'GenUI 提供存储，<b style="color:var(--text)">Agent 按场景定制每层结构</b> · 存为 JSON 文档、写入时校验 · 换场景只换声明，不建表')}
      <div class="task" style="position:absolute;left:96px;top:238px;display:flex;align-items:center;gap:12px"><span style="font-size:17px;color:var(--muted)">以巡检任务为例</span><span class="pill primary" style="font-size:19px;padding:8px 18px">${icon('listChecks', 18)} TASK-18651 · Inventory Patrol</span></div>
      <svg class="brk" style="position:absolute;left:0;top:0;overflow:visible" width="1920" height="400"><path d="M960 352 V325 Q960 315 970 315 H1544 Q1554 315 1554 325 V352" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
      <div style="position:absolute;left:1257px;top:315px;transform:translate(-50%,-50%)"><div class="brkl" style="display:flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:#fff;border:1.5px solid var(--primary-line);font-size:15.5px;color:var(--primary);font-weight:600;white-space:nowrap">${icon('layers', 16)} 同一套文档集合引擎 · 未声明字段拒绝 · 全程审计</div></div>
      <div class="p1 card" style="position:absolute;left:96px;top:352px;width:540px;height:500px;padding:24px">
        ${head('Task Context', '单个文档', '任务是关于什么')}
        ${decl(`${K('context')}: {
  ${K('customer')}:      { type: ${V('"string"')}, input: ${N('true')} },
  ${K('shift')}:         { type: ${V('"string"')} },
  ${K('reportedCount')}: { type: ${V('"number"')} } }`)}
        <div class="cdata">${dataLabel('存储的文档 · contextVersion 4')}
        ${dark('', `{ <span class="k">"customer"</span>: <span class="s">"Northbridge Service Parts"</span>,
  <span class="k">"shift"</span>: <span class="s">"Day"</span>,
  <span class="k">"reportedCount"</span>: <span class="n">3</span> }`)}</div>
        ${trait('键必须先声明 · 带版本号防并发覆盖')}
      </div>
      <div class="p2 card" style="position:absolute;left:690px;top:352px;width:540px;height:500px;padding:24px">
        ${head('Task Lines', '文档集合', '要做什么 · 任务明细')}
        ${decl(`${K('lines.locations')}: {
  fields: { ${K('location')}: { type: ${V('"ref"')} },
            ${K('seq')}:      { type: ${V('"number"')} } },
  key: [${V('"location"')}] }`)}
        ${dataLabel('存储的文档 · 一行一条明细')}
        <div class="codebox" style="position:relative;margin-top:6px;padding:4px 16px;font-size:14px;box-shadow:none;border-radius:10px;white-space:normal">
          ${lineRows.map((loc, i) => `<div class="lr" style="padding:7px 0;${i ? 'border-top:1px solid rgba(255,255,255,.08)' : ''}">{ <span class="k">"location"</span>: <span class="s">"${loc}"</span>, <span class="k">"seq"</span>: <span class="n">${i + 1}</span> }</div>`).join('')}
        </div>
        ${trait('任务明细：本次要巡检的库位，按顺序逐行')}
      </div>
      <div class="p3 card" style="position:absolute;left:1284px;top:352px;width:540px;height:500px;padding:24px">
        ${head('Task Records', '文档集合', '采集到了什么')}
        ${decl(`${K('records.reports')}: {
  fields: { ${K('lpn')}, ${K('item')},
            ${K('qty')}, ${K('photo')},
            ${K('issueId')} } }`)}
        ${dataLabel('存储的文档')}
        ${dark('r1', `{ <span class="k">"lpn"</span>: <span class="s">"CLP-1005744"</span>, <span class="k">"item"</span>: <span class="s">"NB-BAT57-3C"</span>,
  <span class="k">"qty"</span>: { <span class="k">"qty"</span>: <span class="n">12</span>, <span class="k">"uomId"</span>: <span class="s">"EA(1)"</span> },
  <span class="k">"photo"</span>: [<span class="s">"file:a97474ca…"</span>], <span class="k">"issueId"</span>: <span class="s">"ISSUE-106"</span> }`)}
        ${dark('r2', `{ <span class="k">"lpn"</span>: <span class="s">"CLP-1005745"</span>, <span class="k">"item"</span>: <span class="s">"NB-ADP65-USBC"</span>,
  <span class="k">"qty"</span>: { <span class="k">"qty"</span>: <span class="n">20</span>, <span class="k">"uomId"</span>: <span class="s">"EA(1)"</span> },
  <span class="k">"photo"</span>: [<span class="s">"file:5c1e08d2…"</span>], <span class="k">"issueId"</span>: <span class="s">"ISSUE-107"</span> }`)}
        ${trait('采集结果：每次上报一条，增改规则由 Agent 按场景定')}
      </div>
      <div class="facts" style="position:absolute;left:96px;top:870px;width:1728px;display:flex;align-items:center;gap:22px;padding:16px 24px;border-radius:16px;background:#fff;border:1px dashed var(--line-strong)">
        <span style="font-size:19px;font-weight:700">业务事实留在所属对象，任务只引用：</span>
        <span class="chip f">${icon('alert', 18, 'var(--warning)')} Inventory Issue <b class="mono">ISSUE-106</b> · Open</span>
        <span class="chip f">${icon('sliders', 18, 'var(--primary)')} Inventory Adjustment <b class="mono">ADJ-512</b> · Good → Damaged</span>
        <span class="chip f">${icon('box', 18, 'var(--primary)')} Inventory <b class="mono">CLP-1005744</b></span>
      </div>`;
    // A point `frac` of the way through a narration segment, to follow the sentence being spoken.
    const at = (seg, frac) => S(seg) + (E(seg) - S(seg)) * frac;
    fadeIn('.task', S('stor-1', 0.2));
    show('.p1', at('stor-1', 0.62));
    show('.p2', S('stor-2', 0.2));
    show('.p3', S('stor-2', 0.6));
    anim('.brk', at('stor-2', 0.12), 0.6, { clip: [0, 100] });
    pop('.brkl', at('stor-2', 0.18));
    stagger('.lr', S('stor-2', 0.8), 0.15, 'fadeIn');
    show('.r1', S('stor-2', 1.0));
    show('.r2', S('stor-2', 1.4));
    show('.facts', S('stor-3', 0.2));
    stagger('.facts .f', S('stor-3', 1.0), 0.6, 'pop');
  });

  Scene('s06-page', { title: 'Dynamic Page', tag: '架构示意' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, slideIn, hide }) => {
    // pobj-1 picture: the Inventory Issue Overview page (F26102701 acceptance, F1 numbers) redrawn with the chart tokens.
    const byType = [['Damaged', 3, 0, 2, 5], ['Item Not Found', 3, 0, 0, 3], ['Empty Location', 1, 0, 0, 1], ['Location Not Reachable', 0, 0, 0, 0]];
    const dcard = (title, body, binds = '') => `<div class="dc" style="background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden"><div style="padding:7px 14px;background:var(--section);font-weight:600;font-size:13.5px;display:flex;align-items:center">${title}${binds ? `<span class="vw-tag mono">view.overview · ${binds}</span>` : ''}</div><div style="padding:10px 14px">${body}</div></div>`;
    const barSvg = () => {
      const w = 500, h = 168, left = 24, base = 140, unit = 20;
      const band = (w - left) / 4;
      const legend = [['Open', '#6250d6'], ['In Progress', '#eb6834'], ['Resolved', '#1baf7a']].map(([l, c]) => `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px"><i style="width:9px;height:9px;border-radius:2px;background:${c}"></i>${l}</span>`).join('');
      const bars = byType.map(([t, open, , resolved], i) => {
        const x = left + band * i + band / 2 - 9;
        const openTop = base - open * unit;
        const resTop = openTop - resolved * unit;
        return `${open ? `<rect class="bar" x="${x}" y="${openTop + (resolved ? 2 : 0)}" width="18" height="${open * unit - (resolved ? 2 : 0)}" rx="${resolved ? 0 : 3}" fill="#6250d6"/>` : ''}`
          + `${resolved ? `<rect class="bar" x="${x}" y="${resTop}" width="18" height="${resolved * unit}" rx="3" fill="#1baf7a"/>` : ''}`
          + `<text x="${x + 9}" y="${(resolved ? resTop : open ? openTop : base) - 5}" text-anchor="middle" font-size="11" fill="#525252">${open + resolved}</text>`
          + `<text x="${x + 9}" y="${base + 16}" text-anchor="middle" font-size="10.5" fill="#6b6b6b">${t}</text>`;
      }).join('');
      const grid = [0, 2, 4, 6].map((v) => `<line x1="${left}" x2="${w}" y1="${base - v * unit}" y2="${base - v * unit}" stroke="${v ? '#e8ebf1' : '#c9ced8'}"/><text x="${left - 6}" y="${base - v * unit + 4}" text-anchor="end" font-size="10.5" fill="#6b6b6b">${v}</text>`).join('');
      return `<div style="font-size:12px;color:var(--secondary)">${legend}</div><svg width="${w}" height="${h}" style="display:block;margin-top:4px">${grid}${bars}</svg>`;
    };
    const donutSvg = () => {
      const slices = [['Damaged', 3, '#6250d6'], ['Item Not Found', 3, '#eb6834'], ['Empty Location', 1, '#1baf7a'], ['Location Not Reachable', 0, '#eda100']];
      const total = 7, r = 58, c = 2 * Math.PI * r;
      let offset = 0;
      const arcs = slices.filter((sl) => sl[1]).map(([, v, color]) => { const len = (v / total) * c; const arc = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${color}" stroke-width="20" stroke-dasharray="${len - 2} ${c - len + 2}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"/>`; offset += len; return arc; }).join('');
      const legend = slices.map(([l, v, color]) => `<div style="display:flex;align-items:center;gap:8px;font-size:12.5px"><i style="width:9px;height:9px;border-radius:2px;background:${color}"></i><span style="flex:1;color:var(--secondary)">${l}</span><b style="width:18px;text-align:right">${v}</b><span style="width:34px;text-align:right;color:var(--muted)">${Math.round((v / total) * 100)}%</span></div>`).join('');
      return `<div style="display:flex;align-items:center;gap:22px;height:190px"><svg width="160" height="160">${arcs}<text x="80" y="82" text-anchor="middle" font-size="22" font-weight="600" fill="#111827">7</text><text x="80" y="100" text-anchor="middle" font-size="11" fill="#6b6b6b">Total</text></svg><div style="flex:1;display:flex;flex-direction:column;gap:7px;max-width:250px">${legend}</div></div>`;
    };
    const ptile = (cls, ic, kind, title, body) => `
      <div class="pt ${cls} card" style="flex:1;display:flex;flex-direction:column;padding:14px 18px;box-shadow:0 8px 24px rgba(31,41,51,.08)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">${icon(ic, 18, 'var(--primary)')}<span style="font-size:16px;font-weight:700">${title}</span><span class="pill neutral" style="margin-left:auto;font-size:12.5px;padding:2px 10px">${kind}</span></div>
        ${body}
      </div>`;
    root.innerHTML = `
      ${chapter('Part 2 · Web 端', 'Dynamic Page：GenUI 动态构建的 Web 页面', '与 Dynamic Task 同一套 GenUI · 调度台 · 审核队列 · 统计看板 · 查询工具，数据来自 Dynamic View API')}
      <div class="win window" style="left:96px;top:228px;width:1090px;height:658px;transform-origin:0 0">
        <div class="chrome"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">/custom-apps/pages/inventory-issue-overview</span><span class="pill primary" style="margin-left:auto;font-size:12.5px;padding:2px 10px">统计看板</span></div>
        <div class="web" style="position:relative;width:1090px;height:624px">
          <div class="content" style="padding:12px 18px">
            <div class="crumb" style="font-size:13px">Dynamic Pages</div>
            <div class="title" style="margin-top:2px;font-size:19px">Inventory Issue Overview</div>
            <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
              ${dcard('Summary', `<div style="display:flex;gap:30px;padding:2px 2px">${[['7', 'Open', 'var(--warning)'], ['0', 'In Progress', 'var(--info)'], ['2', 'Resolved', 'var(--success)']].map(([v, l, c]) => `<div><div style="font-size:24px;font-weight:500;color:${c}">${v}</div><div style="font-size:12px;color:var(--muted)">${l}</div></div>`).join('')}</div>`, 'open / inProgress / resolved')}
              ${dcard('Resolved per issue type', `<div style="display:flex;flex-direction:column;gap:7px">${byType.map(([t, , , r, total]) => `<div style="display:grid;grid-template-columns:150px 1fr 44px;align-items:center;gap:10px;font-size:12.5px"><span style="color:var(--secondary)">${t}</span><span style="position:relative;height:7px;border-radius:4px;background:rgba(31,157,107,.18)"><span style="position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:#1f9d6b;width:${total ? (r / total) * 100 : 0}%"></span></span><span style="text-align:right"><b>${r}</b><span style="color:var(--muted)"> / ${total}</span></span></div>`).join('')}</div>`, 'byType')}
              ${dcard('Issues by type and status', barSvg(), 'byType')}
              ${dcard('Open issues by type', donutSvg(), 'byType')}
            </div>
            <div class="dc" style="margin-top:10px;background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden">
              <div style="padding:7px 14px;background:var(--section);font-weight:600;font-size:13.5px">Results</div>
              <table style="font-size:13px"><tr><th>Issue</th><th>Type</th><th>Location</th><th>LPN</th><th>Reported</th></tr>
              ${[['ISSUE-105', 'Damaged', 'A12-05-1', 'CLP-1005744', '10/23/2026'], ['ISSUE-57', 'Damaged', 'A12-05-1', 'CLP-1005744', '10/22/2026']].map((r) => `<tr><td class="link">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('')}</table>
            </div>
          </div>
        </div>
      </div>
      <div class="pts" style="position:absolute;left:1226px;top:228px;width:598px;height:658px;display:flex;flex-direction:column;gap:14px">
        ${ptile('pt1', 'workflow', '调度台', 'Damaged Inventory Relocation', `
          ${[['ISSUE-106', 'A12-05-1', '12 EA'], ['ISSUE-107', 'A12-04-2', '20 EA'], ['ISSUE-104', 'B03-02-1', '6 EA']].map((r) => `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px"><span style="width:15px;height:15px;border:1.5px solid #94a3b8;border-radius:4px;background:#fff"></span><span style="color:var(--primary);font-weight:500;width:96px">${r[0]}</span><span style="flex:1">${r[1]}</span><span>${r[2]}</span></div>`).join('')}
          <div style="display:flex;justify-content:flex-end;margin-top:auto;padding-top:8px"><span style="height:28px;padding:0 12px;border-radius:6px;background:var(--primary);color:#fff;font-size:12.5px;font-weight:600;display:inline-flex;align-items:center">Create Move Damage Task</span></div>`)}
        ${ptile('pt2', 'listChecks', '审核队列', 'Adjustment Review', `
          ${[['ADJ-512', 'CLP-1005744', 'Good → Damaged'], ['ADJ-513', 'CLP-1005745', 'Good → Damaged'], ['ADJ-514', 'CLP-1005611', 'Good → Damaged']].map((r) => `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px"><span style="color:var(--primary);font-weight:500;width:86px">${r[0]}</span><span class="mono" style="width:120px;font-size:12.5px">${r[1]}</span><span style="flex:1;color:var(--secondary)">${r[2]}</span><span style="color:var(--primary);font-weight:600">Approve</span><span style="color:var(--secondary)">Reject</span></div>`).join('')}`)}
        ${ptile('pt3', 'search', '查询工具', 'LPN Lookup', `
          <div style="display:flex;gap:16px;align-items:center"><div style="flex:0 0 220px;height:32px;border:1px solid var(--line-strong);border-radius:6px;display:flex;align-items:center;padding:0 10px;font-size:13.5px">CLP-1005744</div>
          ${[['Location', 'A12-05-1'], ['Item', 'NB-BAT57-3C'], ['Qty', '12 EA']].map(([l, v]) => `<div><div style="font-size:11.5px;color:var(--muted)">${l}</div><div style="font-size:13.5px;font-weight:500">${v}</div></div>`).join('')}</div>
          <div style="display:flex;gap:28px;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">${[['Customer', 'Northbridge Service Parts'], ['Condition', 'Good'], ['Last move', '10/22/2026 · A12-05-1']].map(([l, v]) => `<div><div style="font-size:11.5px;color:var(--muted)">${l}</div><div style="font-size:13.5px;font-weight:500">${v}</div></div>`).join('')}</div>`)}
      </div>
      <div class="vw" style="position:absolute;left:1226px;top:228px;width:598px;height:658px;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800">${icon('code', 22, 'var(--primary)')} Dynamic View API <span class="pill neutral" style="font-size:13px;padding:2px 10px;font-family:var(--mono)">overview</span></div>
        <div style="margin-top:4px;font-size:15.5px;color:var(--secondary)">页面组件要的数据，由一段只读代码整合、计算</div>
        <div class="vw-step vw1"><div class="vw-h"><span class="vw-n">1</span>调用 WMS 现有接口 · 只读</div>
          ${['search · Damaged / Open', 'search · Damaged / Resolved', 'search · Item Not Found / Open'].map((t) => `<div class="vw-api mono">${icon('search', 14, 'var(--muted)')} ${t}</div>`).join('')}
          <div class="vw-more">… 共 12 次 · 4 种类型 × 3 种状态，并发查询</div></div>
        <div class="vw-arrow vwa1">${icon('chevronDown', 22, '#8b74c9', 2.4)}</div>
        <div class="vw-step vw2"><div class="vw-h"><span class="vw-n">2</span>计算</div>
          <div style="display:flex;gap:8px">${['计数', '按类型分组', '汇总'].map((t) => `<span class="chip" style="font-size:15px;padding:5px 12px">${t}</span>`).join('')}</div></div>
        <div class="vw-arrow vwa2">${icon('chevronDown', 22, '#8b74c9', 2.4)}</div>
        <div class="vw-step vw3"><div class="vw-h"><span class="vw-n">3</span>一份数据，按组件需要的形状</div>
          <div class="codebox" style="position:relative;padding:10px 14px;font-size:14px;line-height:1.6;box-shadow:none;border-radius:10px;white-space:pre">{ <span class="k">"open"</span>: <span class="n">7</span>, <span class="k">"inProgress"</span>: <span class="n">0</span>, <span class="k">"resolved"</span>: <span class="n">2</span>,
  <span class="k">"byType"</span>: [ { <span class="k">"type"</span>: <span class="s">"Damaged"</span>, <span class="k">"open"</span>: <span class="n">3</span>, <span class="k">"resolved"</span>: <span class="n">2</span>, … }, … ] }</div></div>
        <div class="vw-arrow vwa3">${icon('chevronDown', 22, '#8b74c9', 2.4)}</div>
        <div class="vw-step vw4"><div class="vw-h"><span class="vw-n">4</span>页面组件直接绑定</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${['统计卡', '进度条', '柱状图', '环形图'].map((t) => `<span class="chip" style="font-size:15px;padding:5px 12px;border-color:var(--primary-line);color:var(--primary)">${t}</span>`).join('')}</div></div>
      </div>
      <div class="pflow" style="position:absolute;left:96px;top:904px;display:flex;gap:12px;align-items:center">
        <span class="chip pf">${icon('sparkles', 18, 'var(--primary)')} Agent 起草</span><span class="pfa">${icon('arrowRight', 20, 'var(--muted)')}</span>
        <span class="chip pf">${icon('shield', 18, 'var(--primary)')} 有权限的人发布</span><span class="pfa">${icon('arrowRight', 20, 'var(--muted)')}</span>
        <span class="chip pf">${icon('users', 18, 'var(--primary)')} 发布后进侧边栏，直接打开</span>
      </div>`;
    // A point `frac` of the way through a narration segment, to follow the sentence being spoken.
    const at = (seg, frac) => S(seg) + (E(seg) - S(seg)) * frac;
    show('.win', S('pobj-1', 0.4), 0.6, 30);
    stagger('.win .dc', S('pobj-1', 1.0), 0.25, 'fadeIn');
    // The page kinds as the narration names them: dispatch desk, review queue, (dashboard = the big window), lookup.
    show('.pt1', at('pobj-1', 0.39));
    show('.pt2', at('pobj-1', 0.43));
    pop('.win .chrome .pill', at('pobj-1', 0.48));
    show('.pt3', at('pobj-1', 0.53));
    stagger('.pf', at('pobj-1', 0.62), 0.9, 'pop');
    stagger('.pfa', at('pobj-1', 0.62) + 0.55, 0.9, 'fadeIn');
    // pobj-v: the page kinds step aside for the View API that feeds the dashboard: calls → compute → one data shape,
    // and each block names the fields it binds to.
    hide('.pts', S('pobj-v', 0), 0.4);
    anim('.vw', S('pobj-v', 0) - 0.01, 0, { opacity: [0, 0] });
    anim('.vw', S('pobj-v', 0.3), 0.4, { opacity: [0, 1] });
    show('.vw1', at('pobj-v', 0.3));
    stagger('.vw-api', at('pobj-v', 0.33), 0.3, 'fadeIn');
    fadeIn('.vwa1', at('pobj-v', 0.5));
    show('.vw2', at('pobj-v', 0.52));
    fadeIn('.vwa2', at('pobj-v', 0.62));
    show('.vw3', at('pobj-v', 0.64));
    fadeIn('.vwa3', at('pobj-v', 0.8));
    show('.vw4', at('pobj-v', 0.82));
    stagger('.vw-tag', at('pobj-v', 0.84), 0.3, 'pop');
  });
})();
