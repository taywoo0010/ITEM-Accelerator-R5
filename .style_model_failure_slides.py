"""Restyle the supplied model review using the workshop's native slide layout."""
from copy import deepcopy
from html import escape
from pathlib import Path
import importlib.util
import json
import re

from lxml import html, etree

ROOT = Path(__file__).resolve().parent
DECK = ROOT / 'slides-source/detailed'
ATTACHMENT = Path('/Users/wutengyue/Library/Containers/com.tencent.WeWorkMac/Data/Documents/Profiles/ECD717F935BE7A3BDFB976DBCFB97B01/Caches/Files/2026-10/7b5a3e363ece234c07959768f7e9245d/自建模型VSLLM.html')

CSS = '''
*{box-sizing:border-box;margin:0;padding:0}
.en{display:none!important}html[data-lang=en] .zh{display:none!important}html[data-lang=en] .en{display:revert!important}
.slide-container{width:1280px;min-height:720px;background:var(--bg,#f6f7f9);color:var(--ink,#152439);font-family:Inter,"Noto Sans SC",Arial,sans-serif}
.failure-page{margin:42px 60px 28px;min-height:650px;display:flex;flex-direction:column;letter-spacing:0}
.failure-page header{border-top:4px solid var(--accent,#007f86);padding-top:13px}
.failure-page .kicker{font:700 12px/1.4 monospace;color:var(--accent,#007f86);letter-spacing:0!important}
.failure-page h1{font-size:36px!important;line-height:1.2!important;margin:10px 0 12px!important;font-weight:750;letter-spacing:0!important}
.failure-page .lead{font-size:18px!important;line-height:1.5!important;color:var(--muted,#52647b)!important;margin:0!important}
.failure-page .failure-body{flex:1;padding-top:24px;min-width:0}
.failure-page .sec{font-size:18px;line-height:1.3;font-weight:700;margin-bottom:14px}
.failure-page .pano{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:22px;margin-bottom:24px}
.failure-page .pano-step{border-top:2px solid var(--ink,#152439);padding-top:10px;min-width:0}
.failure-page .ps-stage{font:700 14px/1.3 monospace;color:var(--accent,#007f86)}
.failure-page .ps-exp{font-size:21px;line-height:1.3;font-weight:700;margin:8px 0}
.failure-page .ps-act{font-size:17px;line-height:1.5;color:var(--muted,#52647b)}
.failure-page .valid{display:grid;grid-template-columns:1.25fr 1fr;gap:36px;border-top:1px solid var(--line,#d9e1e8);padding-top:12px}
.failure-page .vr{display:grid;grid-template-columns:150px 1fr 45px;gap:12px;align-items:center;margin:12px 0;font-size:17px;line-height:1.4}
.failure-page .vr-b{height:12px;background:var(--line,#d9e1e8)}
.failure-page .vb{height:100%;background:var(--accent,#007f86)}
.failure-page .bc-y{background:#bd8a3c}.failure-page .bc-r{background:#bb6767}.failure-page .bc-b{background:#8396a8}
.failure-page .vr-p{font-weight:700;text-align:right}
.failure-page .sample-note{font-size:13px;line-height:1.5;color:var(--muted,#52647b);margin-top:12px}
.failure-page .vnote{border-left:1px solid var(--line,#d9e1e8);padding:4px 0 0 28px}
.failure-page .finding-number{font-size:64px;font-weight:750;line-height:1.1;color:var(--accent,#007f86)}
.failure-page .finding-label{font-size:21px;line-height:1.4;font-weight:700;margin:3px 0 14px}
.failure-page .vn-r{font-size:17px;line-height:1.5;margin-top:9px}
.failure-page .quad-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}
.failure-page .quad{border-top:2px solid var(--ink,#152439);padding-top:10px;min-width:0}
.failure-page .quad-hdr{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:15px;gap:8px}
.failure-page .qh-name{font-size:21px;font-weight:700;line-height:1.3}.failure-page .qh-count{font-size:13px;color:var(--muted,#52647b);white-space:nowrap}
.failure-page .qi{display:grid;grid-template-columns:25px minmax(0,1fr);gap:6px;padding:7px 0;border-top:1px solid var(--line,#d9e1e8)}
.failure-page .qi-badge{font:700 12px/1.3 monospace;color:var(--accent,#007f86);margin-bottom:4px}
.failure-page .qi-title{font-size:17px;font-weight:700;line-height:1.4;margin-bottom:4px}
.failure-page .qi-desc{font-size:14px;line-height:1.4;color:var(--muted,#52647b)}
.failure-page .route-table{table-layout:fixed;border-collapse:collapse;width:100%;font-size:17px}
.failure-page .route-table th{font-size:19px;padding:12px 16px!important;border-top:2px solid var(--ink,#152439);border-bottom:1px solid var(--line,#d9e1e8);text-align:left}
.failure-page .route-table th:first-child{width:17%}.failure-page .route-table th:not(:first-child){width:41.5%}
.failure-page .route-table td{vertical-align:top;padding:12px 16px!important;border-bottom:1px solid var(--line,#d9e1e8);font-size:17px;line-height:1.5}
.failure-page .route-table th:last-child,.failure-page .route-table td:last-child{background:var(--soft,#eaf0f4)}
.failure-page .route-table strong{display:block;font-size:17px;line-height:1.5;margin-bottom:3px}
.failure-page .route-detail{display:block;font-size:15px;line-height:1.5;color:var(--muted,#52647b)}
.failure-page .takeaway{margin-top:20px;padding:13px 17px;background:var(--soft,#eaf0f4);border-top:1px solid var(--line,#d9e1e8);font-size:17px;line-height:1.5}
.failure-page .takeaway b{color:var(--accent,#007f86);margin-right:14px}
.failure-page .foot{margin-top:18px;padding-top:12px;display:flex;justify-content:space-between;gap:20px;font-size:12px;color:var(--muted,#52647b);border-top:1px solid var(--line,#d9e1e8)}
'''


