"""Build the customer-facing demo from the R5 Day 1 presentation sources."""
import json
import re
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory

from bs4 import BeautifulSoup

import build_site

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
DECK = "Item_General_Demo.html"
NOTES = "Item_General_Demo.md"
OMIT = {
    "r4_partnership_compass", "d51_joint_roles", "d50_accelerator",
    "r4_day1_inputs",
}
CHAPTERS = [
    ("演示总览", "Overview"),
    ("ITEM 与企业 AI 平台", "ITEM and the enterprise AI platform"),
    ("业务案例", "Business use cases"),
    ("平台架构与核心能力", "Platform and capabilities"),
    ("落地与验收", "Delivery and acceptance"),
    ("从试点到规模化", "Pilot to scale"),
]


def customer_copy(text, english=False):
    for before, after in (
        ("ITEM × COO AI Team × ISS Biz (team)", "ITEM · Enterprise AI"),
        ("ISS Biz (team) × COO AI Team", "ITEM · Enterprise AI"),
        ("ISS AI Native", "ITEM Enterprise AI"),
        ("ISS 对标", "客户场景对照"),
        ("ISS对标", "客户场景对照"),
        ("ISS benchmark", "Customer scenario comparison"),
        ("ISS Biz", "Customer business team" if english else "客户业务团队"),
        ("COO AI Team / Hollis", "Customer technical team" if english else "客户技术团队"),
        ("COO AI Team Hollis", "Enterprise AI" if english else "企业 AI"),
        ("Tom 主持讨论；", ""),
        ("Tom 主持；", ""),
        ("Tom 主持确认", "由业务负责人确认"),
        ("COO AI Team/Hollis", "Customer technical team" if english else "客户技术团队"),
        ("COO AI / Hollis", "Enterprise AI" if english else "企业 AI"),
        ("COO AI Team", "Customer technical team" if english else "客户技术团队"),
        ("ISS", "customer" if english else "客户"),
        ("UKM/WIKI", "Knowledge base / Wiki" if english else "知识库 / Wiki"),
    ):
        text = text.replace(before, after)
    return text


