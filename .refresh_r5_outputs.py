import json
import re
import subprocess
import copy
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
C09_GROUPS = (
    ("D1.2.8.1", "知识抽取与知识生成", "Knowledge extraction and generation", ("r5_c09_01", "r5_c09_02", "r5_c09_02b")),
    ("D1.2.8.2", "WMS Agent：业务本体连接规则与动作", "WMS Agent: ontology connects rules to actions", ("r5_c09_wms",)),
    ("D1.2.8.3", "自建模型实验复盘", "Self-built model experiment review", ("r5_c09_08", "r5_c09_09", "r5_c09_10")),
    ("D1.2.8.4", "小模型训练复盘：样本、规则与可解释性的边界", "Small-model training review: limits of samples, rules and explainability", ("r5_c09_small_models", "r5_c09_model_selection")),
    ("D1.2.8.5", "AI 招聘的跨国本地化", "AI recruitment localisation", ("r5_c09_hiring",)),
    ("D1.2.8.6", "可信 Agent：一套标准，三重保障", "Trustworthy agents: one set of standards, three safeguards", ("r5_agent_assurance",)),
)


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def git_json(path):
    return json.loads(subprocess.check_output(["git", "show", f"HEAD:{path}"], text=True))


def case_refs(text):
    replacements = {
        "九案例": "八案例", "九组": "八组", "九例": "八例",
        "Nine-case": "Eight-case", "Nine cases": "Eight cases",
        "nine cases": "eight cases", "Nine practical cases": "Eight practical cases",
        "nine practices": "eight practices", "Nine practices": "Eight practices",
        "CFS＋Depot": "", "CFS + Depot": "", "CFS / Depot": "", "CFS/Depot": "",
        "240分钟": "220分钟", "485分钟／8小时5分钟": "465分钟／7小时45分钟",
        "935分钟／15小时35分钟": "915分钟／15小时15分钟",
        "240 min / 4 h": "220 min / 3 h 40 min", "485 min": "465 min",
        "8 h 5 min": "7 h 45 min", "案例 1/9、2/9": "案例 1/8、2/8",
        "CASES 1/9, 2/9": "CASES 1/8, 2/8", "案例 3/9、4/9": "案例 3/8、4/8",
        "CASES 3/9, 4/9": "CASES 3/8, 4/8",
        "案例 5/9、6/9、7/9": "案例 5/8、6/8",
        "CASES 5/9, 6/9, 7/9": "CASES 5/8, 6/8",
        "案例 8/9、9/9": "案例 7/8、8/8",
        "案例 8/9, 9/9": "案例 7/8, 8/8",
        "CASES 8/9, 9/9": "CASES 7/8, 8/8",
        "D1.2.5–D1.2.7": "D1.2.5–D1.2.6", "20 + 20 + 20 分钟": "20 + 20 分钟",
        "20 + 20 + 20 MIN": "20 + 20 MIN",
        "D1.2.7–D1.2.7": "D1.2.7–D1.2.8", "D1.2.8–D1.2.9": "D1.2.7–D1.2.8",
        "D1.2.9 另加一页": "D1.2.8 另加一页",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def normalize_markdown_cases(text):
    """Remove the retired case and renumber the remaining Markdown sections."""

    text = re.sub(r"^#### D1\.2\.(?:7|8|9) ISS .*?(?=^#### D1\.2\.(?:7|8|9) 失败案例：iCEO)", "", text, flags=re.M | re.S)

    def renumber_headings(block, target):
        return re.sub(
            rf"^((?:####|#####)) D1\.2\.(?:7|8|9)(?=[\.\s])",
            rf"\1 D1.2.{target}",
            block,
            flags=re.M,
        )

    text = re.sub(
        r"^#### D1\.2\.(?:7|8|9) 失败案例：iCEO.*?(?=^#### D1\.2\.(?:7|8|9) 其他踩过的坑)",
        lambda match: renumber_headings(match.group(0), 7),
        text,
        flags=re.M | re.S,
    )
    text = re.sub(
        r"^#### D1\.2\.(?:7|8|9) 其他踩过的坑.*?(?=^### D1\.3\.)",
        lambda match: renumber_headings(match.group(0), 8),
        text,
        flags=re.M | re.S,
    )
    return case_refs(text)


def replace_strings(value, old, new):
    if isinstance(value, str):
        return value.replace(old, new)
    if isinstance(value, list):
        return [replace_strings(item, old, new) for item in value]
    if isinstance(value, dict):
        return {key: replace_strings(item, old, new) for key, item in value.items()}
    return value


def merge_detailed_manifest():
    manifest = git_json("source/detailed_manifest.json")
    pages = []
    hiring = None
    assurance = None
    for page in manifest["pages"]:
        if page["id"] in {"r5_c09_00", "r5_c09_08", "r5_c09_09", "r5_c09_10", "r5_c09_small_models", "r5_c09_model_selection"}:
            continue
        if page["id"] == "r5_c09_hiring":
            hiring = copy.deepcopy(page)
            continue
        if page["id"] == "r5_agent_assurance":
            assurance = copy.deepcopy(page)
            assurance["notes"] = True
            continue
        if page.get("case") == "c07" or page["id"].startswith("r5_c07_"):
            continue
        if page["id"] in {"r5_c09_03", "r5_c09_04", "r5_c09_05", "r5_c09_06", "r5_c09_07"}:
            continue
        page = copy.deepcopy(page)
        if page.get("case") == "c08":
            page = replace_strings(page, "D1.2.8", "D1.2.7")
        elif page.get("case") == "c09":
            page = replace_strings(page, "D1.2.9", "D1.2.8")
        page = replace_strings(page, "Nine cases", "Eight cases")
        page = replace_strings(page, "九案例", "八案例")
        page = replace_strings(page, "九组", "八组")
        pages.append(page)

    c09_head = next(index for index, page in enumerate(pages) if page.get("case") == "c09")
    c09_tail = max(index for index, page in enumerate(pages) if page.get("case") == "c09") + 1
    c09_base = copy.deepcopy(next(page for page in pages if page["id"] == "r5_c09_02b"))
    for key in ("topic", "topic_en", "reader_md"):
        c09_base.pop(key, None)
    overview = copy.deepcopy(c09_base)
    overview.update({
        "id": "r5_c09_00",
        "title": "其他踩过的坑：先定义可验收的业务结果",
        "en": "Other failure patterns: define the business result first",
        "md": "D1.2.8.0",
        "refs": ["D1.2.8.0"],
        "case": "c09",
    })
    supplements = [
        ("r5_c09_08", "自建模型实验全景：目标、过程与验证结果", "Self-built model experiment: target, process and validation"),
        ("r5_c09_09", "自建私有模型训练的 14 个技术限制", "14 technical limits of a self-built private model"),
        ("r5_c09_10", "两种技术路线的本质差异", "The architectural difference between the two routes"),
    ]
    extra_pages = []
    for page_id, title, english in supplements:
        page = copy.deepcopy(c09_base)
        page.update({"id": page_id, "title": title, "en": english, "case": "c09"})
        extra_pages.append(page)
    for page_id, title, english in (
        ("r5_c09_small_models", "BOL 识别与退货质检：样本不足，标签不够用", "BOL recognition and returns inspection: beyond samples and labels"),
        ("r5_c09_model_selection", "如何选型：小模型、大模型，还是两者配合", "Choosing small models, large models or both"),
    ):
        page = copy.deepcopy(c09_base)
        page.update(id=page_id, title=title, en=english, case="c09")
        extra_pages.append(page)
    if hiring:
        extra_pages.append(hiring)
    if assurance:
        extra_pages.append(assurance)
    pages[c09_head:c09_head] = [overview]
    c09_tail += 1
    pages[c09_tail:c09_tail] = extra_pages
    for ref, topic, english, page_ids in C09_GROUPS:
        for page in pages:
            if page["id"] in page_ids:
                page.update(md=ref, refs=[ref], topic=topic, topic_en=english)
                page.pop("reader_md", None)
    manifest["pages"] = pages
    manifest = replace_strings(manifest, "Nine cases", "Eight cases")
    manifest = replace_strings(manifest, "九案例", "八案例")
    manifest = replace_strings(manifest, "九组", "八组")
    manifest["schedule"] = {"day1": 465, "day2": 450, "cases": 220, "day2_blocks": [120, 90, 120, 90, 30]}
    for index, page in enumerate(manifest["pages"]):
        page["index"] = index
        page["number"] = index + 1
        page["total"] = len(pages)
    (ROOT / "source/detailed_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def remove_case_reader(text):
    heading = re.search(r'<h4 id="md-D1-2-7">([^<]*)</h4>', text)
    if heading and ("CFS" in heading.group(1) or "Depot" in heading.group(1) or " ISS " in heading.group(1)):
        text = re.sub(r'<h4 id="md-D1-2-7">.*?</h4>.*?(?=<h4 id="md-D1-2-8">)', "", text, flags=re.S)
    return text


def normalize_reader_cases(text):
    text = remove_case_reader(text)
    start_iceo = text.find('<h4 id="md-D1-2-8">')
    start_other = text.find('<h4 id="md-D1-2-9">', start_iceo + 1)
    end_other = text.find('<h3 id="md-D1-3"', start_other + 1)
    if start_iceo < 0 or start_other < 0 or end_other < 0:
        return text
    iceo = text[start_iceo:start_other]
    other = text[start_other:end_other]
    iceo = iceo.replace("md-D1-2-8", "md-D1-2-7")
    iceo = re.sub(r"D1\.2\.(?:7|8)(?=[\.\s])", "D1.2.7", iceo)
    other = other.replace("md-D1-2-9", "md-D1-2-8")
    other = re.sub(r"D1\.2\.(?:7|8|9)(?=[\.\s])", "D1.2.8", other)
    text = text[:start_iceo] + iceo + other + text[end_other:]
    return text.replace("D1.2.7–D1.2.7", "D1.2.7–D1.2.8").replace("D1.2.8–D1.2.9", "D1.2.7–D1.2.8")


def matching_div_end(text, start):
    if start < 0:
        raise ValueError("Missing slide container")
    fragment = text[start:]
    offsets = [0]
    for line in fragment.splitlines(keepends=True):
        offsets.append(offsets[-1] + len(line))

    class DivParser(HTMLParser):
        depth = 0
        end = None

        def handle_starttag(self, tag, attrs):
            if tag == "div" and self.end is None:
                self.depth += 1

        def handle_endtag(self, tag):
            if tag == "div" and self.end is None:
                self.depth -= 1
                if self.depth == 0:
                    line, column = self.getpos()
                    self.end = fragment.index(">", offsets[line - 1] + column) + 1

    parser = DivParser()
    parser.feed(fragment)
    if parser.end is None:
        raise ValueError("Unclosed slide container")
    return start + parser.end


def page_data(text, meta, markdown):
    data = json.dumps(meta, ensure_ascii=False).replace("</", "<\\/")
    md = json.dumps(markdown, ensure_ascii=False).replace("</", "<\\/")
    text = re.sub(r'(<script id="page-data" type="application/json">).*?(</script>)',
                  lambda m: m.group(1) + data + m.group(2), text, count=1, flags=re.S)
    return re.sub(r'(<script id="md-source" type="application/json">).*?(</script>)',
                  lambda m: m.group(1) + md + m.group(2), text, count=1, flags=re.S)


def model_failure_css():
    """Scope the attached three-page review CSS so it cannot override the deck shell."""
    source = (ROOT / "slides-source/detailed/r5_c09_08.html").read_text(encoding="utf-8")
    match = re.search(r"<style>(.*?)</style>", source, flags=re.S)
    if not match:
        raise ValueError("Missing model-failure slide styles")
    css = re.sub(r"/\*.*?\*/", "", match.group(1), flags=re.S)

    def scope_rule(match, page_id):
        selectors, declarations = match.group(1).strip(), match.group(2)
        if selectors.startswith("@"):
            return match.group(0)
        scoped = []
        for selector in selectors.split(","):
            selector = selector.strip()
            if not selector or selector == "body":
                continue
            if selector.startswith("html[data-lang=en]"):
                scoped.append(f"html[data-lang=en] #{page_id}{selector[len('html[data-lang=en]'):]}")
            else:
                scoped.append(f"#{page_id} {selector}")
        return (", ".join(scoped) + "{" + declarations + "}") if scoped else ""

    scoped = []
    for page_id in ("r5_c09_08", "r5_c09_09", "r5_c09_10"):
        scoped.append(re.sub(r"([^{}]+)\{([^{}]*)\}", lambda m: scope_rule(m, page_id), css))
    overview = (ROOT / "slides-source/detailed/r5_c09_00.html").read_text(encoding="utf-8")
    overview_css = "\n".join(re.findall(r"<style>(.*?)</style>", overview, flags=re.S))
    scoped.append(re.sub(r"([^{}]+)\{([^{}]*)\}", lambda m: scope_rule(m, "r5_c09_00"), overview_css))
    for page_id in ("r5_c09_hiring", "r5_c09_small_models", "r5_c09_model_selection"):
        source_path = ROOT / f"slides-source/detailed/{page_id}.html"
        if source_path.is_file():
            page_css = re.search(r"<style>(.*?)</style>", source_path.read_text(encoding="utf-8"), flags=re.S).group(1)
            scoped.append(re.sub(r"([^{}]+)\{([^{}]*)\}", lambda m: scope_rule(m, page_id), page_css))
    for page_id in ("r5_c09_08", "r5_c09_09", "r5_c09_10"):
        scoped.append(f'@media(max-width:700px){{#{page_id} .content,#{page_id} .case-list,#{page_id} .quad-grid,#{page_id} .pano,#{page_id} .valid{{grid-template-columns:1fr!important}}#{page_id} .vnote{{border-left:0;padding-left:0}}#{page_id} .route-table{{display:table;table-layout:fixed}}#{page_id} .route-table td,#{page_id} .route-table th{{padding:8px 5px!important;font-size:14px}}#{page_id} .route-table strong{{font-size:14px}}#{page_id} .route-detail{{font-size:13px}}#{page_id} h1{{font-size:29px!important}}#{page_id} .title-note{{display:block;margin:8px 0 0;font-size:21px}}}}')
    scoped.append('@media(max-width:520px){#r5_c09_00 .content{grid-template-columns:1fr!important}#r5_c09_00 .case-list{grid-template-columns:1fr!important}#r5_c09_00 .title-zone h1{font-size:30px!important}#r5_c09_00 .title-zone h1 .title-note{display:block;margin:7px 0 0;font-size:21px}#r5_c09_00 .lead{font-size:16px!important}#r5_c09_00 .case-item h3{font-size:17px!important}}')
    return "\n".join(scoped)


MODEL_FAILURE_READER = """
<h5 id="md-D1-2-8-3">D1.2.8.3 自建模型实验复盘</h5>
<h6 id="md-D1-2-8-model-experiment">自建模型实验全景：目标、过程与验证结果</h6>
<p>补充复盘一项物流客服邮件自动化实验。目标是让自建私有 NLP 模型在无需人工介入的情况下直接回复客户服务邮件，覆盖运输和仓储客服场景。实验经历邮件收集与标注、意图识别训练、执行层建设、业务接口接入和自动回复五个阶段。</p>
<p>CSR 人工验证抽取 158 封随机邮件逐一核查，只有 9% 的输出可直接使用，另有 53% 的邮件本不需要回复却被模型回复。该结果用于说明本次实验的边界，不外推为所有模型或所有业务场景的结论。</p>
<h6 id="md-D1-2-8-model-limitations">自建私有模型训练的 14 个技术限制</h6>
<p>14 个限制按训练数据、模型架构、训练工程和业务集成四个维度归类，集中体现样本量与边界定义、训练分布外表达、上下文与隐性业务知识、意图到执行的架构断层、持续维护、接口适配和执行层缺失等问题。</p>
<p>这些限制用于识别适用边界和补证方向，不能把一次实验的结果直接外推为所有模型或所有业务场景的能力判断。</p>
<h6 id="md-D1-2-8-model-architecture">自建模型与 LLM 的架构差异</h6>
<p>自建判别式模型的能力主要来自标注数据，训练分布外的表达、对话上下文和隐性业务知识需要额外工程补足；LLM 通过上下文和工具调用承接更广泛的语言表达与任务执行。</p>
<p>路线选择应回到业务场景的泛化、上下文、执行、扩展速度、私有化要求和全生命周期成本，而不是只比较模型名称。</p>
"""


MODEL_FAILURE_OVERVIEW_READER = """
<h5 id="md-D1-2-8-0">D1.2.8.0 其他踩过的坑：先定义可验收的业务结果</h5>
<p>当前 2.8 依次复盘知识抽取与生成、WMS Agent 业务本体、自建模型实验、小模型训练与选型、AI 招聘本地化，最后以“可信 Agent：一套标准，三重保障”收束。</p>
<p><strong>讨论：</strong>先选一个可验收任务：什么输入、谁负责、什么证据才算完成？</p>
<p><strong>验收链：</strong>先选一个可验证的小范围问题，补齐来源、权限、样本和分母，明确 Owner、人工接管与停止条件，再把结果回写业务状态后决定是否扩展。</p>
"""


HIRING_READER = """
<h5 id="md-D1-2-8-5">D1.2.8.5 AI 招聘的跨国本地化</h5>
<h6 id="md-D1-2-8-hiring">AI 招聘踩过的坑：系统出海，规则不能照搬</h6>
<p>AI 招聘与面试系统按中国招聘习惯设计，用于美国招聘后收到候选人投诉。系统出海需要同步检查当地文化、法律和招聘习惯。</p>
<p>薪资历史、婚育、年龄及家庭安排的问法需要重新审核。围绕薪酬预期、岗位技能、出差和明确的工作时间提出问题，由当地 HR 与法律顾问按联邦、州及地方规则确认适用范围。</p>
<p>界面截图不代表其中的候选人是投诉者，也不证明列举的问题曾在该场面试中出现；截图中的姓名、面部及会话信息对外发布前须确认授权或脱敏。</p>
"""


SMALL_MODEL_READER = """
<h5 id="md-D1-2-8-4">D1.2.8.4 小模型训练复盘：样本、规则与可解释性的边界</h5>
<h6>BOL 识别与退货质检：样本不足，标签不够用</h6>
<p>Carrier BOL 识别原先按承运商建立 OCR 模板或训练字段抽取模型，提取 BOL 号、PRO 号、件数、重量与封签号。头部承运商很快覆盖，但长尾格式持续增加、每家每月只有少量单据，样本始终不足；少件与破损等关键信息常是手写批注。复盘认识是：先攒样本再训练追不上格式变化，自由文本也不能只按固定字段处理。</p>
<p>退货质检原先训练良品 / 次品分类模型，判断能否二次销售。但模型只给标签，无法解释吊牌已剪、使用痕迹或配件缺失；各货主标准不同，质检员仍需重写说明。质检需要看懂实物、套用对应货主规则，再说明依据。</p>
<p>大模型的承接方向：读取新承运商提单并映射标准字段，与 ASN、PO 核对，将手写异常提取到差异流程；读取货主退货政策，输出能否二次销售的结论、依据条款与问题描述。</p>
<h6>如何选型：小模型、大模型，还是两者配合</h6>
<ul><li>小模型：目标固定、实时、高调用量。适合车牌识别、月台停靠、安全帽与反光衣检测、卡车轮挡检测；对象稳定、样本易采集。</li><li>大模型：低频、开放、需解释。适合读取多承运商提单、解释退货可否再售、按货主要求检查装柜打托、检查危险品标签；规则在文档中，样本难积累。</li><li>两者配合：小模型持续检测，大模型结合上下文判断。适合人车距离报警、丢货录像追溯、巡检照片库位盘点、装卸抛扔货物检测；兼顾实时成本与误报解释。</li></ul>
<p>一句话判断：需要反复标注、反复改规则，或最终总要人看一眼时，不应让小模型独自承接全部任务。以上为所提供案例的复盘与选型经验。</p>
"""


def append_model_failure_reader_sections(text):
    """Keep the new slide notes addressable without colliding with legacy D1.2.8.x IDs."""
    overview_details = re.search(r'<h5 id="md-D1-2-8-0">.*?(<h6\b.*?)(?=<h5 id="md-D1-2-8-1">)', text, flags=re.S)
    assurance = re.search(r'<h5 id="md-D1-2-8-6">.*?</h5>(.*?)(?=<h5\b|<h3 id="md-D1-3")', text, flags=re.S)
    assurance_body = assurance.group(1) if assurance else (overview_details.group(1) if overview_details else "")
    if not assurance_body:
        raise ValueError("Missing Agent assurance reader notes")
    assurance_body = re.sub(r'^\s*<h6>可信 Agent：一套标准，三重保障</h6>\s*', '', assurance_body)
    testing_marker = '<p><strong>横向画面 2｜自动化测试与人工把关。</strong>'
    if testing_marker in assurance_body:
        testing_start = assurance_body.index(testing_marker)
        knowledge_start = assurance_body.index('<p><strong>横向画面 3｜人工审核的可信知识基础。</strong>')
        evaluation_start = assurance_body.index('<p><strong>横向画面 4｜第三方评估与统一验收。</strong>')
        testing = assurance_body[testing_start:knowledge_start].replace('横向画面 2｜', '横向画面 3｜')
        knowledge = assurance_body[knowledge_start:evaluation_start].replace('横向画面 3｜', '横向画面 2｜')
        assurance_body = assurance_body[:testing_start] + knowledge + testing + assurance_body[evaluation_start:]
    assurance_body = assurance_body.replace('后三个画面依次展开自动化测试、可信知识基础与第三方交叉评估', '后三个画面依次展开可信知识基础、自动化测试与第三方交叉评估')
    closing = '<p><strong>客户讨论：</strong>从哪个真实任务开始？输入和权限是什么、谁负责验收、什么证据算完成、异常时由谁接管？</p>'
    if closing not in assurance_body:
        assurance_body = assurance_body.rstrip() + '\n' + closing
    assurance_section = '\n<h5 id="md-D1-2-8-6">D1.2.8.6 可信 Agent：一套标准，三重保障</h5>\n' + assurance_body.strip() + '\n'
    text = re.sub(r'<h5 id="md-D1-2-8-0">.*?(?=<h5 id="md-D1-2-8-1">)', "", text, flags=re.S)
    text = re.sub(
        r'<h5 id="md-D1-2-8-model-(?:experiment|limitations|architecture)">.*?(?=<h3 id="md-D1-3")',
        "",
        text,
        flags=re.S,
    )
    text = re.sub(
        r'<h5 id="md-D1-2-8-[3-7]">.*?(?=<h5 id="md-D1-2-8-|<h3 id="md-D1-3")',
        "",
        text,
        flags=re.S,
    )
    text = re.sub(
        r'<h5 id="md-D1-2-8-8">.*?(?=<h5 id="md-D1-2-8-9")',
        "",
        text,
        flags=re.S,
    )
    text = text.replace(
        '<h5 id="md-D1-2-8-9">D1.2.8.9 真实样例：WMS Agent 从 API 检索到业务本体</h5>',
        '<h5 id="md-D1-2-8-2">D1.2.8.2 WMS Agent：业务本体连接规则与动作</h5>',
    )
    text = text.replace(
        '<h5 id="md-D1-2-8-1">D1.2.8.1 复杂资料的知识抽取</h5>',
        '<h5 id="md-D1-2-8-1">D1.2.8.1 知识抽取与知识生成</h5><h6>复杂资料的知识抽取</h6>',
    )
    # The old knowledge-generation section is a detail within topic 1.
    text = text.replace(
        '<h5 id="md-D1-2-8-2">D1.2.8.2 Knowledge Fabric：多模态资料汇聚与知识生成</h5>',
        '<h6 id="md-D1-2-8-knowledge-generation">多模态资料汇聚与知识生成</h6>',
    )
    marker = '<h3 id="md-D1-3">'
    if marker not in text:
        raise ValueError("Missing D1.3 reader marker")
    overview = MODEL_FAILURE_OVERVIEW_READER
    text = text.replace('<h5 id="md-D1-2-8-1">', overview + '<h5 id="md-D1-2-8-1">', 1)
    text = text.replace(marker, MODEL_FAILURE_READER + SMALL_MODEL_READER + HIRING_READER + assurance_section + marker, 1)
    return re.sub(r'\n+(?=<h5 id="md-D1-2-8-(?:0|3)">)', '\n\n', text)


def inject_model_failure_css(text):
    text = re.sub(r'<style id="model-failure-css">.*?</style>\s*', '', text, flags=re.S)
    css = model_failure_css()
    offsets = [0]
    for line in text.splitlines(keepends=True):
        offsets.append(offsets[-1] + len(line))

    class HeadBoundaryParser(HTMLParser):
        boundary = None
        omitted_end = False

        def handle_starttag(self, tag, attrs):
            if tag == "body" and self.boundary is None:
                self.boundary = self.getpos()
                self.omitted_end = True

        def handle_endtag(self, tag):
            if tag == "head" and self.boundary is None:
                self.boundary = self.getpos()

    parser = HeadBoundaryParser()
    parser.feed(text)
    if parser.boundary is None:
        raise ValueError("Cannot insert model-failure CSS: missing head/body boundary")
    line, column = parser.boundary
    position = offsets[line - 1] + column
    style = f'<style id="model-failure-css">{css}</style>\n'
    if parser.omitted_end:
        style += '</head>\n'
    return text[:position] + style + text[position:]


def rebuild_scenes(text, manifest):
    kind = manifest["kind"]
    deck = ROOT / "slides-source" / kind
    blocks = []
    for page in manifest["pages"]:
        source = (deck / f'{page["id"]}.html').read_text(encoding="utf-8")
        slide_start = source.find('<div class="slide-container"')
        slide_end = matching_div_end(source, slide_start)
        slide = source[slide_start:slide_end]
        if page["id"] == "r5_agent_assurance":
            slide = re.sub(r'''(\bhref\s*=\s*["'])\.\./\.\./media/attachments/''', r'\1media/attachments/', slide)
        chapter = next(item for item in manifest["chapters"] if item["id"] == page["chapter"])
        refs = page.get("refs", [page["md"]])
        links = "".join(
            f'<button class="ctrl read-section" data-index="{page["index"]}" data-md="{page.get("reader_md", ref)}">§{ref}</button>'
            for ref in refs
        )
        tag = f'{page["number"]:03d} · MD §{" / ".join(refs)}'
        tools = (
            f'<div class="scene-tools"><span class="tag">{tag} · '
            f'<span class="zh">{page.get("topic", chapter["zh"])}</span><span class="en">{page.get("topic_en", chapter["en"])}</span>'
            f'</span><span class="read-links">{links}</span></div>'
        )
        blocks.append(
            f'<section class="scene" id="{page["id"]}" data-index="{page["index"]}" '
            f'data-day="{page["day"]}" data-chapter="{page["chapter"]}" data-md="{page["md"]}">'
            f'{tools}{slide}</section>'
        )
    # Native slides contain nested main elements; use shell boundaries, not </main>.
    marker = '<main class="story" id="story">'
    start = text.find(marker)
    end = text.find('<footer class="bottom-bar">', start)
    if start < 0 or end < 0:
        raise ValueError("Missing story shell boundaries")
    return text[:start + len(marker)] + "\n".join(blocks) + "\n</main>\n" + text[end:]


def refresh(path, meta, markdown):
    text = path.read_text(encoding="utf-8")
    text = rebuild_scenes(normalize_reader_cases(case_refs(text)), meta)
    text = text.replace('md:section||pages[i].md', 'md:section||pages[i].reader_md||pages[i].md')
    text = text.replace("D1.2.7–D1.2.7", "D1.2.7–D1.2.8")
    path.write_text(page_data(text, meta, markdown), encoding="utf-8")


def main():
    detailed = merge_detailed_manifest()
    brief = load(ROOT / "source/brief_manifest.json")
    for ref, topic, english, page_ids in C09_GROUPS:
        for page_id in page_ids:
            path = ROOT / "slides-source/detailed" / f"{page_id}.html"
            content = path.read_text(encoding="utf-8")
            content = re.sub(r"D1\.2\.[89]\.\d+b?", ref, content)
            start = content.index('<div class="kicker">')
            end = matching_div_end(content, start)
            kicker = f'<div class="kicker">DAY 1 / MD §{ref} / <span class="zh">{topic}</span><span class="en">{english}</span></div>'
            content = content[:start] + kicker + content[end:]
            path.write_text(content, encoding="utf-8")
    for path in [ROOT / "source/case_outputs/c09.md", ROOT / "source/case_inputs/c09.md"]:
        path.write_text(case_refs(path.read_text(encoding="utf-8").replace("D1.2.9", "D1.2.8")), encoding="utf-8")
    for path in [ROOT / "Item_ISS_AI_Native_Workshop_R5.md", ROOT / "docs/Item_ISS_AI_Native_Workshop_R5.md", ROOT / "delivery/Item_ISS_AI_Native_Workshop_R5.md"]:
        if path.is_file():
            path.write_text(normalize_markdown_cases(path.read_text(encoding="utf-8")), encoding="utf-8")
    brief_slide = ROOT / "slides-source/brief/b5_08_failures.html"
    brief_slide.write_text(case_refs(brief_slide.read_text(encoding="utf-8")), encoding="utf-8")
    markdown = normalize_markdown_cases((ROOT / "Item_ISS_AI_Native_Workshop_R5.md").read_text(encoding="utf-8"))
    baseline = subprocess.check_output(["git", "show", "HEAD:docs/reader.html"], text=True)
    reader = normalize_reader_cases(case_refs(baseline))
    reader = reader.replace("D1.2.9", "D1.2.8")
    reader = append_model_failure_reader_sections(reader)
    body = reader[reader.find("<h1>"):reader.rfind("</main>")]
    for path, meta in [(ROOT / "Item_ISS_Meeting_R5.html", detailed), (ROOT / "Item_ISS_PreRead_R5.html", brief)]:
        refresh(path, meta, markdown)
        text = path.read_text(encoding="utf-8")
        if meta["kind"] == "detailed":
            text = inject_model_failure_css(text)
        text = text.replace("D1.2.9", "D1.2.8")
        text = re.sub(r'<article class="reader-content" id="reader-content">.*?</article>',
                      '<article class="reader-content" id="reader-content">' + body + '</article>',
                      text, count=1, flags=re.S)
        path.write_text(text, encoding="utf-8")
    (ROOT / "docs/reader.html").write_text(reader, encoding="utf-8")
    for path in [ROOT / "README.md", ROOT / "Delivery_Readme_R5.md", ROOT / "index.html"]:
        content = case_refs(path.read_text(encoding="utf-8"))
        count = len(detailed["pages"])
        content = re.sub(r"(会中版)\d+页", rf"\g<1>{count}页", content)
        content = re.sub(r"\d+页会中版", f"{count}页会中版", content)
        content = re.sub(r"\d+页完整引导", f"{count}页完整引导", content)
        content = re.sub(r"\d+ pages guide the full workshop", f"{count} pages guide the full workshop", content)
        path.write_text(content, encoding="utf-8")
    rows = ["# 会中讨论版 · R5 MD对应", "", "|页|Day|MD|主题|", "|---|---|---|---|"]
    rows += [f"|{i + 1}|{p['day']}|{p['md']}|{p['title']}|" for i, p in enumerate(detailed["pages"])]
    (ROOT / "docs/detailed_MD_Map_R5.md").write_text("\n".join(rows) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