def localize_markup(text, translations):
    """Wrap authored Chinese text with the matching English fallback."""
    replacements = []
    for index, (chinese, english) in enumerate(sorted(translations, key=lambda item: len(item[0]), reverse=True)):
        token = f'__LOCALIZED_{index}__'
        text = text.replace(chinese, token)
        replacements.append((token, f'<span class="zh">{chinese}</span><span class="en">{english}</span>'))
    for token, replacement in replacements:
        text = text.replace(token, replacement)
    return text


MODEL_REVIEW_TRANSLATIONS = {
    "r5_c09_08": [
        ("2024.08–2025.04，物流客服邮件自动化实验，目标是无需人工介入直接回复客户。", "Aug 2024–Apr 2025: a logistics customer-service email experiment aimed to reply without manual intervention."),
        ("收集邮件", "Collect emails"), ("专人标注", "Human annotation"),
        ("标注边界三方理解", "Three parties interpreted the label boundary"), ("不一致，有争议", "Differently; disputes remained"),
        ("意图识别", "Intent recognition"), ("模型训练", "Model training"),
        ("9/11 场景上线", "9 of 11 scenarios launched"), ("2 个样本不足搁置", "2 paused for insufficient samples"),
        ("执行处理", "Execution handling"), ("系统训练", "System training"),
        ("需要另起一套架构", "A separate architecture was needed"), ("资源耗尽未启动", "Resources ran out before launch"),
        ("接入业务", "Business integration"), ("系统接口", "System interfaces"),
        ("接口仅支持", "Interfaces supported"), ("1 个场景可用", "one usable scenario"),
        ("AI 直接", "AI directly"), ("回复客户", "replies to customers"),
        ("从未真正实现", "Never actually achieved"), ("目标未达成", "Target not met"),
        ("不需要回复", "No reply needed"), ("回复内容有误", "Reply content was incorrect"),
        ("识别错误+附件", "Recognition error + attachment"), ("回复正确", "Correct reply"),
        ("CSR 人工核验：158 封随机邮件，逐一核查", "CSR review: 158 random emails checked one by one"),
        ("模型共处理 9,600+ 封邮件，上述为 CSR 随机抽取 158 封的验证结果", "The model processed 9,600+ emails; the result above comes from 158 randomly sampled by CSR."),
        ("输出可直接使用", "Outputs usable as-is"),
        ("正确回复仅来自 ", "Correct replies came only from "), (" 单一场景。", " one scenario."),
        ("的输出不可直接使用；", " of outputs were not usable as-is;"), ("本不需要回复，却触发了模型回复。", "did not need a reply but still triggered one."),
        ("复盘", "Review"), ("意图识别、业务执行与回复质量，需要分别验收。", "Intent recognition, business execution and reply quality need separate acceptance checks."),
    ],
    "r5_c09_09": [
        ("本次实验的断点分为四层，需结合具体业务任务逐项判断适用边界。", "The experiment's breakpoints fall into four layers; assess the boundary for each business task."),
        ("A · 训练数据层", "A · Training data"), ("B · 模型架构层", "B · Model architecture"), ("C · 训练工程层", "C · Training engineering"), ("D · 业务集成层", "D · Business integration"),
        ("样本覆盖不足", "Insufficient sample coverage"), ("每类约 100 条样本，难覆盖训练分布外表达。", "About 100 samples per class cannot cover out-of-distribution phrasing."),
        ("新类别干扰旧类别", "New classes interfere with old ones"), ("小样本类别加入全局训练，可能降低已有类别准确率。", "Adding a small class to global training may reduce existing-class accuracy."),
        ("标注边界不统一", "Inconsistent label boundaries"), ("各方分类口径不一致，产生矛盾标签。", "Different classification rules create conflicting labels."),
        ("邮件上下文丢失", "Email context is lost"), ("孤立标注和回复链切割，丢失语义或混入历史。", "Isolated labels and split reply chains lose meaning or mix in history."),
        ("隐性业务知识缺失", "Implicit business knowledge is missing"), ("BillTo、客户身份等判断依据不在邮件正文中。", "BillTo and customer identity are not stated in the email body."),
        ("识别与执行断层", "Gap between recognition and execution"), ("槽位、API 编排、状态和回复需另建执行系统。", "Slots, API orchestration, state and replies require a separate execution system."),
        ("分布外泛化不足", "Weak out-of-distribution generalisation"), ("新表达容易识别失败，运行错误不会自动修正。", "New phrasing fails easily, and runtime errors do not self-correct."),
        ("意图与系统错位", "Intent and system boundaries diverge"), ("客户语言分类与内部系统功能边界不同。", "Customer-language categories differ from internal system functions."),
        ("语言与字段脱节", "Language and fields are disconnected"), ("“standard pallet”到尺寸字段需要领域映射。", "Mapping “standard pallet” to size fields needs domain knowledge."),
        ("标注能力难规模化", "Annotation expertise is hard to scale"), ("人员需同时理解业务逻辑与统一的数据定义。", "People must understand both business logic and shared data definitions."),
        ("数据反馈链中断", "The data feedback loop breaks"), ("生产宕机影响邮件处理，也切断后续训练数据。", "Production outages affect email handling and cut off future training data."),
        ("维护成本持续上升", "Maintenance cost keeps rising"), ("新场景需重新采集、标注、训练，并回归旧场景。", "New scenarios require collection, annotation, training and regression."),
        ("接口调用方式不匹配", "Interface invocation does not fit"), ("面向人工表单的接口，需要参数与容错适配。", "Human-form interfaces need parameter and fault-tolerance adaptation."),
        ("执行层缺位", "Execution layer is absent"), ("识别后无接口可执行，只能返回预设数据或固定回复。", "Without executable interfaces, the system can only return preset data or fixed replies."),
        ("5 项", "5 items"), ("4 项", "4 items"), ("3 项", "3 items"), ("2 项", "2 items"),
    ],
    "r5_c09_10": [
        ("结合本次客服实验比较技术路线，按业务任务判断泛化、上下文与执行能力。", "Compare the routes through this service experiment, judging generalisation, context and execution by task."),
        ("比较维度", "Comparison dimension"), ("本次自建 NLP 方案", "This private NLP route"), ("LLM 与工具集成路线", "LLM and tool integration"),
        ("知识与泛化", "Knowledge and generalisation"), ("依赖本次标注数据", "Depends on this labelled data"), ("每类约 100 条，训练分布外表达覆盖不足。", "About 100 per class; out-of-distribution phrasing is under-covered."), ("预训练提供语言基础", "Pre-training provides language foundations"), ("业务知识通过上下文、检索或工具补充，仍需评测。", "Business knowledge comes from context, retrieval or tools; evaluation is still required."),
        ("上下文与隐性知识", "Context and implicit knowledge"), ("邮件孤立处理", "Processes emails in isolation"), ("历史对话、BillTo、客户身份需额外建模。", "History, BillTo and customer identity need extra modelling."), ("可结合历史与外部事实", "Can combine history and external facts"), ("上下文承接对话，工具查询补充业务信息。", "Context carries the dialogue; tools add business information."),
        ("识别到执行", "From recognition to execution"), ("另建任务执行系统", "Build a separate task system"), ("分类器之外，还需槽位、编排、状态与回复生成。", "Beyond classification, slots, orchestration, state and reply generation are needed."), ("模型配合工具执行", "Model executes with tools"), ("工具调用仍依赖可用接口、权限、校验及人工接管。", "Tool calls still require interfaces, access, validation and human takeover."),
        ("新场景扩展", "New-scenario expansion"), ("重新标注、训练与回归", "Re-label, retrain and regress"), ("小样本新类别可能影响已有分类效果。", "A small new class may affect existing classification."), ("调整知识、提示与工具", "Adjust knowledge, prompts and tools"), ("可缩短试验周期，变更后仍需回归验证。", "This can shorten experiments, but changes still need regression tests."),
        ("场景与选型", "Scenario and selection"), ("稳定、明确的专域任务", "Stable, bounded domain tasks"), ("需要充分数据、可控分类边界及持续维护能力。", "Needs enough data, controlled boundaries and sustained maintenance."), ("多变语言与多轮任务", "Variable language and multi-turn tasks"), ("可评估客服、文档等场景；部署与成本另行比较。", "Evaluate service and document tasks; compare deployment and cost separately."),
        ("复盘", "Review"), ("以同一任务、同一评测集比较质量与全生命周期成本，再决定技术路线。", "Compare quality and lifecycle cost on the same task and test set before choosing a route."),
    ],
}