def intro_slide(kicker, title, subtitle, points):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
.slide-container{{background:#f6f7f9;color:#152439;padding:56px;min-height:600px;box-sizing:border-box}}
.kicker{{color:#007f86;text-transform:uppercase;letter-spacing:.1em}}
h1{{font-size:48px;line-height:1.15;margin:24px 0}}p{{font-size:22px;max-width:880px}}
ol{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 44px;margin:35px 0;padding-left:30px}}
li{{font-size:20px;padding:12px;border-top:2px solid #007f86}}
li strong{{display:inline-block;margin-bottom:8px}}
@media(max-width:700px){{.slide-container{{padding:24px}}h1{{font-size:34px}}ol{{grid-template-columns:1fr}}}}
</style></head><body><div class="slide-container"><div class="page-inner">
<div class="kicker">{kicker}</div><h1><span class="zh">{title[0]}</span><span class="en">{title[1]}</span></h1>
<p><span class="zh">{subtitle[0]}</span><span class="en">{subtitle[1]}</span></p>
<ol>{''.join(f'<li><span class="zh">{zh}</span><span class="en">{en}</span></li>' for zh, en in points)}</ol>
</div></div></body></html>"""


def split_port_demo(native, pages):
    page_id = "r5_c01_01"
    video_id = "r5_c01_video"
    index = next(i for i, page in enumerate(pages) if page["id"] == page_id)
    pages.insert(index, dict(pages[index], id=video_id))
    path = native / f"{page_id}.html"
    content = BeautifulSoup(path.read_text(), "html.parser")
    player = content.select_one(".video-slot").extract()
    content.style.append("""
.content,html[data-lang=en] .content{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:auto;align-items:stretch;gap:24px!important}
.content>.block{grid-column:auto;grid-row:auto;min-width:0;padding:16px 18px!important}
.content>.block li{line-height:1.42!important;margin-bottom:7px!important}
.content>.block .note{margin-top:12px!important;padding-top:10px;border-top:1px solid var(--line,#d8e1ea)}
html[data-lang=en] h1{max-width:28em;text-wrap:balance}
""")
    path.write_text(str(content))

    video = BeautifulSoup(intro_slide(
        "PORT DRAYAGE · DEMO",
        ("码头集装箱运输演示", "Port drayage demo"),
        ("先看 Agent 如何接手重复操作、辅助调度，再拆解流程与试点切入点。",
         "See how agents handle repetitive work and support dispatch before exploring the workflow and pilot scope."),
        [],
    ), "html.parser")
    video.ol.replace_with(player)
    video.style.append("""
.slide-container{min-height:0;padding:20px 24px}
h1{font-size:34px;margin:8px 0}p{font-size:17px;margin:0 0 10px}
.video-slot{width:100%;margin:0;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
.video-head,.video-foot{display:none}
.video-slot video{display:block;width:100%;height:auto;max-height:none;aspect-ratio:16/9;object-fit:contain;margin:0;background:transparent;border-radius:6px}
""")
    (native / f"{video_id}.html").write_text(str(video))


def split_wms_demo(native, pages):
    page_id = "r5_c02_01"
    video_id = "r5_c02_video"
    index = next(i for i, page in enumerate(pages) if page["id"] == page_id)
    pages.insert(index, dict(pages[index], id=video_id))
    path = native / f"{page_id}.html"
    source = path.read_text()
    demo = BeautifulSoup(source, "html.parser")
    demo.select_one("main > .block").decompose()
    demo.select_one("h1 .zh").string = "WMS 动态表单演示"
    demo.select_one("h1 .en").string = "WMS Dynamic Forms demo"
    demo.select_one(".lead .zh").string = "用一箱破损电池的案例，看现场需求如何从提出走到试用、修改和审核上线。"
    demo.select_one(".lead .en").string = "Follow a damaged-battery case from request through trial, revision and approval."
    demo.style.append("""
.content{grid-template-columns:minmax(0,1fr);padding-top:12px}
.video-slot{width:100%;max-width:none;margin:0;padding:0!important;box-sizing:border-box;background:transparent!important;border:0!important;box-shadow:none!important}
.video-head,.video-title,.video-foot{display:none!important}
.video-slot .player-frame{border:0!important;box-shadow:none!important}
.video-slot video{width:100%;height:auto;max-height:none;aspect-ratio:16/9;object-fit:contain;margin:0;border-radius:6px}
""")
    (native / f"{video_id}.html").write_text(str(demo))

    content = BeautifulSoup(source, "html.parser")
    content.select_one(".video-slot").decompose()
    content.select_one("h1 .zh").string = "WMS 动态表单：现场需求如何从提出到上线"
    content.select_one("h1 .en").string = "WMS Dynamic Forms: from request to release"
    content.style.append("""
.content{grid-template-columns:minmax(0,1fr)}
.content>.block{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:stretch}
.content>.block>.grp{margin:0;padding:18px;border:1px solid var(--line,#d8e1ea);border-radius:14px}
.content>.block>.outcome-strip{grid-column:1/-1}
""")
    path.write_text(str(content))


VISION_LAYERS = [
    ("数字孪生 · 3D 态势视图", "Digital twin and 3D site view",
     "按园区边界复刻 3D 场景，实时标出设备、机器人和告警位置。点击点位可定位到现场，查看详情与实时画面。",
     "Model the site within its facility boundaries. Locate devices, robots and alerts in real time, then select a point to see details or live footage.", []),
    ("IoT 图层 · 六类对象统一上屏", "IoT layer · Six object types on one map",
     "", "", [
         ("摄像头", "Cameras", "位置、状态、实时预览", "Location, status, live preview"),
         ("机器人", "Robots", "位置、轨迹、运行状态", "Location, route, operating status"),
         ("告警", "Alerts", "点位高亮、告警详情", "Highlighted location, alert details"),
         ("门禁道闸", "Gates", "道闸点位、通行事件", "Gate location, access events"),
         ("传感器", "Sensors", "点位与状态", "Location and readings"),
         ("堆场点位", "Yard spots", "占用状态、识别结果", "Occupancy, recognition results"),
     ]),
    ("AI 工具层 · 按工具定义扩展", "AI tool layer · Extend capabilities through tool definitions",
     "将操作定义为语音或 Agent 可调用的工具。扩展查询或分析功能时，可复用现有视图和对象图层。",
     "Expose operations as tools that voice interfaces or agents can call. New queries and analyses can reuse the existing view and object layers.", [
         ("设备查询与定位", "Device lookup and location", "", ""),
         ("告警与通行查询", "Alert and gate event lookup", "", ""),
         ("风险分析与运营汇总", "Risk analysis and operations summaries", "", ""),
     ]),
    ("实时底座", "Real-time services",
     "WebSocket 推送设备位置、状态和告警。OpenAI Realtime 与 Function Calling 将语音请求连接到工具和图层。",
     "WebSocket streams device locations, status and alerts. OpenAI Realtime and function calling connect voice requests to tools and map layers.", []),
]


VISION_VOICE_COMMANDS = [
    ("打开 Spot 72 摄像头", "Open the camera at Spot 72",
     "地图定位到点位并打开实时预览。", "The map centres on the spot and opens the live feed."),
    ("查看 1 号道闸", "Show Gate 1",
     "查看道闸画面和历史通行记录。", "View gate camera feeds and access history."),
    ("机器人现在在哪", "Where is the robot now?",
     "地图定位到机器人，显示位置和运行状态。", "The map centres on the robot and shows its location and status."),
    ("今天有什么告警", "What alerts have we had today?",
     "语音播报告警摘要，并打开告警面板。", "The assistant reads out an alert summary and opens the alert panel."),
]

VISION_VOICE_BRIEFINGS = [
    ("异常风险", "Incident risk",
     "结合现场画面与业务数据，播报异常情况、风险等级和判断依据。",
     "Use footage and business data to report the incident, risk level and supporting evidence."),
    ("运营情况", "Operations",
     "按需汇总告警类型与频次、道闸车流与通行记录、堆位占用与空余。",
     "Summarise alert types and frequency, gate traffic and access records, and occupied or available yard spots."),
]

VISION_RESPONSE_NOTE = (
    "GEV 案例中，异常响应时间从约 3–5 分钟缩短到 30 秒以内。试点时先明确从何时开始计时、到哪一步结束，再用现场样本验证。",
    "In the GEV case, incident response time fell from about 3–5 minutes to under 30 seconds. For the pilot, agree on when timing starts and ends, then test with samples from the site.",
)


VISION_SLIDES = [
    ("vision_ai_demo", "Vision AI：从园区全景到一线作业", "Vision AI: from site overview to frontline operations",
     "先看园区地图上的车辆和堆位，再用录像复核验车和打包，最后看智能眼镜识物、摄像头采集寄件信息。",
     "Start with vehicles and yard spots on the site map, then review truck checks and packing on video. See how smart glasses identify objects and how a camera captures shipping details.", []),
    ("vision_ai_scenarios", "从一个工位到整个园区", "From a single workstation to the whole site",
     "现场画面可以用来采集作业信息、复核操作过程，也可以与园区地图联动，帮助值班人员找到异常证据。",
     "Use visual inputs to capture work details, review how tasks were done and find incident evidence on the site map.", [
         ("<strong>一线识别与取数</strong><br>Glasses 从第一视角识别物品。寄件应用从画面读取地址、估算箱体尺寸，并读取秤面重量。",
          "<strong>Frontline recognition and data capture</strong><br>Glasses identifies objects from the wearer’s viewpoint. The shipping app reads the address, estimates box dimensions and reads the scale."),
         ("<strong>作业记录与复核</strong><br>对照车辆安全检查的时间线与现场视频，或按订单核对打包、扫描和封箱记录。",
          "<strong>Work records and review</strong><br>Compare truck safety checks with video and a timeline, or review packing, scanning and sealing records for an order."),
         ("<strong>园区状态与异常定位</strong><br>在 GEV 3D 地图上查看堆位、道闸和设备。发生告警时，按时间与点位调出现场画面。",
          "<strong>Site status and incident lookup</strong><br>See yard spots, gates and devices on the GEV 3D map. When an alert occurs, use its time and location to retrieve footage."),
     ]),
    ("vision_ai_workflow", "一次月台告警如何处理", "How a loading dock alert is handled",
     "从园区监控选一个月台告警，跟着值班人员找到画面、核对证据并决定如何处置。",
     "Take one loading dock alert from the site view and follow the operator as they find footage, check the evidence and decide how to respond.", [
         ("<strong>识别与定位</strong><br>把视频识别到的异常关联到月台点位，在 3D 视图中定位。", "<strong>Detect and locate</strong><br>Link the detected incident to the loading dock and locate it in the 3D view."),
         ("<strong>调取现场证据</strong><br>在地图上打开关联摄像头，或问「今天有什么告警」，再从告警面板查看现场画面。", "<strong>Retrieve evidence</strong><br>Open the linked camera from the map, or ask “What alerts have we had today?” and review the footage from the alert panel."),
         ("<strong>汇总风险与建议</strong><br>Agent 综合位置、时间、画面和业务数据，给出处置建议。", "<strong>Summarise risks and options</strong><br>The agent combines location, time, footage and business data to suggest a response."),
         ("<strong>人工确认</strong><br>值班人员核验证据并决定处置，复盘时保留判断依据。", "<strong>Human confirmation</strong><br>Operators check the evidence, decide how to respond and retain the basis for review."),
     ]),
    ("vision_ai_value", "GEV 为园区运营带来的四项价值", "Four operational benefits of GEV",
     "一张 3D 视图汇集现场画面、设备状态与告警，帮助值班人员更快找到证据和处理异常。",
     "One 3D view brings together live footage, device status and alerts so operators can find evidence and respond sooner.", [
         ("<strong>响应更快</strong><br>告警自动定位并打开关联画面，值班人员少切换系统，能更快确认现场。",
          "<strong>Faster response</strong><br>Alerts locate the incident and open the relevant footage, so operators spend less time switching systems and can verify the scene sooner."),
         ("<strong>巡检更省</strong><br>机器人巡检轨迹和识别结果同步上图，箱号与堆位可一起查看，减少逐项核对。",
          "<strong>Less manual inspection</strong><br>Robot routes and detections appear on the map. Operators can check container IDs alongside their yard spots, reducing manual checks."),
         ("<strong>状态更全</strong><br>同屏查看堆位占用、设备在线状态和道闸通行记录，高亮异常点位。",
          "<strong>A fuller view of yard status</strong><br>See spot occupancy, device availability and gate records together, with affected locations highlighted."),
         ("<strong>判断有据</strong><br>AI 汇总风险等级、告警、通行和占用情况，并附上建议依据，由值班人员最终确认。",
          "<strong>Decisions backed by evidence</strong><br>AI summarises risk levels, alerts, gate movements and occupancy. Operators review the evidence behind the suggested response and make the final call."),
     ]),
    ("vision_ai_pilot", "从一个可验收的园区场景开始", "Start with one measurable yard workflow",
     "先选一个月台和一种告警。用同一批录像比较人工查找和 GEV 联动定位，再决定是否扩大范围。",
     "Start with one loading dock and one alert type. Use the same footage to compare manual search with GEV-assisted lookup before expanding.", [
         ("<strong>定义任务</strong><br>明确告警类型、对应摄像头和值班负责人。", "<strong>Define the task</strong><br>Agree on the alert type, camera and operator responsible for responding."),
         ("<strong>用本体连接现场对象</strong><br>关联授权摄像头、月台点位和告警记录，明确谁能查看录像。", "<strong>Connect site objects through an ontology</strong><br>Link authorised cameras, dock locations and alert records, and agree on who can view the footage."),
         ("<strong>设定验收指标</strong><br>用正常和异常样本检查定位耗时、识别准确率和误报。", "<strong>Set acceptance measures</strong><br>Use normal and exceptional samples to check location time, recognition accuracy and false alerts."),
         ("<strong>人工接管与规则复盘</strong><br>证据不足或风险较高时由人员接管。用同一批样本比较调整前后的结果与人工投入，再由业务确认规则更新。", "<strong>Human handoff and rule review</strong><br>Operators take over when evidence is limited or risk is high. Compare results and manual effort on the same samples before and after changes, then have the business approve rule updates."),
     ]),
]


def add_vision_case(native, pages):
    index = next(i for i, page in enumerate(pages) if page["chapter"] == 3)
    for offset, (page_id, zh, en, lead_zh, lead_en, points) in enumerate(VISION_SLIDES):
        ref = f"D1.2.9.{offset + 1}"
        pages.insert(index + offset, dict(id=page_id, title=zh, en=en, chapter=2, day=1,
                                          md=ref, refs=[ref], notes=False, case="c09"))
        slide = intro_slide("Vision AI", (zh, en), (lead_zh, lead_en), points)
        if offset == 0:
            slide = slide.replace("<ol></ol>", (
                '<div class="video-slot"><video controls playsinline preload="metadata" '
                'poster="media/vision-ai/poster.jpg" aria-label="Vision AI 中文演示">'
                '<source src="media/vision-ai/vision-ai-zh.mp4" type="video/mp4"></video></div>'
            )).replace("</style>", ".slide-container{padding:24px;min-height:0}"
                       ".video-slot{padding:0;background:transparent;border:0}"
                       ".video-slot video{width:100%;height:auto;max-height:none;margin:0;aspect-ratio:16/9}</style>")
        if page_id in ("vision_ai_scenarios", "vision_ai_workflow"):
            visuals = {
                "vision_ai_scenarios": ("gev-yard.jpg", "GEV 3D 园区视图与堆位状态", "GEV 3D yard view and spot status"),
                "vision_ai_workflow": ("gev-alert.jpg", "告警详情与关联摄像头画面", "Alert details with linked camera footage"),
            }
            filename, caption_zh, caption_en = visuals[page_id]
            doc = BeautifulSoup(slide, "html.parser")
            layout = doc.new_tag("main", attrs={"class": "vision-layout"})
            doc.ol.replace_with(layout)
            figure = BeautifulSoup(
                f'<figure><img src="media/vision-ai/{filename}" alt="{caption_zh} / {caption_en}">'
                f'<figcaption><span class="zh">{caption_zh}</span>'
                f'<span class="en">{caption_en}</span></figcaption></figure>', "html.parser")
            layout.append(figure)
            items = BeautifulSoup(intro_slide("Vision AI", (zh, en), (lead_zh, lead_en), points), "html.parser").ol
            layout.append(items)
            doc.style.append("""
.slide-container{padding:32px 42px}
h1{font-size:39px;margin:14px 0}p{font-size:19px;margin:0 0 18px;max-width:none}
.vision-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:24px;align-items:start}
.vision-layout figure{margin:0;background:#101923;color:#e7f0f4;padding:10px;border-radius:12px}
.vision-layout img{display:block;width:100%;height:auto;border-radius:6px}
.vision-layout figcaption{padding:9px 5px 2px;font-size:14px}
.vision-layout ol{display:block;margin:0;padding-left:24px}
.vision-layout li{padding:9px 0;font-size:16px;line-height:1.45;border-top:1px solid #ccd8e1}
.vision-layout li strong{margin-bottom:3px}
""")
            if page_id == "vision_ai_workflow":
                comparison = BeautifulSoup(
                    '<aside class="vision-transition">'
                    '<p><strong class="zh">原流程</strong><strong class="en">Before</strong> '
                    '<span class="zh">收到告警 → 人工找点位 → 切换系统查画面 → 判断处置</span>'
                    '<span class="en">Receive alert → locate manually → open camera feed → decide</span></p>'
                    '<p><strong class="zh">GEV 流程</strong><strong class="en">With GEV</strong> '
                    '<span class="zh">自动定位 → 联动证据 → Agent 汇总 → 人员确认</span>'
                    '<span class="en">Locate automatically → link evidence → agent summarises → operator confirms</span></p>'
                    '</aside>', "html.parser")
                layout.insert_after(comparison)
                doc.style.append("""
.vision-transition{margin-top:14px;padding:10px 14px;border-left:3px solid #007f86;background:#e8f1f4;color:#152439}
.vision-transition p{font-size:15px;margin:4px 0}
.vision-transition strong{margin-right:10px}
""")
            slide = str(doc)
        if page_id == "vision_ai_value":
            response_zh, response_en = VISION_RESPONSE_NOTE
            slide = slide.replace("</ol>", f"""</ol>
<aside class="vision-value-summary">
<p><strong class="zh">值班方式的变化</strong><strong class="en">How the operator’s role changes</strong></p>
<p><span class="zh">AI 感知并汇总现场信息，人员核验证据、处理例外。</span><span class="en">AI detects and summarises events. Operators verify evidence and handle exceptions.</span></p>
<p class="vision-source-note"><span class="zh">{response_zh}</span><span class="en">{response_en}</span></p>
</aside>""").replace("</style>", """
.slide-container{padding:32px 42px}
h1{font-size:40px;margin:14px 0}
p{font-size:19px;max-width:none}
ol{list-style:none;padding:0;margin:24px 0 18px;gap:16px;grid-auto-rows:1fr}
li{box-sizing:border-box;padding:18px 22px;background:var(--paper,#fff);color:var(--ink,#152439);border:1px solid var(--line,#d8e1ea);border-top:3px solid #007f86;border-radius:12px;font-size:18px;line-height:1.4}
li strong{font-size:21px;margin-bottom:7px}
.vision-value-summary{padding:12px 16px;border-left:3px solid #007f86;background:var(--soft,#e8f1f4);color:var(--ink,#152439)}
.vision-value-summary p{margin:2px 0;font-size:16px}
.vision-value-summary .vision-source-note{font-size:14px;margin-top:8px}
</style>""")
        if page_id == "vision_ai_pilot":
            slide = slide.replace("</ol>", """</ol>
<aside class="vision-validation">
<strong class="zh">试点验收示例 · 月台异常回看</strong>
<strong class="en">Pilot acceptance example · Dock incident review</strong>
<p><span class="zh">选同一批已标注的正常和异常片段，对比人工查找与 GEV 联动定位耗时，记录识别命中、误报和漏报，并由值班人员确认是否具备足够证据。</span><span class="en">Use the same labelled normal and incident clips to compare manual search with GEV-assisted lookup. Track correct detections, false alerts and misses, and ask operators whether the evidence is sufficient.</span></p>
</aside>""").replace("</style>", """
.slide-container{padding:36px 42px}h1{font-size:40px}
ol{margin:22px 0;gap:14px 32px}li{font-size:18px}
.vision-validation{padding:16px 20px;background:#e8f1f4;color:#152439;border-left:3px solid #007f86}
.vision-validation p{font-size:17px;margin:6px 0 0;max-width:none}
</style>""")
        (native / f"{page_id}.html").write_text(slide)


def prepare_sources(root):
    source = root / "source"
    source.mkdir()
    native = root / "slides-source" / "detailed"
    native.mkdir(parents=True)
    shutil.copy2(ROOT / "slides-source" / "detailed" / "rate_quote.css", native)
    meta = json.loads((SOURCE / "detailed_manifest.json").read_text())
    meta["version"] = "ITEM Enterprise AI · General Demo"
    meta["chapters"] = [
        dict(id=i, label=f"{i:02}", zh=zh, en=en, day=1)
        for i, (zh, en) in enumerate(CHAPTERS)
    ]
    meta["pages"] = [
        page for page in meta["pages"]
        if (page["day"] == 1 or page["id"] == "r4_cover") and page["id"] not in OMIT
        and not re.match(r"^D1\.2\.9(?:\.|$)", page["md"])
    ]
    for page in meta["pages"]:
        page.update(day=1, notes=False)
        intro_refs = {"r4_cover": "D1.0", "r4_day1_agenda": "D1.0.1"}
        if page["id"] in intro_refs:
            ref = intro_refs[page["id"]]
            page.update(md=ref, refs=[ref])
        path = Path(page["id"] + ".html")
        doc = BeautifulSoup((ROOT / "slides-source" / "detailed" / path).read_text(), "html.parser")
        for node in list(doc.find_all(string=True)):
            if node.parent.name not in {"style", "script"}:
                node.replace_with(customer_copy(str(node), english=node.find_parent(class_="en") is not None))
        if page["id"] == "r5_case_overview":
            card = doc.find("span", class_="num", string="09").find_parent("section")
            card.select_one("h2 .zh").string = "Vision AI｜园区视觉与 IoT"
            card.select_one("h2 .en").string = "Vision AI | Yard vision and IoT"
            card.select_one("p .zh").string = "从眼镜识物、寄件取数和作业复核，到用 3D 园区视图定位异常。"
            card.select_one("p .en").string = "See object recognition, shipping data capture and work review, then locate incidents in a 3D site view."
            doc.select_one("h1 .zh").string = "九个业务案例：从结果倒推可重复交付"
            doc.select_one("h1 .en").string = "Nine business cases: from outcomes to repeatable delivery"
            lead = doc.select_one(".lead")
            lead.select_one(".zh").string = "按客户关注的业务流程选讲案例。每个案例讲清任务怎么做、AI 帮在哪一步，以及如何验证结果。"
            lead.select_one(".en").string = "Choose cases that match the customer’s workflows. Each case shows how the task works, where AI helps and how to verify the outcome."
            discussion = doc.select_one(".discussion")
            discussion.select_one("b.zh").string = "讨论重点"
            discussion.select_one("b.en").string = "Discussion"
            discussion.select_one("span.zh").string = "哪些环节在你的流程中也会出现？哪些已有能力可以复用？"
            discussion.select_one("span.en").string = "Which steps also occur in your workflow? Which existing capabilities can you reuse?"
        if page["id"] == "r5_platform_architecture":
            lead = doc.select_one(".lead")
            lead.select_one(".zh").string = "案例中的知识查询、现场事件和受控操作可复用同一套平台能力。中间五层提供核心产品，上下两层连接客户已有基础设施和业务系统。"
            lead.select_one(".en").string = "The cases share platform capabilities for knowledge retrieval, field events and controlled actions. Five core product layers connect to the customer’s infrastructure and business systems through two integration layers."
        if page["id"] == "r5_delivery_boundaries":
            lead = doc.select_one(".lead")
            lead.select_one(".zh").string = "从案例中找出可复用的能力，确认它们能否接入客户流程，并用业务结果验证试点。"
            lead.select_one(".en").string = "Identify capabilities to reuse from the cases, check how they fit the customer’s workflow, and verify the pilot against business outcomes."
        if page["id"] == "r5_implementation_overview":
            lead = doc.select_one(".lead")
            lead.select_one(".zh").string = "先选定要改善的业务流程、使用者和结果，再识别可跨流程复用的能力。两者结合确定首个试点任务和负责人。"
            lead.select_one(".en").string = "Choose the workflow, users and outcome first, then identify capabilities that can serve multiple workflows. Together, these define the first pilot task and its owner."
        if page["id"] == "r5_c04_01":
            player = doc.new_tag("video", controls="", playsinline="", preload="metadata")
            player["poster"] = "media/bo/bo-zh-poster.jpg"
            player["aria-label"] = "BO 中文演示"
            player.append(doc.new_tag("source", src="media/bo/bo-zh.mp4", type="video/mp4"))
            doc.select_one(".video-stage iframe").replace_with(player)
            doc.select_one(".video-link").decompose()
            doc.style.append("""
.video-stage video{display:block;width:100%;height:100%;object-fit:contain}
""")
        if page["id"] == "r5_c06_04":
            doc.style.append("""
.content{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:1fr;gap:16px;align-items:stretch}
.content>.block{min-width:0;padding:16px 20px;background:var(--paper,#fff);border:1px solid var(--line,#d8e1ea);border-radius:12px}
.content>.block h2{margin:0 0 10px;font-size:21px;line-height:1.2}
.content>.block ul{margin:0;padding-left:20px}
.content>.block li{font-size:16px;line-height:1.4;margin-bottom:6px}
.content>.block li:last-child{margin-bottom:0}
""")
        (native / path).write_text(str(doc))
    split_port_demo(native, meta["pages"])
    split_wms_demo(native, meta["pages"])
    add_vision_case(native, meta["pages"])
    objectives = [
        ("<strong>从业务结果出发</strong><br>看典型场景的流程痛点、改造方式和验证证据。",
         "<strong>Start with business outcomes</strong><br>See workflow pain points, changes and evidence from representative cases."),
        ("<strong>把 AI 接入现有流程</strong><br>看知识、模型、Agent 和业务操作如何协同，以及何时需要人工接管。",
         "<strong>Connect AI to existing workflows</strong><br>See how knowledge, models, agents and actions work together, and when people take over."),
        ("<strong>找到可验收的试点</strong><br>带走一套定义任务、授权边界、验收标准和负责人的方法。",
         "<strong>Identify a measurable pilot</strong><br>Learn how to define the task, permission boundaries, acceptance criteria and owners."),
    ]
    cover = intro_slide(
        "ITEM · GENERAL DEMO", ("ITEM 企业 AI 平台", "ITEM Enterprise AI Platform"),
        ("从真实业务案例看企业 AI 如何落地，以及你的团队可以从哪里开始。",
         "See how enterprise AI works in real workflows and where your team can start."), objectives)
    cover = cover.replace("repeat(2,minmax(0,1fr))", "repeat(3,minmax(0,1fr))")
    cover = cover.replace("margin:35px 0;padding-left:30px", "margin:35px 0;padding:0;list-style:none")
    (native / "r4_cover.html").write_text(cover)

    agenda = [
        ("ITEM 与企业 AI 平台", "ITEM and the enterprise AI platform",
         "了解平台在现有业务系统中的角色。", "Understand the platform's role alongside existing systems."),
        ("业务案例与视频", "Use cases and videos",
         "按客户场景选讲，比较改造前后的流程、结果和人工分工。", "Select relevant cases and compare workflows, outcomes and human roles."),
        ("平台架构与核心能力", "Platform and capabilities",
         "看知识、模型、Agent 和可复用能力如何连接起来。", "See how knowledge, models, agents and reusable capabilities connect."),
        ("落地与验收", "Delivery and acceptance",
         "明确数据与操作权限、人工审批、测试和结果回写。", "Define data and action permissions, approvals, tests and write-back."),
        ("从试点到规模化", "Pilot to scale",
         "确定一个试点任务、所需材料、验收指标和负责人。", "Agree on a pilot task, required inputs, success criteria and owners."),
    ]
    rows = "".join(
        f'<tr><td>{i:02}</td><th scope="row"><span class="zh">{zh}</span><span class="en">{en}</span></th>'
        f'<td><span class="zh">{out_zh}</span><span class="en">{out_en}</span></td></tr>'
        for i, (zh, en, out_zh, out_en) in enumerate(agenda, start=1)
    )
    table = ('<table aria-label="Demo agenda"><thead><tr>'
             '<th scope="col"><span class="zh">顺序</span><span class="en">Order</span></th>'
             '<th scope="col"><span class="zh">主题</span><span class="en">Topic</span></th>'
             '<th scope="col"><span class="zh">本段看点</span><span class="en">What you will see</span></th>'
             f'</tr></thead><tbody>{rows}</tbody></table>')
    route = intro_slide(
        "DEMO AGENDA", ("演示议程", "Demo agenda"),
        ("先按客户关注的流程选讲案例，接着看哪些能力可以复用，最后讨论试点范围和验收标准。",
         "Select cases that fit the customer’s workflows, then identify reusable capabilities and agree on a pilot scope and acceptance criteria."), [])
    route = route.replace("<ol></ol>", table).replace(
        "</style>", "table{width:100%;border-collapse:collapse;margin-top:28px;font-size:18px}"
        "th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #ccd8e1}"
        "thead th,td:first-child{color:#007f86}tbody th{width:32%}</style>")
    (native / "r4_day1_agenda.html").write_text(route)
    (native / "r4_day1_fields.html").write_text(intro_slide(
        "START A PILOT", ("从一个可验收的流程开始", "Start with one measurable workflow"),
        ("选定一个真实任务，与业务和技术团队确认试点范围。",
         "Select a real task and agree on the pilot scope with business and technical teams."),
        [("任务：明确用户、流程和期望结果", "Task: name the users, workflow and desired outcome"),
         ("材料：准备授权样本和现有规则", "Inputs: prepare authorised samples and existing rules"),
         ("验收：设定基线、通过条件和人工接管", "Acceptance: set the baseline, pass criteria and human handoff"),
         ("责任：确认负责人、系统边界和下一次评审", "Ownership: confirm owners, system boundaries and the next review")]))
    original = (ROOT / build_site.MD_NAME).read_text()
    day = original[original.index("### D1.1."):original.index("### D1.5.")]
    day = re.sub(r"(?ms)^#### D1\.1\.3 .*?(?=^### D1\.2)", """#### D1.1.3 客户接入方式

从现有流程出发，由业务团队确认任务与验收标准，技术团队核对系统接口、权限和部署边界，ITEM 负责平台配置、集成与验证。

""", day)
    day = re.sub(r"(?m)^### D1\.([1-4])\. (.*?)｜.*$", r"### D1.\1 \2", day)
    day = re.sub(r"(?ms)^#### D1\.2\.9 .*?(?=^### D1\.3)", "", day)
    day = re.sub(r"(?m)^\| 其他踩过的坑 .*\n", "", day)
    vision_notes = "#### D1.2.9 Vision AI｜园区视觉与 IoT\n\n"
    for i, (page_id, zh, _, lead_zh, _, points) in enumerate(VISION_SLIDES, start=1):
        vision_notes += f"##### D1.2.9.{i} {zh}\n\n{lead_zh}\n\n"
        for point, _ in points:
            vision_notes += "- " + BeautifulSoup(point, "html.parser").get_text(" ", strip=True) + "\n"
        if page_id == "vision_ai_demo":
            vision_notes += (
                "**成片导览（约 3 分 05 秒）**\n\n"
                "- 约 00:35–01:05 · 在园区地图上定位摄像头，查看车辆通行和堆位状态。\n"
                "- 约 01:10–02:00 · 按时间线回看验车、按订单复核打包，并按时间和位置查找异常记录。\n"
                "- 约 02:05–02:30 · 随身摄像头记录作业，机器人巡检补充现场画面。\n"
                "- 约 02:35–02:50 · 智能眼镜从第一视角识别物品。寄件应用读取地址、估算箱体尺寸，并读取秤面显示的重量。\n\n"
            )
        if page_id == "vision_ai_scenarios":
            vision_notes += (
                "\n**讲稿补充 · GEV 园区应用**\n\n"
                "- 异常响应 · 从告警位置打开关联视频和事件记录。\n"
                "- 机器人巡检与盘点 · 回放巡检轨迹，关联识别到的箱号与堆位。\n"
                "- 堆位状态 · 查看占用和空余情况，支持场内调度。\n"
                "- 道闸通行 · 关联进出记录、牵引车和货箱，支持定位与调度。\n"
            )
        if page_id == "vision_ai_workflow":
            vision_notes += "\n**讲稿补充 · GEV 能力分层**\n\n"
            for title_zh, _, body_zh, _, items in VISION_LAYERS:
                vision_notes += f"**{title_zh}**\n\n"
                if body_zh:
                    vision_notes += body_zh + "\n\n"
                for name_zh, _, detail_zh, _ in items:
                    vision_notes += f"- {name_zh}" + (f" · {detail_zh}" if detail_zh else "") + "\n"
                if items:
                    vision_notes += "\n"
            for label, entries in (
                ("讲稿补充 · 语音查询与定位", VISION_VOICE_COMMANDS),
                ("异常和运营情况播报", VISION_VOICE_BRIEFINGS),
            ):
                vision_notes += f"**{label}**\n\n"
                for name_zh, _, detail_zh, _ in entries:
                    vision_notes += f"- {name_zh} · {detail_zh}\n"
                vision_notes += "\n"
            vision_notes += "语音支持精确、模糊和语义匹配，也能识别 Spot 或道闸编号。\n"
        if page_id == "vision_ai_value":
            vision_notes += "\n" + VISION_RESPONSE_NOTE[0] + "\n"
        vision_notes += "\n"
    day = day.replace("九案例", "九个业务案例")
    day = day.replace("\n### D1.3", "\n" + vision_notes + "\n### D1.3", 1)
    case_row = "| Vision AI | 按需选讲 | 园区视觉与 IoT | 定位、巡检、异常证据与人工处置 |"
    last_case = next(line for line in day.splitlines() if line.startswith("| iCEO"))
    day = day.replace(last_case, last_case + "\n" + case_row, 1)
    day += """### D1.5 从试点到规模化

#### D1.5.1 实施路线与能力复用

用业务轴定位流程、角色和目标，用功能轴识别可跨场景复用的能力。依次完成知识盘点、能力准备、流程试点、培训推广、持续优化、产品化和复制推广。每一步都用业务证据决定是否进入下一阶段。

#### D1.5.2 从一个可验收的流程开始

明确试点任务、授权样本、验收基线与人工接管条件。确定业务负责人、技术接口和下一次评审时间。
"""
    (root / NOTES).write_text(
        "# ITEM 企业 AI 平台通用演示\n\n## D1.0 演示总览\n\n"
        "从业务结果出发，了解 AI 如何接入现有流程，并找出一个可验收的试点。\n\n"
        "## D1.0.1 演示路线\n\n平台定位 → 业务案例与视频 → 平台架构与核心能力 → 落地与验收 → 从试点到规模化。\n\n"
        + customer_copy(day)
    )
    (source / "detailed_manifest.json").write_text(json.dumps(meta, ensure_ascii=False))
    shell = BeautifulSoup((SOURCE / "shell.html").read_text(), "html.parser")
    shell.title.string = "ITEM Enterprise AI · General Demo"
    shell.select_one(".brand-small").string = "ENTERPRISE AI · GENERAL DEMO"
    shell.select_one(".top-context").string = "ITEM Enterprise AI"
    shell.select_one(".rail-label").string = "DEMO"
    shell.select_one(".day-switch").decompose()
    for dialog in shell.select("#directory-modal, #reader-modal"):
        dialog.select_one(".info-copy").decompose()
    modal = shell.select_one("#resource-modal")
    modal.h2.string = "演示资料 / Demo resources"
    for link in modal.select('a[href="__OTHER_HTML__"], a[href^="forms/"]'):
        link.decompose()
    for link in modal.select("[data-project-download]"):
        link.decompose()
    modal.select_one('[data-local-download="html"]').decompose()
    template = str(shell).replace(
        "if(location.protocol==='file:'){const zip=document.querySelector('[data-project-download]');",
        "if(location.protocol==='file:'&&document.querySelector('[data-project-download]')){const zip=document.querySelector('[data-project-download]');",
    )
    # Keep substitution tokens literal after serializing the template.
    (source / "shell.html").write_text(template)


def main():
    with TemporaryDirectory(prefix="item-general-demo-") as directory:
        root = Path(directory)
        prepare_sources(root)
        build_site.ROOT = root
        build_site.SOURCE = root / "source"
        build_site.SITE = root / "site"
        build_site.DELIVERY = root / "delivery"
        build_site.MD_NAME = NOTES
        build_site.NAMES = {"brief": "unused.html", "detailed": DECK}
        build_site.SITE.mkdir()
        (build_site.SITE / "assets").symlink_to(ROOT / "assets", target_is_directory=True)
        build_site.build("detailed")
        result = (root / DECK).read_text()
        result = re.sub(r"DAY 1 · MD §", "DEMO · MD §", result)
        english_media = json.loads((SOURCE / "general_demo_media.json").read_text())
        config = json.dumps(english_media, ensure_ascii=False).replace("</", "<\\/")
        script = (SOURCE / "general_demo_media.js").read_text()
        media_controls = (
            '<style>.general-demo-media-status{padding:24px;text-align:center}'
            '.general-demo-media-status a{color:var(--accent,#007f86)}</style>'
            f'<script id="general-demo-media" type="application/json">{config}</script>'
            f'<script>{script}</script>'
        )
        result = result.replace("</body>", media_controls + "</body>", 1)
        result = re.sub(r"[ \t]+(?=\n)", "", result)
        (ROOT / DECK).write_text(result)
        shutil.copy2(root / NOTES, ROOT / "docs" / NOTES)


if __name__ == "__main__":
    main()
