// s15 Emily has the Agent build Move Damage · s13 Agent drafts + publishes the Dynamic Page · s14 supervisor dispatches
// (played in that order: the page dispatches the type built first)
(() => {
  const { icon, webTopbar, waTool } = UI;

  const ISSUES = [
    ['ISSUE-106', 'A12-05-1', 'CLP-1005744', 'NB-BAT57-3C · 57Wh 3-Cell Notebook Battery', '12 EA', 'John Smith', '10/27/2026 10:12'],
    ['ISSUE-107', 'A12-04-2', 'CLP-1005745', 'NB-ADP65-USBC · 65W USB-C Power Adapter', '20 EA', 'John Smith', '10/27/2026 10:19'],
    ['ISSUE-104', 'B03-02-1', 'CLP-1005611', 'NB-KB14-US · 14" US Keyboard Assembly', '6 EA', 'Ana Lopez', '10/26/2026 16:05'],
  ];

  // The Damaged Inventory Relocation page as wms-web renders it (body from PDEF-101).
  function relocationPage({ width, draft = false, compact = false }) {
    const cols = compact ? ['Issue', 'Location', 'LPN', 'Item', 'Qty'] : ['Issue', 'Location', 'LPN', 'Item', 'Reported Qty', 'Reported By', 'Reported At'];
    const asideW = compact ? 300 : 340;
    return `
      <div class="web" style="position:relative;width:${width}px;height:100%">
        ${webTopbar()}
        <div class="content">
          <div class="crumb">Custom Apps · Dynamic Pages</div>
          <div class="title">Damaged Inventory Relocation</div>
          <div class="desc">Review damage reports from patrols and create one Move Damage task to bring the selected stock to the damage location.</div>
          ${draft ? `<div class="banner dbn"><span class="pill warning dpill">Draft</span><span class="dtext">Draft v1 — not published. Others still see the published version.</span><span style="margin-left:auto" class="btn link">Reload Draft</span><span class="btn primary pub">Publish</span></div>` : ''}
          <div class="panel"><div class="panel-h">Search Criteria</div>
            <div class="panel-b" style="display:flex;gap:14px;align-items:flex-end">
              ${['Keyword|Issue, LPN or note', 'Location|Search', 'Item|Search'].map((f) => { const [l, p] = f.split('|'); return `<div style="flex:1"><div class="field-label">${l}</div><div class="input">${p}</div></div>`; }).join('')}
              <span class="btn">Search</span>
            </div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <div class="panel" style="flex:1;min-width:0"><div class="panel-h">Damaged Issues</div>
              <div class="panel-b" style="padding:12px 14px">
                <div style="color:var(--secondary);margin-bottom:10px" class="tot">Total 3 records</div>
                <table>
                  <tr><th style="width:36px"><span class="cb"></span></th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
                  ${ISSUES.map((r, i) => `<tr class="ir ir${i}"><td><span class="cb cb${i}"></span></td>${r.slice(0, cols.length).map((v, j) => `<td class="${j === 0 ? 'link' : ''}" style="${j === 3 ? 'white-space:normal' : ''}">${v}</td>`).join('')}</tr>`).join('')}
                </table>
              </div>
            </div>
            <div class="panel" style="width:${asideW}px;flex:none"><div class="panel-h">Actions</div>
              <div class="panel-b">
                <div style="color:var(--secondary);font-size:14.5px;line-height:1.5">Damaged stock is placed at the suggested damage location when the worker scans it at Place.</div>
                <div class="field-label" style="margin-top:14px">Worker</div>
                <div class="input wk" style="position:relative"><span class="wkv">Search</span>
                  <div class="dd" style="position:absolute;left:-1px;right:-1px;top:36px;background:#fff;border:1px solid var(--line-strong);border-radius:6px;box-shadow:0 8px 20px rgba(31,41,51,.12);z-index:3;color:var(--text)">
                    <div style="padding:9px 12px;background:#f6f3fd">Maria Garcia</div><div style="padding:9px 12px">Mario Rossi</div></div>
                </div>
                <div class="field-label" style="margin-top:14px">Task Title</div>
                <div class="input ttl"><span class="ttv">Move Damage</span></div>
                <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:flex-end"><span class="btn primary crt">Create Move Damage Task</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="toast wtoast">${icon('check', 16, '#166534', 2.4)}<span class="wtt">Created TASK-18652</span><span class="tx">${icon('x', 14, '#166534', 2.2)}</span></div>
      </div>`;
  }

  // ── Agent Workspace in a browser window (s15 → s13): full screen = sidebar + centred conversation (AgentChatPanel
  // isMaximized); opening the Workspace Browser hides the sidebar, docks the conversation on the right (compact header,
  // .wa-head) and shows the embedded app in the left pane. The two scenes share the conversation, so they share markup.
  const PANE = 1156; // Workspace Browser width in split view; the conversation keeps the remaining 700px.
  const chip = (label, kind = '') => `<span class="pc-chip ${kind}">${label}</span>`;

  // present_card review card, content as a label/value grid. rows: [cls, label, value, meta]; actions: [cls, label].
  const planCard = ({ cls = '', ic, title, subtitle, badge, rows, actions, run = '' }) => `
    <div class="wac pc ${cls}">
      <div class="wac-h"><span class="pc-ic">${icon(ic, 21, 'var(--primary)')}</span>
        <div style="min-width:0;flex:1"><div class="t">${title}</div><div class="s">${subtitle}</div></div>
        <span class="pill ${badge[1]} wac-badge">${badge[0]}</span></div>
      <div class="pc-b">${rows.map(([rowCls, label, value, meta = '']) => `<div class="pc-r ${rowCls}"><div class="l">${label}</div><div class="v">${value}${meta ? `<div class="pc-meta">${meta}</div>` : ''}</div></div>`).join('')}</div>
      <div class="wac-f"><div class="btns">${actions.map(([btnCls, label], i) => `<span class="wac-btn ${i === 0 ? 'solid' : ''} ${btnCls}">${label}</span>`).join('')}</div><div class="wac-run">${run}</div></div>
    </div>`;
  // One Agent turn's research: "Thinking…" while it runs, then "Worked for" with the steps folded away.
  const research = (steps, { done = '' } = {}) => `
    <div class="rs">
      <div class="ws-worked"><span class="wkt">${done || 'Thinking'}</span><span class="wkc" style="display:grid">${icon('chevronRight', 15, 'var(--muted)')}</span></div>
      ${done ? '' : `<div class="ws-steps" style="height:${steps.length * 29 - 4}px">${steps.map(([ic, label]) => `<div class="tl">${waTool(ic, label)}</div>`).join('')}</div>`}
    </div>`;
  const thought = (words) => ['lightbulb', `<span class="th">${words}</span>`];
  const okRun = (words) => `${icon('checkCircle', 15, 'var(--success)')} ${words}`;
  const phoneRun = (words) => `${icon('smartphone', 15, 'var(--secondary)')} ${words}`;

  // s15's turn: the Move Damage request, its research and the review card (final: the state s15 ends in).
  const MD_SAID = '把破损库存搬到坏货区，做成可以复用的任务类型。搬哪些，由工作台传进来。';
  const moveDamageTurn = ({ final = false } = {}) => `
    <div class="q wa-user">${MD_SAID}</div>
    ${research([
      ['brain', '[Skill] genui-task-pages'],
      ['sparkles', '[list_composable_steps] Move Inventory · Take → Place'],
      ['brain', '[Skill] wms-settings · put-away mapping'],
      thought('目的库位不写死：Valley View 已配 Damaged → DMG 上架映射，Place 跟随建议即可'),
      ['sparkles', '[draft_genui_task_type] Move Damage · Draft v1'],
    ], { done: final ? 'Worked for 41s' : '' })}
    <div class="ans wa-text">草稿好了：一个 composable step，目的地跟随上架映射。点 <b>Try it</b> 在手机上试跑一遍，没问题再发布。</div>
    <div class="rc">${planCard({
      ic: 'blocks', title: final ? 'Move Damage · v1' : 'Move Damage · Draft v1', subtitle: 'Dynamic Task Type · 1 composable step · Valley View',
      badge: final ? ['Published v1', 'success'] : ['Draft', 'warning'],
      rows: [
        ['r1', 'Step', 'Move damaged stock to the damage location', `${chip('composable', 'soft')}${chip('Move Inventory')}<span>Take → Place</span>`],
        ['r2', 'Input per task', 'Moves — lines passed in by the page that starts it', ['fromLpn', 'fromLocationCode', 'itemId', 'qty', 'uomId'].map((f) => chip(f)).join('')],
        ['r3', 'Goods condition', chip(`${icon('alert', 14, '#b91c1c', 2.2)} Damaged`, 'dmg')],
        ['r4', 'Destination', 'Not fixed — Place follows the put-away suggestion', `<span class="map" style="display:contents">${chip('Damaged', 'loc')}→${chip('Damaged Goods', 'loc')}→${chip('DMG-01', 'loc')}<span style="margin-left:4px">put-away mapping</span></span>`],
      ],
      actions: [[`pub${final ? ' off' : ''}`, final ? 'Published' : 'Publish'], [`try${final ? ' off' : ''}`, `${icon('play', 15, 'var(--strong)')} Try it`], ['', `${icon('monitor', 16)} Open on Web`]],
      run: final ? okRun('Published Move Damage v1 · pages can start it as {{taskType.move-damage}}') : '',
    })}</div>`;

  // The trial task s15 runs on the embedded mobile app (no Android navigation bar inside the Workspace Browser).
  const trialDevice = ({ closed = false } = {}) => UI.wsDevice(`
    <div class="trial" style="position:absolute;inset:0;background:var(--canvas)">
      ${UI.mHeader('TASK-18649', 'Trial · Move Damage')}
      <div class="m-sec"><div class="m-label">Task</div><div class="m-value">Trial · Move Damage</div></div>
      <div class="m-sec"><div class="m-label">Moves</div><div class="m-value tln">${closed ? '1/1' : '0/1'} Lines</div><div class="mono" style="font-size:13.5px;color:var(--secondary);margin-top:4px">CLP-1005743 · NB-BAT57-3C · 6 EA · A12-03-1</div><div style="display:flex;justify-content:flex-end;margin-top:6px"><span class="pill success tsp" style="font-size:13px">${closed ? '1/1' : '0/1'} steps</span></div></div>
      <div class="m-row tstep" style="margin-top:10px"><span style="width:28px;height:28px;border-radius:50%;background:var(--raised);display:grid;place-items:center;font-size:13px;font-weight:700">1</span><div><div style="font-weight:600">Move damaged stock to the damage location</div><div style="font-size:13.5px;color:var(--muted)" class="tst">${closed ? 'Closed' : 'New'}</div></div></div>
      <div class="tdone pill success" style="position:absolute;left:50%;bottom:30px;translate:-50% 0;font-size:16px;padding:8px 20px;${closed ? '' : 'opacity:0'}">${icon('checkCircle', 18)} Task Closed</div>
    </div>
    ${closed ? '' : `
    <div class="trun" style="position:absolute;inset:0;background:var(--canvas)">
      ${UI.moveTakeScreen({ title: 'TASK-18649', sub: 'Trial · Move Inventory', step: '1 of 1', item: 'NB-BAT57-3C', itemName: '57Wh 3-Cell Notebook Battery', qty: 6, uom: 'EA', fromLpn: 'CLP-1005743', location: 'A12-03-1' })}
    </div>
    <div class="trun2" style="position:absolute;inset:0;background:var(--canvas)">
      ${UI.movePlaceScreen({ title: 'TASK-18649', sub: 'Trial · Move Inventory', step: '1 of 1', toLpn: 'CLP-1005799', item: 'NB-BAT57-3C', qty: 6, uom: 'EA', suggestion: 'DMG-01' })}
    </div>`}`);

  const wsSidebar = ({ activeShown = true } = {}) => `
    <div class="aws-side">
      <div class="brand">${UI.logo(26)}Item WMS<span class="wa-dot"></span><span style="margin-left:auto;display:grid">${icon('panelLeftClose', 17, '#8a8f98')}</span></div>
      <div class="nav">
        <div class="nv first">${icon('messagePlus', 16)}New conversation</div>
        <div class="nv">${icon('goal', 16)}Goals</div>
        <div class="nv">${icon('calendarClock', 16)}Automations</div>
        <div class="srch">${icon('search', 14)}Search conversations</div>
      </div>
      <div class="grp">Today</div>
      <div class="cv on cvnew" style="${activeShown ? '' : 'opacity:0'}">Move Damage 任务类型</div>
      <div class="cv">Inventory Patrol 巡检任务</div>
      <div class="cv">DMG 坏货区上架映射核对</div>
      <div class="grp">Pinned</div>
      ${['Valley View 每日入库进度', 'Cycle count 差异复核', 'Wave 1029 短拣排查', 'Northbridge 补货建议', 'Put-away 策略调整'].map((title) => `<div class="cv">${title}</div>`).join('')}
      <div class="acct"><span class="av">EC</span><div><div>Emily Carter</div><div class="em">emily.carter@item.com</div></div></div>
    </div>`;
  // Composer (AgentInputBar). Hold the mic (or right Ctrl) to dictate: .wa-status says Listening/Transcribing and
  // .wa-fill sweeps the box while the words become text.
  const wsComposer = () => `
    <div class="wa-composer"><div class="box"><div class="wa-fill"></div>
      <div class="wa-status"><span class="badge"><span class="ping"></span>${icon('mic', 12, '#fff')}</span><span class="st">Listening… Release right Ctrl to insert</span></div>
      <div class="wa-input"><span class="ph">Send to Item WMS Agent… hold right Ctrl or the mic to talk</span><span class="wa-typed"></span></div>
      <div class="row">${['paperclip', 'camera'].map((name) => `<span class="wa-act">${icon(name, 19, '#707070')}</span>`).join('')}
        <span class="model">deepseek-flash ${icon('chevronDown', 15, '#707070')}</span>
        <span class="mic">${icon('mic', 19, '#525252')}</span><span class="send">${icon('send', 17, '#fff')}</span></div>
    </div></div>`;
  const wsEmpty = () => `
    <div class="aws-empty">${UI.agentMark(34)}<div class="h">Ask me to operate the system or answer questions</div>
      <div class="chips"><span>Check current inventory for an item</span><span>Create an outbound order</span><span>Show today's inbound progress</span></div></div>`;
  // The whole window. split: start in split view (else full screen); app: 'phone' | 'laptop' on the app switcher.
  const workspace = ({ title, msgs, pane, empty = false, split = false, app = 'smartphone', activeShown = true }) => `
    <div class="desk"></div>
    <div class="bw">
      <div class="bw-tabs"><div class="bw-dots"><span></span><span></span><span></span></div>
        <div class="bw-tab">${UI.logo(16)}<span class="bwt">Item WMS · Agent Workspace</span><span class="x">${icon('x', 14)}</span></div>
        <div class="bw-tab dim">${icon('plus', 16, '#5f6368')}</div></div>
      <div class="bw-bar">${icon('arrowLeft', 18, '#5f6368')}${icon('arrowRight', 18, '#9aa0a6')}${icon('rotateCw', 17, '#5f6368')}
        <div class="bw-url">${icon('lock', 14, '#5f6368')}demo.itemwms.com<span class="p">/agent</span><span style="margin-left:auto;display:grid">${icon('star', 16, '#5f6368')}</span></div></div>
      <div class="bw-body">
        ${wsSidebar({ activeShown })}
        <div class="aws-pane"${split ? ` style="width:${PANE}px;opacity:1"` : ''}><div class="aws-pane-in">${pane}</div></div>
        <div class="aws-main"${split ? ` style="left:${PANE}px"` : ''}>
          <div class="aws-hfull"${split ? ' style="opacity:0"' : ''}>${icon('message', 18, 'var(--primary)')}<span class="wa-title">${title}</span>
            <span class="acts"><span class="wb">${icon('panelLeft', 17, '#525252')}Workspace Browser</span>${icon('moon', 18, '#525252')}${icon('pip', 18, '#525252')}</span></div>
          <div class="wa-head"${split ? ' style="opacity:1"' : ''}>${UI.agentMark(20)}<span class="wa-title">${title}</span><span class="wa-dot"></span>
            <span class="wa-acts"><span class="wa-app"><span class="appic">${icon(app, 18, 'var(--strong)')}${icon('chevronDown', 13, '#707070')}</span></span><span class="wa-act mx">${icon('maximize', 19, '#525252')}</span>${['pip', 'ellipsis'].map((name) => `<span class="wa-act">${icon(name, 19, '#525252')}</span>`).join('')}</span></div>
          <div class="aws-col">
            ${empty ? wsEmpty() : ''}
            <div class="aws-list"><div class="wa-msgs">${msgs}</div></div>
            ${wsComposer()}
          </div>
        </div>
      </div>
    </div>`;
  // Hold to talk (AgentInputBar): holding the mic (or right Ctrl) records; the box border turns primary and the status
  // row says Listening. Release sends the recording for transcription: Transcribing while a blue fill sweeps the box,
  // then the words land in the box and Send is enabled. Returns the time the message is sent.
  const dictate = ({ anim, cls, text, fn, $ }, { said, tPress, tRelease }) => {
    const tListen = tPress + 0.2, tDone = tRelease + 0.75, tSend = tDone + 0.6;
    cls('.wa-composer .mic', 'held', tPress, tRelease);
    cls('.wa-composer .box', 'busy', tListen, tDone);
    anim('.wa-status', tListen, 0.15, { height: [0, 30] });
    anim('.wa-status', tDone, 0.15, { height: 0 });
    text('.wa-status .st', tRelease, 'Transcribing…');
    cls('.wa-status .badge', 'idle', tRelease);
    // The listening badge pings (Tailwind animate-ping: 1 s, out to 2x and transparent).
    const ping = $('.wa-status .ping');
    fn((t) => {
      const cycle = t >= tListen && t < tRelease ? (t - tListen) % 1 : -1;
      ping.style.opacity = cycle < 0 ? 0 : 0.5 * (1 - cycle);
      ping.style.transform = `scale(${cycle < 0 ? 1 : 1 + cycle})`;
    });
    // useWebDictation fill: 72% at once, creeps while the model finishes, closes when the transcript arrives, resets.
    anim('.wa-fill', tRelease, 0.4, { clip: [0, 72] }, 'out');
    anim('.wa-fill', tRelease + 0.4, tDone - tRelease - 0.4, { clip: 80 }, 'linear');
    anim('.wa-fill', tDone, 0.16, { clip: 100 }, 'out');
    anim('.wa-fill', tDone + 0.22, 0.01, { clip: 0 });
    anim('.wa-composer .ph', tDone, 0.1, { opacity: [1, 0] });
    anim('.wa-typed', tDone, 0.12, { opacity: [0, 1] });
    text('.wa-typed', tDone, said);
    cls('.wa-composer .send', 'ready', tDone, tSend + 0.15);
    anim('.wa-typed', tSend + 0.1, 0.1, { opacity: 0 });
    anim('.wa-composer .ph', tSend + 0.1, 0.2, { opacity: 1 });
    return tSend;
  };
  // Pointer keys for dictate(): onto the mic, hold, release, click Send.
  const dictateKeys = (tPress, tRelease, tSend) => [[tPress - 0.7, '.wa-composer .mic', [0, -50]], [tPress, '.wa-composer .mic', null, 'hold'], [tRelease, '.wa-composer .mic'], [tSend, '.wa-composer .send', null, true], [tSend + 0.5, '.wa-composer .send', [0, -40]]];

  // Morph between the layouts: toSplit grows the pane over the sidebar's slot (crossfade) with its edge travelling
  // with the conversation, so no gap opens; back to full screen it shrinks into the sidebar and fades.
  const MORPH = 0.85;
  const morph = (anim, t0, toSplit) => {
    const [from, to] = toSplit ? [288, PANE] : [PANE, 288];
    anim('.aws-pane', t0, MORPH, { width: [from, to] }, 'inOut');
    anim('.aws-main', t0, MORPH, { left: [from, to] }, 'inOut');
    if (toSplit) {
      anim('.aws-pane', t0, 0.3, { opacity: [0, 1] });
      anim('.aws-hfull', t0, 0.25, { opacity: [1, 0] });
      anim('.aws-main .wa-head', t0 + MORPH - 0.3, 0.3, { opacity: [0, 1] });
    } else {
      anim('.aws-pane', t0 + MORPH - 0.35, 0.35, { opacity: [1, 0] });
      anim('.aws-main .wa-head', t0, 0.25, { opacity: [1, 0] });
      anim('.aws-hfull', t0 + MORPH - 0.3, 0.3, { opacity: [0, 1] });
    }
  };

  // Web Dynamic Page: Emily continues the same conversation. s13 opens where s15 ended (split, the trial closed on the
  // phone), maximizes back to full screen, dictates the request; the Agent researches, thinks and proposes the page
  // (draft_genui_page) as a review card. Try it opens the Workspace Browser on wms-web with the Draft preview; Publish
  // from the Draft banner shows the computed permissions, then publishes v1.
  Scene('s13-page-build', { title: '构建工作台页面', tag: '示意画面 · 页面定义来自本地 PDEF-101', tagKind: 'sim' }, (api) => {
    const { root, segs, S, E, show, stagger, anim, fadeIn, text, cls, hide, pointer, fn, $ } = api;
    const say = (seg, phrase, delta = 0) => {
      const g = segs[seg];
      if (!g) return delta;
      return g.start + (g.end - g.start) * (Math.max(0, g.text.indexOf(phrase)) / g.text.length) + delta;
    };
    const SAID = '做一个工作台：列出巡检上报、还没处理的破损库存，勾选后创建 Move Damage 任务，派给指定员工。';
    const steps = [
      ['brain', '[Skill] genui-task-pages'],
      ['sparkles', '[wms_api] POST /inventory/inventory-issue/search'],
      thought('只列 Open 的 Damaged 记录；派工直接复用刚发布的 move-damage，不重复造步骤'),
      ['sparkles', '[save_view_module] issues · sha256 15e9e8a8…'],
      ['sparkles', '[preview_view] issues · 3 rows · 184 ms'],
      ['sparkles', '[draft_genui_page] damaged-inventory-relocation · Draft v1'],
    ];
    const msgs = `
      <div class="old">${moveDamageTurn({ final: true })}</div>
      <div class="q q2 wa-user">${SAID}</div>
      <div class="new">
        ${research(steps)}
        <div class="ans wa-text">草稿好了：用真实数据预览过，当前 3 条待处理。派工按 <span class="mono">move-damage</span> 引用任务类型，换仓库也能用。点 <b>Try it</b> 在 Web 上试用。</div>
        <div class="rc">${planCard({
          ic: 'monitor', title: 'Damaged Inventory Relocation · Draft v1', subtitle: 'Dynamic Page · Custom Apps · damaged-inventory-relocation',
          badge: ['Draft', 'warning'],
          rows: [
            ['g1', 'Data', 'Open damaged issues reported by patrols', `${chip('issues', 'soft')}${chip('POST /inventory/inventory-issue/search')}<span>preview · 3 rows</span>`],
            ['g2', 'Layout', 'Search criteria · Damaged Issues table (multi-select) · Actions panel'],
            ['g3', 'Action', 'Create one Move Damage task and assign a worker', `${chip('{{taskType.move-damage}}')}→${chip('TDEF-151', 'loc')}<span style="margin-left:4px">Worker · Task Title</span>`],
            ['g4', 'Access', 'Draft — only page authors can open it', '<span>Publish computes the viewer permissions from every call</span>'],
          ],
          actions: [['cpub', 'Publish'], ['ctry', `${icon('play', 15, 'var(--strong)')} Try it`]],
        })}</div>
      </div>`;
    const modal = `
      <div class="mbg" style="position:absolute;inset:0;background:rgba(0,0,0,.3)"></div>
      <div class="modal card" style="position:absolute;left:268px;top:190px;width:620px;padding:0;overflow:hidden;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.2)">
        <div style="padding:18px 22px;font-size:19px;font-weight:700;border-bottom:1px solid var(--line)">Publish Damaged Inventory Relocation v1?</div>
        <div style="padding:16px 22px;font-size:15.5px;line-height:1.7">
          <div style="color:var(--secondary)">Viewers need these permissions — computed from every call the page makes:</div>
          ${[['ops/inventory-issue:read', 'issues view'], ['master-data/location:read', 'Location lookup'], ['ops/genui-task:write', 'Create Move Damage Task'], ['ops/inventory-issue:write', 'link issues to the task']].map(([p, why]) => `<div class="pm" style="display:flex;gap:10px;align-items:center;margin-top:6px">${icon('shield', 17, 'var(--primary)')}<span class="mono" style="font-size:14.5px">${p}</span><span style="color:var(--muted);font-size:14px">· ${why}</span></div>`).join('')}
          <div style="margin-top:12px;color:var(--secondary)">Body hash <span class="mono">b71e…2c90</span> — publish refuses a Draft that changed after review.</div>
        </div>
        <div style="padding:12px 22px;display:flex;justify-content:flex-end;gap:10px;background:#fafbfd;border-top:1px solid var(--line)"><span class="btn" style="height:32px;padding:0 14px;border:1px solid var(--line-strong);border-radius:6px;display:inline-flex;align-items:center">Cancel</span><span class="mpub" style="height:32px;padding:0 16px;border-radius:6px;background:var(--primary);color:#fff;display:inline-flex;align-items:center;font-weight:600">Publish</span></div>
      </div>`;
    const pane = `
      <div class="dev">${trialDevice({ closed: true })}</div>
      <div class="webv" style="position:absolute;inset:0;opacity:0">${relocationPage({ width: PANE, draft: true, compact: true })}${modal}</div>`;
    root.innerHTML = workspace({ title: 'Move Damage 任务类型', msgs, pane, split: true });

    // Maximize: back to the full-screen workspace, same conversation.
    const tMax = 1.1;
    morph(anim, tMax + 0.15, false);
    anim('.dev', tMax + 0.15, 0.4, { opacity: [1, 0], x: [0, -60] });
    const tPress = 2.4, tRelease = 4.7, tSend = dictate(api, { said: SAID, tPress, tRelease });
    // Send: the message joins the conversation and the list scrolls it to the top (live offset: the column reflows
    // between full screen and split).
    show('.q2', tSend + 0.15);
    const list = $('.wa-msgs'), anchor = $('.q2');
    fn((t) => {
      const p = Math.max(0, Math.min(1, (t - tSend) / 0.55));
      const y = -(anchor.offsetTop - 22) * (1 - Math.pow(1 - p, 3));
      list.style.transform = `translateY(${y}px)`;
    });
    // Research and thinking, folded into "Worked for" when the proposal lands.
    const tCard = Math.max(say('pb-1', '再起草页面', 0.6), tSend + 3.8), tFold = tCard - 0.7;
    show('.new .rs', tSend + 0.5, 0.3, 8);
    fadeIn('.new .wkc', tFold);
    const thinking = $('.new .wkt');
    fn((t) => {
      const label = t >= tFold ? 'Worked for 42s' : `Thinking${'.'.repeat(1 + (Math.floor(t * 2.5) % 3))}`;
      if (thinking.textContent !== label) thinking.textContent = label;
    });
    stagger('.new .tl', tSend + 0.85, (tFold - 0.4 - (tSend + 0.85)) / (steps.length - 1), 'show');
    anim('.new .ws-steps', tFold, 0.45, { height: [steps.length * 29 - 4, 0], opacity: [1, 0] }, 'inOut');
    show('.new .ans', tCard - 0.35);
    show('.new .rc', tCard);
    cls('.g1', 'hl', tCard + 0.4, tCard + 1.6);
    // Try it: the Workspace Browser opens on wms-web with the Draft preview; the app switcher shows Web.
    const tTry = Math.max(E('pb-1', 0.9), tCard + 1.6), tM = tTry + 0.45;
    text('.new .wac-run', tTry + 0.15, `${icon('monitor', 15, 'var(--secondary)')} Opening the Draft preview in the Workspace Browser · Web`);
    morph(anim, tM, true);
    text('.appic', tM, `${icon('laptop', 18, 'var(--strong)')}${icon('chevronDown', 13, '#707070')}`);
    anim('.webv', tM + 0.25, MORPH, { opacity: [0, 1], x: [-80, 0] }, 'out');
    text('.new .wac-run', tM + MORPH + 0.3, `${icon('monitor', 15, 'var(--secondary)')} Draft v1 previewing in wms-web · real data`);
    // pb-2: the Draft is only for page authors; publishing computes the permissions from every call the page makes.
    const tDraft = say('pb-2', '草稿');
    cls('.dbn', 'hl', tDraft, tDraft + 3.0);
    cls('.g4', 'hl', tDraft, tDraft + 3.0);
    const p0 = say('pb-2', '发布时', -0.4);
    anim('.mbg', p0 + 0.3, 0.25, { opacity: [0, 1] });
    anim('.modal', p0 + 0.3, 0.35, { opacity: [0, 1], scale: [0.96, 1] });
    stagger('.pm', p0 + 1.2, 0.55, 'fadeIn');
    const p1 = Math.min(p0 + 5.4, E('pb-2', -1.0));
    anim('.mbg', p1 + 0.3, 0.25, { opacity: 0 });
    anim('.modal', p1 + 0.3, 0.25, { opacity: 0 });
    text('.dpill', p1 + 0.4, 'Published');
    cls('.dpill', 'success', p1 + 0.4); cls('.dpill', 'warning', 0, p1 + 0.4);
    text('.dtext', p1 + 0.4, 'Published v1 — listed under Custom Apps for every facility of the tenant.');
    hide('.webv .pub', p1 + 0.4, 0.2);
    text('.new .wac-badge', p1 + 0.4, 'Published v1');
    cls('.new .wac-badge', 'success', p1 + 0.4); cls('.new .wac-badge', 'warning', 0, p1 + 0.4);
    text('.new .wac-h .t', p1 + 0.4, 'Damaged Inventory Relocation · v1');
    text('.cpub', p1 + 0.4, 'Published');
    cls('.cpub, .ctry', 'off', p1 + 0.4);
    text('.new .wac-run', p1 + 0.4, okRun('Published v1 · Custom Apps · damaged-inventory-relocation'));
    pointer([[0.3, 1500, 300], [tMax, '.mx', null, true], [tMax + 0.5, '.mx', [-40, 30]],
      ...dictateKeys(tPress, tRelease, tSend),
      [tTry - 0.9, '.ctry', [60, 40]], [tTry, '.ctry', null, true], [tTry + 0.6, '.ctry'],
      [p0 - 1.0, '.webv .pub', [-60, 40]], [p0, '.webv .pub', null, true], [p0 + 0.5, '.webv .pub'],
      [p1 - 1.0, '.mpub', [-80, 40]], [p1, '.mpub', null, true], [p1 + 0.6, '.mpub']], { atKey: true });
  });

  Scene('s14-page-use', { title: '工作台派工', tag: '示意画面 · 页面定义来自本地 PDEF-101', tagKind: 'sim' }, ({ root, S, E, show, pop, stagger, anim, fadeIn, text, cls, hide, pointer, type }) => {
    root.innerHTML = `
      <div style="position:absolute;inset:0">${relocationPage({ width: 1920 })}</div>
      <div class="req card" style="position:absolute;left:22px;top:560px;width:1150px;padding:0;overflow:hidden;box-shadow:0 18px 50px rgba(31,41,51,.18)">
        <div style="padding:12px 20px;background:var(--section);font-weight:700;font-size:16px;display:flex;gap:10px;align-items:center">${icon('send', 17, 'var(--primary)')} 页面以 Emily Carter 本人身份直接调用 WMS</div>
        <div class="mono" style="padding:14px 20px;font-size:15px;line-height:1.75">
          <div><b style="color:var(--primary)">POST</b> /ops/genui-task-type/<span style="color:var(--primary)">{{taskType.move-damage}}</span>/tasks <span style="color:var(--muted)">→ TDEF-151</span></div>
          <div style="color:var(--secondary)">Authorization: Bearer ‹Emily Carter› · Idempotency-Key: 7f3c…e1</div>
          <div style="color:var(--secondary)">fdnwms-screen-id: <b style="color:var(--primary)">page:damaged-inventory-relocation@v1</b></div>
          <div>{ lines.moves: [CLP-1005744 · 12 EA, CLP-1005745 · 20 EA], inventoryIssueIds: [ISSUE-106, ISSUE-107], assignee: Maria Garcia }</div>
        </div>
        <div class="resp" style="padding:12px 20px;border-top:1px solid var(--line);display:flex;gap:12px;align-items:center;font-size:16px">
          <span class="pill success">201 Created</span><b class="mono">TASK-18652</b> · Move Damage · Maria Garcia
          <span style="margin-left:auto" class="pill info">ISSUE-106 · ISSUE-107 → In Progress</span>
        </div>
      </div>`;
    const p = S('pu-1', 4.2);
    pointer([[p - 1.2, 900, 600], [p, '.cb0', null, true], [p + 0.9, '.cb1', null, true], [p + 1.6, '.cb1']]);
    cls('.ir0', 'sel', p); cls('.ir1', 'sel', p + 0.9);
    const w = p + 2.6;
    pointer([[w - 0.6, 1500, 420], [w, '.wk', null, true], [w + 1.9, '.dd', [0, -18], true], [w + 2.6, '.dd', [0, -18]]]);
    type('.wkv', w + 0.4, 'Mar', 8, w + 1.95);
    anim('.dd', w + 0.9, 0.2, { opacity: [0, 1] });
    anim('.dd', w + 1.95, 0.15, { opacity: 0 });
    text('.wkv', w + 1.95, 'Maria Garcia');
    cls('.wk', 'filled', w + 1.95);
    const t = w + 3.0;
    text('.ttv', t, '');
    type('.ttv', t + 0.3, 'Move Damage · Aisle A12', 20);
    cls('.ttl', 'filled', t);
    const c = S('pu-1', 12.4);
    // Ticked when clicked, cleared when the table refreshes after Create.
    cls('.cb0', 'on', p, c + 1.4); cls('.cb1', 'on', p + 0.9, c + 1.4);
    pointer([[c - 1.0, 1700, 520], [c, '.crt', null, true], [c + 0.8, '.crt']]);
    anim('.wtoast', c + 0.7, 0.3, { opacity: [0, 1], y: [-10, 0] });
    anim('.wtoast', c + 5, 0.3, { opacity: 0 });
    // The table refreshes: both issues moved to In Progress and leave the Open list.
    hide('.ir0, .ir1', c + 1.4, 0.4); cls('.ir0, .ir1', 'gone', c + 1.8);
    text('.tot', c + 1.4, 'Total 1 record');
    show('.req', S('pu-2', 0.6), 0.5);
    anim('.resp', S('pu-2', 5.0), 0.4, { opacity: [0, 1] });
  });

  // The Move Damage type is built in the Agent Workspace, shown in a browser window. It opens full screen (sidebar +
  // centred conversation, as AgentChatPanel isMaximized): Emily types the request, the Agent researches, thinks and
  // proposes the draft (draft_genui_task_type) as a review card. Try it opens the Workspace Browser on the mobile app:
  // the layout morphs into split view and the trial task is already open on the phone. Publish then makes v1.
  // (Mobile users can build it the same way from the handheld's own Agent.)
  Scene('s15-type-build', { title: '构建 Move Damage', tag: '示意画面 · 类型定义来自本地 TDEF-151', tagKind: 'sim' }, (api) => {
    const { root, segs, S, show, stagger, anim, fadeIn, text, cls, hide, pointer, fn, $ } = api;
    const say = (seg, phrase, delta = 0) => {
      const g = segs[seg];
      if (!g) return delta;
      return g.start + (g.end - g.start) * (Math.max(0, g.text.indexOf(phrase)) / g.text.length) + delta;
    };
    const SAID = MD_SAID;
    root.innerHTML = workspace({ title: 'New conversation', msgs: moveDamageTurn(), pane: `<div class="dev">${trialDevice()}</div>`, empty: true, activeShown: false });

    // tb-1 · full screen: Emily dictates the request (hold the mic) and sends it as the narration names Emily.
    const tAsk = say('tb-1', 'Emily');
    const tPress = 0.8, tRelease = tAsk - 1.35;
    dictate(api, { said: SAID, tPress, tRelease });
    hide('.aws-empty', tAsk, 0.3);
    show('.q', tAsk + 0.1);
    anim('.wa-title', tAsk + 0.9, 0.15, { opacity: [1, 0.2] });
    text('.wa-title', tAsk + 1.05, 'Move Damage 任务类型');
    anim('.wa-title', tAsk + 1.05, 0.3, { opacity: 1 });
    fadeIn('.cvnew', tAsk + 1.05);
    // The Agent researches and thinks ("Thinking" ticks), then folds the steps into "Worked for" when it answers.
    const tCard = say('tb-1', '它只用了', -1.2);
    const tFold = tCard - 0.7;
    show('.rs', tAsk + 0.5, 0.3, 8);
    fadeIn('.wkc', tFold);
    const thinking = $('.wkt');
    fn((t) => {
      const label = t >= tFold ? 'Worked for 41s' : `Thinking${'.'.repeat(1 + (Math.floor(t * 2.5) % 3))}`;
      if (thinking.textContent !== label) thinking.textContent = label;
    });
    stagger('.tl', tAsk + 0.9, (tFold - 0.5 - (tAsk + 0.9)) / 4, 'show');
    anim('.ws-steps', tFold, 0.45, { height: [141, 0], opacity: [1, 0] }, 'inOut');
    show('.ans', tCard - 0.35);
    show('.rc', tCard);
    const tRow2 = say('tb-1', '搬运行'), tRow3 = say('tb-1', '货况'), tRow4 = say('tb-1', '不写死');
    cls('.r1', 'hl', say('tb-1', 'composable'), tRow2);
    cls('.r2', 'hl', tRow2, tRow3);
    cls('.r3', 'hl', tRow3, tRow4);
    cls('.r4', 'hl', tRow4, S('tb-2', 4.0));
    // tb-2: the destination resolves through the put-away mapping.
    anim('.map', S('tb-2', 0.4), 0.4, { opacity: [0, 1] });
    // Try it: the Workspace Browser opens on Mobile. The sidebar gives way, the browser pane grows from the left
    // and the conversation docks on the right with the compact header; the phone is already on the trial task.
    const tTry = S('tb-2', 4.4), tM = tTry + 0.45;
    text('.wac-run', tTry + 0.15, `${icon('smartphone', 15, 'var(--secondary)')} Opening trial TASK-18649 in the Workspace Browser · Mobile`);
    morph(anim, tM, true);
    anim('.dev', tM + 0.25, MORPH, { opacity: [0, 1], x: [-80, 0] }, 'out');
    const tStep = tM + MORPH + 0.5;
    text('.wac-run', tStep - 0.2, `${icon('smartphone', 15, 'var(--secondary)')} Trial TASK-18649 running on Mobile`);
    // Emily runs the trial once, phase by phase: Take (location, item, Qty · To LPN), then Place at the suggestion.
    anim('.trun', tStep + 0.3, 0.4, { x: [400, 0] }, 'inOut');
    const ok = (box, value, when) => { text(`${box} .v`, when, value); cls(box, 'ok', when); };
    ok('.mt-loc', 'A12-03-1', tStep + 0.8); cls('.trun .ph1', 'done', tStep + 0.8); cls('.trun .ph2', 'on', tStep + 0.8);
    ok('.mt-item', 'NB-BAT57-3C', tStep + 1.15); fadeIn('.mt-ihint', tStep + 1.2, 0.2);
    cls('.trun .ph2', 'done', tStep + 1.15); cls('.trun .ph3', 'on', tStep + 1.15);
    text('.mt-qty', tStep + 1.45, '6');
    ok('.mt-to', 'CLP-1005799', tStep + 1.75);
    anim('.trun2', tStep + 2.25, 0.4, { x: [400, 0] }, 'inOut');
    ok('.mp-held', 'CLP-1005799', tStep + 2.7); cls('.trun2 .ph1', 'done', tStep + 2.7); cls('.trun2 .ph2', 'on', tStep + 2.7);
    ok('.mp-dest', 'DMG-01', tStep + 3.0); cls('.trun2 .ph2', 'done', tStep + 3.0);
    const tBack = tStep + 3.5;
    anim('.trun, .trun2', tBack, 0.4, { x: 400 }, 'inOut');
    text('.tst', tStep + 0.3, 'In Progress');
    text('.tst', tBack, 'Closed');
    text('.tln', tBack, '1/1 Lines');
    text('.tsp', tBack, '1/1 steps');
    show('.tdone', tBack + 0.3);
    text('.wac-run', tBack + 0.3, `${icon('checkCircle', 15, 'var(--success)')} Trial TASK-18649 closed · 6 EA placed at DMG-01`);
    // Publish: v1 goes live.
    const tPub = Math.max(S('tb-2', 10.0), tBack + 1.0);
    pointer([[0.2, 1500, 760], ...dictateKeys(tPress, tRelease, tAsk), [tTry - 1.2, 1500, 760], [tTry, '.try', null, true], [tStep - 0.25, '.tstep', [-60, 0]], [tStep, '.tstep', [-60, 0], true], [tStep + 0.6, '.tstep', [-60, 0]],
      [tPub - 0.9, '.pub', [0, -60]], [tPub, '.pub', null, true], [tPub + 0.6, '.pub']], { atKey: true });
    text('.wac-badge', tPub + 0.4, 'Published v1');
    cls('.wac-badge', 'success', tPub + 0.4); cls('.wac-badge', 'warning', 0, tPub + 0.4);
    text('.wac-h .t', tPub + 0.4, 'Move Damage · v1');
    text('.pub', tPub + 0.4, 'Published');
    cls('.pub, .try', 'off', tPub + 0.4);
    text('.wac-run', tPub + 0.4, `${icon('checkCircle', 15, 'var(--success)')} Published Move Damage v1 · pages can start it as {{taskType.move-damage}}`);
  });
})();