def elements(node, name):
    return node.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), $needle)]', needle=f' {name} ')


def markup(node):
    return etree.tostring(node, encoding='unicode', method='html')


def scope_css(css, page_id):
    # Native styles here contain only flat rules, without nested at-rules.
    def scope(match):
        selectors = []
        for selector in match[1].strip().split(','):
            selector = selector.strip()
            if selector.startswith('html'):
                root, descendant = selector.split(' ',1)
                selectors.append(f'{root} #{page_id} {descendant}')
            else:
                selectors.append(f'#{page_id} {selector}')
        return ','.join(selectors)+'{'+match[2]+'}'
    return re.sub(r'([^{}]+)\{([^{}]*)\}',scope,css)


def render(number, title, en, lead, body, takeaway):
    ref = 'D1.2.8.3'
    closing = f'<div class="takeaway"><b><span class="zh">复盘</span><span class="en">Review</span></b>{takeaway}</div>' if takeaway else ''
    return f'''<!DOCTYPE html>
<html lang="zh-CN" data-lang="zh"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="slide-container"><div class="page-inner failure-page">
<header><div class="kicker">DAY 1 / MD §{ref} / <span class="zh">自建模型实验复盘</span><span class="en">Self-built model experiment review</span></div>
<h1><span class="zh">{title}</span><span class="en">{en}</span></h1><p class="lead">{lead}</p></header>
<main class="failure-body">{body}</main>
{closing}
<footer class="foot"><span>ITEM × COO AI Team × ISS Biz (team)</span><span>R5 · MD §{ref}</span></footer>
</div></div></body></html>'''


