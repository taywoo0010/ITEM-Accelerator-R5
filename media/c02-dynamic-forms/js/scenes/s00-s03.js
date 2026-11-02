// s00 title · s01 old vs new · s02 ontology · s03 permission
(() => {
  const { icon, logo, chapter } = UI;

  Scene('s00-title', { title: '标题' }, ({ root, S, E, show, pop, fadeIn, stagger }) => {
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(900px 520px at 50% 42%, rgba(85,53,160,.10), transparent 70%)"></div>
      <div style="position:absolute;left:0;right:0;top:210px;display:flex;flex-direction:column;align-items:center;text-align:center">
        <div class="t-logo">${logo(118)}</div>
        <div class="t-brand" style="margin-top:20px;font-size:34px;font-weight:600;color:var(--strong)">Item WMS</div>
        <div class="t-head" style="margin-top:26px;font-size:76px;font-weight:800;color:var(--strong);letter-spacing:2px">动态表单 <span style="color:var(--primary)">Dynamic Forms</span></div>
        <div class="t-sub" style="margin-top:20px;font-size:32px;color:var(--secondary)">懂 WMS 的 Agent，把现场需求变成可发布的业务应用</div>
      </div>
      <div class="t-legend" style="position:absolute;left:0;right:0;top:720px;display:flex;justify-content:center;gap:18px">
        <span class="chip"><span class="tag-dot real"></span>真实定义 / 真实数据</span>
        <span class="chip"><span class="tag-dot sim"></span>示意画面</span>
      </div>`;
    pop('.t-logo', 0.3, 0.7);
    show('.t-brand', 0.6);
    show('.t-head', 0.9, 0.6, 26);
    show('.t-sub', 1.6);
    stagger('.t-legend .chip', E('title-1', -3), 0.25);
  });

  // Part 2 divider (no narration): s17 ends on "背后的几块基石，下面展开来看". A progress rail marks Part 1 done and
  // lights Part 2, the agenda lists the cornerstones in the order Part 2 covers them, and the first one (Item
  // Ontology) is singled out to hand over to s02.
  Scene('s19-part2', { title: 'Part 2 · 技术实现' }, ({ root, D, show, pop, fadeIn, stagger, anim, cls }) => {
    const stones = [
      ['brain', 'Item Ontology', '懂 WMS'],
      ['shield', '权限模型', '代表用户办事'],
      ['layers', 'GenUI 核心概念', 'Card · Task · Type'],
      ['database', '三层存储', '不建表'],
      ['code', 'Dynamic View API', '只读 · Wasm 沙箱'],
      ['box', 'Custom Object', '长期客户数据'],
      ['puzzle', 'Composable Step', 'Move Inventory'],
      ['rocket', '开发与发布', '人来拍板'],
    ];
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(1000px 560px at 50% 40%, rgba(85,53,160,.10), transparent 70%)"></div>
      <div class="pt-rail">
        <div class="pt-step done"><span class="pt-dot">${icon('check', 16, '#fff', 3)}</span><div><div class="pt-n">Part 1</div><div class="pt-t">用例与案例</div></div></div>
        <div class="pt-line"><i></i></div>
        <div class="pt-step p2"><span class="pt-dot">2</span><div><div class="pt-n">Part 2</div><div class="pt-t">技术实现</div></div></div>
      </div>
      <div class="pt-head">
        <div class="pt-eyebrow">Part 2 · 技术实现</div>
        <div class="pt-h">案例能跑通，靠的是背后的几块基石</div>
      </div>
      <div class="pt-stones">${stones.map(([ic, name, sub], index) => `
        <div class="pt-stone st${index}"><span class="pt-i">${index + 1}</span><div class="pt-ic">${icon(ic, 26)}</div><div class="pt-name">${name}</div><div class="pt-sub">${sub}</div></div>`).join('')}
      </div>`;
    show('.pt-rail', 0.2, 0.45, 12);
    anim('.pt-line i', 0.6, 0.7, { width: [0, 220] }, 'inOut');
    cls('.pt-step.p2', 'on', 1.25);
    pop('.pt-step.p2 .pt-dot', 1.25, 0.4);
    show('.pt-eyebrow', 1.0);
    show('.pt-h', 1.25, 0.55, 22);
    stagger('.pt-stone', 2.0, 0.13, 'show');
    // Hand over to s02: Item Ontology comes first.
    const tFocus = D - 1.5;
    cls('.st0', 'focus', tFocus);
    anim('.pt-stone:not(.st0)', tFocus, 0.4, { opacity: 0.45 });
  });

  Scene('s01-compare', { title: '同样三个应用：旧方式 vs 新方式', tag: '估算 · 传统按典型定制交付流程', tagKind: 'design' }, ({ root, segs, anim, show, fadeIn, pop, stagger, count }) => {
    const P = (segId, fraction) => (segs[segId] ? segs[segId].start + fraction * (segs[segId].end - segs[segId].start) : 0);
    const { before, after } = UI.COMPARE;
    const chain = ['现场', '实施', '产品', '开发', '测试', '上线'];
    // Bars share one scale per row, so the new side shows its true size against the old.
    const bar = (cls, value, max) => `<div class="cm-bar ${cls}"><i style="width:max(8px, ${((100 * value) / max).toFixed(2)}%)"></i></div>`;
    const big = (cls, html) => `<div class="cm-big ${cls}">${html}</div>`;
    const lines = (kind, items) => items.map((line) => `
      <div class="cm-line ${kind}"><span class="cm-mark">${icon(kind === 'old' ? 'x' : 'check', 15, '#fff', 3)}</span>${line}</div>`).join('');
    root.innerHTML = `
      ${chapter('对比 · 同样三个应用', '从 2 周迭代，到当天上线', '巡检上报 · 派工工作台 · Move Damage 搬运任务')}
      <div class="cm-grid">
        <div></div>
        <div class="cm-col old cm-h0">
          <div class="cm-title">${icon('clock', 24)} 传统定制交付</div>
          <div class="cm-chain">${chain.map((hop, index) => `<span class="cm-step">${index ? icon('chevronRight', 18, 'rgba(180,83,9,.55)', 2.4) : ''}<span class="cm-hop">${hop}</span></span>`).join('')}</div>
        </div>
        <div class="cm-col new cm-h1">
          <div class="cm-title">${icon('sparkles', 24)} Item WMS 动态表单</div>
          <div class="cm-chain"><span class="cm-hop">需求方</span><span class="cm-dual">${icon('arrowLeft', 16)}${icon('arrowRight', 16)}</span><span class="cm-hop">Agent</span><span class="cm-loop">描述 → 初版 → 试用 → 修改</span></div>
        </div>

        <div class="cm-label">${icon('users', 26)}<b>工时</b></div>
        <div class="cm-col old cm-c0">${big('', `≈ <span class="cm-n0">${before.effort}</span><small>人天</small>`)}<div class="cm-sub">${before.effortDetail}</div>${bar('old', before.effortHours, before.effortHours)}</div>
        <div class="cm-col new cm-c1">${big('', `<small class="cm-per">${after.effortPer}</small>${after.effort}<small>${after.effortUnit}</small>`)}<div class="cm-sub">${after.effortDetail}</div>${bar('new', after.effortHours, before.effortHours)}</div>

        <div class="cm-label">${icon('history', 26)}<b>周期</b></div>
        <div class="cm-col old cm-c2">${big('', `${before.lead}<small>${before.leadUnit}</small>`)}<div class="cm-sub">${before.leadDetail}</div>${bar('old', before.leadDays, before.leadDays)}</div>
        <div class="cm-col new cm-c3">${big('', after.lead)}<div class="cm-sub">${after.leadDetail}</div>${bar('new', after.leadDays, before.leadDays)}</div>

        <div class="cm-label">${icon('checkCircle', 26)}<b>效果</b></div>
        <div class="cm-col old cm-c4">${lines('old', before.outcome)}</div>
        <div class="cm-col new cm-c5">${lines('new', after.outcome)}</div>
      </div>
      <div class="cm-note">传统方式按 3PL 定制需求的典型交付流程估算；新方式为本案例示意</div>`;

    // cmp-1: the old way, row by row as the narration names hops, effort and lead time.
    show('.cm-h0', P('cmp-1', 0.02));
    // Each hop lands together with the arrow leading into it, so no arrow ever points at nothing.
    stagger('.cm-h0 .cm-step', P('cmp-1', 0.1), P('cmp-1', 0.06) - P('cmp-1', 0), 'pop');
    root.querySelectorAll('.cm-label').forEach((el, index) => fadeIn(el, P('cmp-1', 0.5) + index * 0.2));
    show('.cm-c0', P('cmp-1', 0.55));
    count('.cm-n0', P('cmp-1', 0.55), 1.6, 0, before.effort);
    anim('.cm-c0 .cm-bar i', P('cmp-1', 0.6), 1.6, { clip: [0, 100] }, 'inOut');
    show('.cm-c2', P('cmp-1', 0.8));
    anim('.cm-c2 .cm-bar i', P('cmp-1', 0.84), 1.4, { clip: [0, 100] }, 'inOut');
    // cmp-2: what that costs the people who asked.
    show('.cm-c4', P('cmp-2', 0.05));
    stagger('.cm-c4 .cm-line', P('cmp-2', 0.1), P('cmp-2', 0.3) - P('cmp-2', 0), 'slideIn');
    // cmp-3: the new way lands beside it; the old column steps back.
    anim('.cm-col.old', P('cmp-3', 0.02), 0.6, { opacity: 0.55 });
    show('.cm-h1', P('cmp-3', 0.02));
    stagger('.cm-h1 .cm-hop, .cm-h1 .cm-dual, .cm-h1 .cm-loop', P('cmp-3', 0.06), 0.25, 'pop');
    pop('.cm-c1', P('cmp-3', 0.3));
    anim('.cm-c1 .cm-bar i', P('cmp-3', 0.34), 0.5, { clip: [0, 100] });
    pop('.cm-c3', P('cmp-3', 0.44));
    anim('.cm-c3 .cm-bar i', P('cmp-3', 0.48), 0.5, { clip: [0, 100] });
    show('.cm-c5', P('cmp-3', 0.58));
    stagger('.cm-c5 .cm-line', P('cmp-3', 0.62), P('cmp-3', 0.12) - P('cmp-3', 0), 'slideIn');
    fadeIn('.cm-note', P('cmp-3', 0.9));
    // cmp-4: hand over to the case.
    anim('.cm-col.old', P('cmp-4', 0), 0.4, { opacity: 1 });
  });

  Scene('s02-ontology', { title: 'Item Ontology', tag: '架构示意', tagKind: '' }, ({ root, S, E, show, anim, pop, stagger, slideIn, fadeIn }) => {
    const layers = [
      ['box', 'Business Objects', '业务对象', 'Inventory · LPN · Inventory Issue · Task · Order'],
      ['workflow', 'Business Processes', '业务流程', 'Receiving · Put Away · Pick · Replenish · Count'],
      ['scale', 'Business Rules', '业务规则', 'Inventory Key · Allocation · Goods Condition'],
      ['sliders', 'Business Configurations', '业务配置', 'Put Away Strategy · Facility Settings'],
      ['code', 'API Endpoints', '业务接口', 'Operations · Permissions · Request / Response Schemas'],
      ['cpu', 'Engineering', '工程知识', 'GenUI Runtime · Views · Permissions · Audit'],
    ];
    const routes = ['POST /inventory/inventory-issue', 'POST /inventory/inventory-issue/search', 'POST /ops/genui-task-type/{id}/tasks', 'POST /mobile/composable-step/…/take'];
    const skills = ['wms-api', 'wms-flows', 'wms-workflow', 'wms-settings', 'genui-task-pages', 'build-wms-extension'];
    const groups = [
      ['layers', '交互容器', 'Surfaces', [['Dynamic Card', '对话里的轻量交互'], ['Dynamic Task', '手机端沉浸式任务'], ['Dynamic Page', 'Web 工作台 / 查询页']]],
      ['puzzle', '组合积木', 'Building Blocks', [['Declarative UI', '扫描 · 输入 · 表格 · 图表 · 操作，JSON 声明'], ['Composable Step', 'Move Inventory = Take → Place'], ['Dynamic View API', '只读 TypeScript · Wasm 沙箱']]],
      ['database', '持久化', 'Data', [['Header · Lines · Records', 'Task 与 Custom Object 共用三层存储'], ['Custom Object', '长期保存的客户数据，有自己的状态流转'], ['业务事实', '仍走 WMS 业务接口']]],
      ['rocket', '发布治理', 'Lifecycle', [['Draft → Trial → Published', '人确认后才发布'], ['Versions', '进行中的任务跟随新版本'], ['Export / Import', '测试 → 生产，导入为草稿']]],
    ];
    // One header style for the three knowledge cards so their titles line up.
    const cardHead = (ic, title, sub) => `
      <div style="display:flex;align-items:center;gap:12px">${icon(ic, 30, 'var(--primary)')}<div><div style="font-size:26px;font-weight:800;line-height:1.2">${title}</div><div style="font-size:16px;color:var(--muted)">${sub}</div></div></div>`;
    root.innerHTML = `
      ${chapter('Part 2 · 技术实现 · AI Native', 'Agent 长在 WMS 内部，用 Item Ontology 理解业务')}
      <div class="top" style="position:absolute;inset:0;transform-origin:960px 520px">
      <div class="onto card" style="position:absolute;left:96px;top:240px;width:648px;height:560px;padding:24px 26px;display:flex;flex-direction:column">
        ${cardHead('brain', 'Item Ontology', 'WMS 业务本体 · 随系统演进持续更新')}
        <div style="flex:1;margin-top:16px;display:flex;flex-direction:column;justify-content:space-between">
        ${layers.map(([ic, en, cn, ex]) => `
          <div class="layer" style="display:flex;gap:14px;align-items:center;padding:9px 14px;border-radius:12px;background:var(--raised)">
            <div style="width:44px;height:44px;border-radius:10px;background:#fff;display:grid;place-items:center;color:var(--primary)">${icon(ic, 24)}</div>
            <div><div style="font-size:19px;font-weight:700">${cn} <span style="font-weight:500;color:var(--muted);font-size:16px">${en}</span></div><div style="font-size:15.5px;color:var(--secondary)">${ex}</div></div>
          </div>`).join('')}
        </div>
      </div>
      <svg class="link-l" style="position:absolute;left:744px;top:510px;overflow:visible" width="116" height="20"><path d="M0 10 H116" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
      <svg class="link-r" style="position:absolute;left:1060px;top:400px;overflow:visible" width="116" height="290"><path d="M0 120 H58 M116 0 H70 Q58 0 58 12 V278 Q58 290 70 290 H116" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      <div class="agent card" style="position:absolute;left:860px;top:400px;width:200px;height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px solid var(--primary-line);box-shadow:0 18px 44px rgba(85,53,160,.18)">
        <div style="width:104px;height:104px;display:grid;place-items:center">${UI.agentMark(96, 'var(--primary)', 1.2)}</div>
        <div style="margin-top:14px;font-size:21px;font-weight:800;white-space:nowrap">Item WMS Agent</div>
        <div style="margin-top:4px;font-size:15px;color:var(--muted);white-space:nowrap">理解 · 规划 · 生成</div>
      </div>
      <div class="api card" style="position:absolute;left:1176px;top:240px;width:648px;height:320px;padding:24px 26px;display:flex;flex-direction:column">
        ${cardHead('list', 'Operation &amp; API Catalog', '1,311 个接口操作 · 权限 · 规则在后端还是界面')}
        <div style="flex:1;margin-top:16px;display:flex;flex-direction:column;justify-content:space-between">${routes.map((r) => `<span class="chip code route" style="font-size:15.5px;padding:8px 14px">${r}</span>`).join('')}</div>
      </div>
      <div class="skills card" style="position:absolute;left:1176px;top:580px;width:648px;height:220px;padding:24px 26px;display:flex;flex-direction:column">
        ${cardHead('book', '内部 Skills', 'Agent 的工作手册 · 流程 · 接口 · 页面写法')}
        <div style="flex:1;margin-top:16px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start">${skills.map((sk) => `<span class="chip code skill" style="font-size:15px;padding:6px 12px">${sk}</span>`).join('')}</div>
      </div>
      </div>
      <div class="top2" style="position:absolute;inset:0">
        <div class="card" style="position:absolute;left:96px;top:228px;width:680px;height:236px;padding:20px 22px">
          <div style="display:flex;align-items:center;gap:10px">${icon('brain', 24, 'var(--primary)')}<span style="font-size:21px;font-weight:800">Item Ontology</span><span style="font-size:15px;color:var(--muted)">WMS 业务本体</span></div>
          <div style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            ${layers.map(([ic, en, cn]) => `<div style="display:flex;align-items:center;gap:12px;padding:15px 14px;border-radius:12px;background:var(--raised)"><div style="width:38px;height:38px;flex:none;border-radius:9px;background:#fff;display:grid;place-items:center;color:var(--primary)">${icon(ic, 19)}</div><div style="min-width:0"><div style="font-size:16.5px;font-weight:700">${cn}</div><div style="font-size:12.5px;color:var(--muted);white-space:nowrap">${en}</div></div></div>`).join('')}
          </div>
        </div>
        <svg style="position:absolute;left:776px;top:336px;overflow:visible" width="84" height="20"><path d="M0 10 H84" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
        <svg style="position:absolute;left:1060px;top:284px;overflow:visible" width="84" height="124"><path d="M0 62 H42 M84 0 H54 Q42 0 42 12 V112 Q42 124 54 124 H84" stroke="#8b74c9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        <div class="card" style="position:absolute;left:860px;top:228px;width:200px;height:236px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px solid var(--primary-line);box-shadow:0 18px 44px rgba(85,53,160,.16)">
          <div style="width:84px;height:84px;display:grid;place-items:center">${UI.agentMark(78, 'var(--primary)', 1.3)}</div>
          <div style="margin-top:14px;font-size:19px;font-weight:800;white-space:nowrap">Item WMS Agent</div>
          <div style="margin-top:2px;font-size:14px;color:var(--muted)">理解 · 规划 · 生成</div>
        </div>
        <div class="card" style="position:absolute;left:1144px;top:228px;width:680px;height:112px;padding:18px 22px">
          <div style="display:flex;align-items:center;gap:10px">${icon('list', 22, 'var(--primary)')}<span style="font-size:19px;font-weight:800">Operation &amp; API Catalog</span><span style="font-size:14.5px;color:var(--muted)">1,311 个接口操作 · 权限 · 规则位置</span></div>
          <div style="margin-top:12px;display:flex;gap:8px">${[routes[0], routes[2]].map((r) => `<span class="chip code" style="font-size:13.5px;padding:5px 10px">${r}</span>`).join('')}</div>
        </div>
        <div class="card" style="position:absolute;left:1144px;top:352px;width:680px;height:112px;padding:18px 22px">
          <div style="display:flex;align-items:center;gap:10px">${icon('book', 21, 'var(--primary)')}<span style="font-size:19px;font-weight:800">内部 Skills</span><span style="font-size:14.5px;color:var(--muted)">流程 · 接口 · 页面写法</span></div>
          <div style="margin-top:12px;display:flex;gap:8px">${skills.slice(0, 5).map((sk) => `<span class="chip code" style="font-size:13.5px;padding:5px 10px">${sk}</span>`).join('')}</div>
        </div>
      </div>
      <div class="link-d" style="position:absolute;left:958.5px;top:464px;width:3px;height:92px;background:#8b74c9"></div>
      <div class="gpanel" style="position:absolute;left:96px;top:556px;width:1728px;height:384px;border-radius:20px;background:linear-gradient(180deg, #f1edfa, #f8f6fd);border:1px solid var(--primary-line);padding:22px 26px">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:50px;height:50px;border-radius:14px;background:var(--primary);color:#fff;display:grid;place-items:center;box-shadow:0 8px 18px rgba(85,53,160,.25)">${icon('layers', 26)}</div>
          <div><div style="font-size:27px;font-weight:800;color:var(--primary);line-height:1.15">GenUI 架构</div><div style="margin-top:3px;font-size:16.5px;color:var(--secondary)">生成式界面 · Agent 在 WMS 内构建应用的积木：不写新服务、不建表、不绕过权限</div></div>
          <div class="out pill primary" style="margin-left:auto;font-size:17px;padding:8px 18px;background:#fff">${icon('checkCircle', 18)} 生成物从一开始就符合 WMS 约定</div>
        </div>
        <div style="margin-top:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
          ${groups.map(([ic, cn, en, items]) => `
            <div class="gcol" style="padding:18px 20px 16px;border-radius:14px;background:#fff;border:1px solid #e6e0f4">
              <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line)">
                <div style="width:36px;height:36px;border-radius:10px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center">${icon(ic, 20)}</div>
                <div style="font-size:19px;font-weight:800">${cn}</div><div style="margin-left:auto;font-size:13.5px;color:var(--muted);letter-spacing:.3px">${en}</div>
              </div>
              ${items.map(([name, desc]) => `<div style="margin-top:12px"><div style="font-size:16.5px;font-weight:700;color:var(--strong)">${name}</div><div style="margin-top:1px;font-size:14.5px;color:var(--secondary)">${desc}</div></div>`).join('')}
            </div>`).join('')}
        </div>
      </div>`;
    show('.onto', S('onto-1', 2.2), 0.6);
    stagger('.layer', S('onto-1', 4.0), 0.7, 'slideIn');
    pop('.agent', S('onto-1', 0.2), 0.6);
    anim('.link-l', S('onto-1', 8.5), 0.6, { clip: [0, 100] });
    show('.api', S('onto-2', 0.4));
    stagger('.route', S('onto-2', 1.6), 0.35, 'slideIn');
    show('.skills', S('onto-2', 4.5));
    stagger('.skill', S('onto-2', 5.0), 0.15, 'pop');
    anim('.link-r', S('onto-2', 7.0), 0.6, { clip: [0, 100] });
    // onto-3: the large knowledge cards give way to a compact strip at full type size, so the GenUI architecture
    // gets the lower half of the stage without shrinking anything into a thumbnail.
    const z = S('onto-3', 0);
    anim('.top', z, 0.35, { opacity: [1, 0], scale: [1, 0.97] }, 'in');
    show('.top2', z + 0.32, 0.55, 16);
    anim('.link-d', z + 0.9, 0.5, { clipY: [0, 100] });
    show('.gpanel', z + 0.8, 0.6, 30);
    root.querySelectorAll('.gcol').forEach((el, i) => pop(el, z + [2.8, 4.1, 5.6, 7.1][i]));
    pop('.out', z + 9.8);
  });

  Scene('s03-permission', { title: '权限模型', tag: '架构示意' }, ({ root, segs, S, show, anim, pop, fadeIn, cls }) => {
    const P = (segId, fraction) => (segs[segId] ? segs[segId].start + fraction * (segs[segId].end - segs[segId].start) : 0);
    // Three requests leave the Agent; the gate judges each by Emily's own role permissions (RBAC)
    // and by which data and objects are Emily's (facility grants, task assignment).
    const requests = [
      { cls: 'ok', path: 'POST …/TDEF-151/tasks', code: '201 Created', desc: '创建 Move Damage 任务 · 在 Emily 的权限内', at: 0.02, lights: '.rb-yes' },
      { cls: 'no', path: 'PATCH …/facility-setting/:id', code: '403 Forbidden', desc: '修改仓库设置 · 角色没有这个权限', at: 0.3, lights: '.rb-no' },
      { cls: 'no', path: 'POST …/TASK-18652/records', code: '403 notAssignee', desc: '任务指派给 Maria Garcia，不是 Emily', at: 0.52, lights: '.dac-task' },
    ];
    const LANES = [492, 578, 664];
    const perm = (cls, kind, html) => `<div class="pm-perm ${kind} ${cls}">${icon({ yes: 'check', no: 'x', rule: 'lock' }[kind], 16, 'currentColor', kind === 'rule' ? 2.2 : 3)}${html}</div>`;
    root.innerHTML = `
      ${chapter('Part 2 · 权限模型', 'Agent 代表用户办事，权限上限就是用户本人')}
      <div class="card pm-user">
        <div class="pm-col pm-id"><div class="pm-row">${icon('user', 26)}<div><div class="pm-name">Emily Carter</div><div class="pm-sub">Supervisor · Valley View</div></div></div></div>
        <div class="pm-col">
          <div class="pm-col-h">角色权限 · <b>RBAC</b><span>能调用哪些接口</span></div>
          ${perm('rb-yes', 'yes', '<span class="mono">ops/genui-task:write</span>')}
          ${perm('rb-no', 'no', '<span class="mono">master-data/setting:write</span><em>未授予</em>')}
        </div>
        <div class="pm-col">
          <div class="pm-col-h">数据与对象 · <b>DAC</b><span>能碰哪些数据</span></div>
          ${perm('dac-facility', 'rule', '仓库授权：Valley View<em>其他仓库不可见</em>')}
          ${perm('dac-task', 'rule', '任务归属：只执行指派给本人的任务')}
        </div>
      </div>
      <div class="pm-delegate"><span class="pill primary">${icon('key', 15)} 委托 · 同一个 WMS 令牌</span></div>
      <div class="card pm-agent">
        <div class="pm-row">${icon('sparkles', 26)}<div><div class="pm-name">Item WMS Agent</div><div class="pm-sub">以 Emily 本人的身份调用接口</div></div></div>
      </div>
      ${LANES.map((y) => `<div class="pm-lane" style="top:${y}px"></div><div class="pm-lane out" style="top:${y}px"></div>`).join('')}
      ${requests.map((r, i) => `<div class="pm-req ${r.cls} r${i} mono" style="top:${LANES[i]}px">${r.path}</div>`).join('')}
      <div class="card pm-gate">
        <div class="pm-gate-icon">${icon('shield', 30)}</div>
        <div class="pm-name">WMS API</div>
        <div class="pm-sub">角色权限校验<br>仓库隔离 · 任务归属</div>
        <div class="pm-gate-note">按 Emily 本人判定</div>
      </div>
      ${requests.map((r, i) => `
        <div class="card pm-result ${r.cls} res${i}" style="top:${LANES[i]}px">
          <span class="pm-badge">${icon(r.cls === 'ok' ? 'check' : 'x', 18, '#fff', 3)}</span>
          <div><div class="pm-code">${r.code}</div><div class="pm-sub">${r.desc}</div></div>
        </div>`).join('')}
      <div class="audit card" style="position:absolute;left:96px;top:756px;width:1728px;padding:0;overflow:hidden">
        <div style="padding:12px 20px;background:var(--section);font-weight:700;font-size:17px;display:flex;gap:10px;align-items:center">${icon('history', 18)} 数据变更日志 · Data Change Log</div>
        <div class="mono" style="display:grid;grid-template-columns:230px 160px 260px 110px 1fr;padding:12px 20px;font-size:16px;color:var(--muted);border-bottom:1px solid var(--line)"><span>changed_at</span><span>user</span><span>object</span><span>op</span><span>screen_id</span></div>
        <div class="arow mono" style="display:grid;grid-template-columns:230px 160px 260px 110px 1fr;padding:12px 20px;font-size:16px"><span>10/27/2026 10:31:08</span><span>Emily Carter</span><span>Dynamic Task</span><span>INSERT</span><span style="color:var(--primary);font-weight:700">page:damaged-inventory-relocation@v1</span></div>
      </div>`;

    // perm-1: who acts for whom.
    show('.pm-user', P('perm-1', 0.05));
    fadeIn('.pm-delegate', P('perm-1', 0.4));
    show('.pm-agent', P('perm-1', 0.5));
    show('.pm-gate', P('perm-1', 0.75));
    fadeIn('.pm-lane', P('perm-1', 0.75));
    // perm-2: one request inside Emily's permissions goes through; one beyond the role and one on
    // someone else's task stop flush against the gate (lane start 596 + pill 300 + 8 gap; gate at 1060).
    const travel = 1.6, STOP = 156;
    requests.forEach((r, i) => {
      const t = P('perm-2', r.at), pill = `.pm-req.r${i}`;
      anim(pill, t, 0.3, { opacity: [0, 1] });
      cls(r.lights, 'lit', t, r.cls === 'ok' ? P('perm-2', requests[1].at) : Infinity);
      if (r.cls === 'ok') {
        anim(pill, t, travel, { x: [0, 420] }, 'inOut');
        anim(pill, t + travel - 0.25, 0.25, { opacity: 0 });
        pop(`.res${i}`, t + travel);
      } else {
        anim(pill, t, travel, { x: [0, STOP] }, 'inOut');
        [-16, 10, -6, 0].reduce((at, dx) => anim(pill, at, 0.08, { x: STOP + dx }), t + travel);
        cls(pill, 'denied', t + travel);
        pop(`.res${i}`, t + travel + 0.2);
      }
    });
    // perm-3: every write is on the record.
    show('.audit', S('perm-3', 0.2));
    show('.arow', S('perm-3', 1.6));
  });
})();