def generate():
    doc = html.fromstring(ATTACHMENT.read_text(encoding='utf-8'))
    translations = MODEL_REVIEW_TRANSLATIONS
    first = deepcopy(doc.get_element_by_id('s1'))
    pano = elements(first,'pano')[0]
    pano.attrib.pop('style',None)
    for node in elements(pano,'pano-arr'):
        node.getparent().remove(node)
    bars = elements(first,'vbars')[0]
    note = bars[-1]
    note.attrib.clear()
    note.set('class','sample-note')
    evidence = markup(bars)
    body = markup(pano) + '<div class="sec">CSR 人工核验：158 封随机邮件，逐一核查</div><div class="valid">' + evidence + '<section class="vnote"><div class="finding-number">9%</div><div class="finding-label">输出可直接使用</div><div class="vn-r">正确回复仅来自 <strong>Pickup</strong> 单一场景。</div><div class="vn-r"><strong>91%</strong> 的输出不可直接使用；<strong>53%</strong> 本不需要回复，却触发了模型回复。</div></section></div>'
    (DECK/'r5_c09_08.html').write_text(render(
        8,
        '自建模型实验：目标、过程与验证结果',
        'Private model experiment: process and results',
        localize_markup('2024.08–2025.04，物流客服邮件自动化实验，目标是无需人工介入直接回复客户。', translations['r5_c09_08']),
        localize_markup(body, translations['r5_c09_08']),
        localize_markup('意图识别、业务执行与回复质量，需要分别验收。', translations['r5_c09_08']),
    ), encoding='utf-8')

    grid = deepcopy(elements(doc.get_element_by_id('s2'),'quad-grid')[0])
    concise = [
        ('样本覆盖不足','每类约 100 条样本，难覆盖训练分布外表达。'),
        ('新类别干扰旧类别','小样本类别加入全局训练，可能降低已有类别准确率。'),
        ('标注边界不统一','各方分类口径不一致，产生矛盾标签。'),
        ('邮件上下文丢失','孤立标注和回复链切割，丢失语义或混入历史。'),
        ('隐性业务知识缺失','BillTo、客户身份等判断依据不在邮件正文中。'),
        ('识别与执行断层','槽位、API 编排、状态和回复需另建执行系统。'),
        ('分布外泛化不足','新表达容易识别失败，运行错误不会自动修正。'),
        ('意图与系统错位','客户语言分类与内部系统功能边界不同。'),
        ('语言与字段脱节','“standard pallet”到尺寸字段需要领域映射。'),
        ('标注能力难规模化','人员需同时理解业务逻辑与统一的数据定义。'),
        ('数据反馈链中断','生产宕机影响邮件处理，也切断后续训练数据。'),
        ('维护成本持续上升','新场景需重新采集、标注、训练，并回归旧场景。'),
        ('接口调用方式不匹配','面向人工表单的接口，需要参数与容错适配。'),
        ('执行层缺位','识别后无接口可执行，只能返回预设数据或固定回复。'),
    ]
    for item,(title,desc) in zip(elements(grid,'qi'),concise):
        elements(item,'qi-title')[0].text = title
        node = elements(item,'qi-desc')[0]
        for child in list(node):
            node.remove(child)
        node.text = desc
    for node in elements(grid,'qh-dot'):
        node.getparent().remove(node)
    (DECK/'r5_c09_09.html').write_text(render(
        9,
        '自建私有模型的 14 个技术限制',
        '14 technical limits of the private model',
        localize_markup('本次实验的断点分为四层，需结合具体业务任务逐项判断适用边界。', translations['r5_c09_09']),
        localize_markup(markup(grid), translations['r5_c09_09']),
        '',
    ), encoding='utf-8')

    rows = [
        ('知识与泛化','依赖本次标注数据','每类约 100 条，训练分布外表达覆盖不足。','预训练提供语言基础','业务知识通过上下文、检索或工具补充，仍需评测。'),
        ('上下文与隐性知识','邮件孤立处理','历史对话、BillTo、客户身份需额外建模。','可结合历史与外部事实','上下文承接对话，工具查询补充业务信息。'),
        ('识别到执行','另建任务执行系统','分类器之外，还需槽位、编排、状态与回复生成。','模型配合工具执行','工具调用仍依赖可用接口、权限、校验及人工接管。'),
        ('新场景扩展','重新标注、训练与回归','小样本新类别可能影响已有分类效果。','调整知识、提示与工具','可缩短试验周期，变更后仍需回归验证。'),
        ('场景与选型','稳定、明确的专域任务','需要充分数据、可控分类边界及持续维护能力。','多变语言与多轮任务','可评估客服、文档等场景；部署与成本另行比较。'),
    ]
    body = '<table class="route-table"><thead><tr><th>比较维度</th><th>本次自建 NLP 方案</th><th>LLM 与工具集成路线</th></tr></thead><tbody>'
    for dimension,a,ad,b,bd in rows:
        body += f'<tr><td>{escape(dimension)}</td><td><strong>{escape(a)}</strong><span class="route-detail">{escape(ad)}</span></td><td><strong>{escape(b)}</strong><span class="route-detail">{escape(bd)}</span></td></tr>'
    body += '</tbody></table>'
    (DECK/'r5_c09_10.html').write_text(render(
        10,
        '自建模型与 LLM：两种路线的能力边界',
        'Private NLP and LLM: capability boundaries',
        localize_markup('结合本次客服实验比较技术路线，按业务任务判断泛化、上下文与执行能力。', translations['r5_c09_10']),
        localize_markup(body, translations['r5_c09_10']),
        localize_markup('以同一任务、同一评测集比较质量与全生命周期成本，再决定技术路线。', translations['r5_c09_10']),
    ), encoding='utf-8')


def sync():
    spec = importlib.util.spec_from_file_location('refresh', ROOT/'.refresh_r5_outputs.py')
    refresh = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(refresh)
    manifest_path = ROOT/'source/detailed_manifest.json'
    meta = json.loads(manifest_path.read_text(encoding='utf-8'))
    overview = 'r5_c09_00'
    if not any(p['id']==overview for p in meta['pages']):
        index = next(i for i,p in enumerate(meta['pages']) if p['id']=='r5_c09_01')
        page = dict(meta['pages'][index],id=overview,md='D1.2.8',refs=['D1.2.8'],title='其他踩过的坑：',en='Other failure patterns:')
        meta['pages'].insert(index,page)
    ids = [overview,'r5_c09_08','r5_c09_09','r5_c09_10']
    path = ROOT/'Item_ISS_Meeting_R5.html'
    text = path.read_text(encoding='utf-8')
    if f'<section class="scene" id="{overview}"' not in text:
        raise ValueError('Generate the overview scene before styling the model-review pages')
    for page in meta['pages']:
        if page['id'] not in ids:
            continue
        source = (DECK/(page['id']+'.html')).read_text(encoding='utf-8')
        start = text.index(f'<section class="scene" id="{page["id"]}"')
        slide_start = text.index('<div class="slide-container">',start)
        slide_end = refresh.matching_div_end(text,slide_start)
        native_start = source.index('<div class="slide-container">')
        native_end = refresh.matching_div_end(source,native_start)
        text = text[:slide_start]+source[native_start:native_end]+text[slide_end:]
    for i,page in enumerate(meta['pages']):
        page.update(index=i,number=i+1,total=len(meta['pages']))
    text = refresh.rebuild_scenes(text, meta)
    text = refresh.inject_model_failure_css(text)
    text = re.sub(r'(<script id="page-data" type="application/json">).*?(</script>)',lambda m:m[1]+json.dumps(meta,ensure_ascii=False).replace('</','<\\/')+m[2],text,count=1,flags=re.S)
    path.write_text(text,encoding='utf-8')
    manifest_path.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    rows = ['# 会中讨论版 · R5 MD对应','','|页|Day|MD|主题|','|---|---|---|---|']
    rows += [f'|{p["number"]}|{p["day"]}|{p["md"]}|{p["title"]}|' for p in meta['pages']]
    (ROOT/'docs/detailed_MD_Map_R5.md').write_text('\n'.join(rows)+'\n',encoding='utf-8')


if __name__ == '__main__':
    generate()
    sync()
