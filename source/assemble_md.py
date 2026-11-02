from pathlib import Path
import re,json
S=Path(__file__).resolve().parent
R=S.parent
old=(S/'R4_Approved.md').read_text()
MD_NAME='Item_ISS_AI_Native_Workshop_R5.md'

def between(a,b):return old[old.index(a):old.index(b)].strip()
def remap_text(s):
    # 通用四议题范围现仍指目标蓝图/差距/路线/IP，避免被拆成旧根节点。
    s=s.replace('D2.1–D2.4','__FOUR_TOPICS__')
    def f(m):
        a=int(m[1]);b=int(m[2]) if m[2] else None
        if a==1:return f'D2.1.{10+b}' if b is not None else 'D2.1.10'
        if a==2:return m[0]
        if a==3:return f'D2.3.{10+b}' if b is not None else 'D2.3.10'
        if a==4:return f'D2.3.{20+b}' if b is not None else 'D2.3.20'
        if a==5:return f'D2.5.{10+b}' if b is not None else 'D2.5.10'
        return f'D2.5.{20+b}' if b is not None else 'D2.5.20'
    s=re.sub(r'D2\.([1-6])(?:\.(\d+))?',f,s)
    return s.replace('__FOUR_TOPICS__','D2.1–D2.4')

def old_d2(n):
    a='### D2.'+str(n)+' '
    b='### D2.'+str(n+1)+' ' if n<6 else '## 附录 A.'
    chunk=between(a,b)
    chunk=remap_text(chunk)
    # 移到新主题下，原正文完整保留；只更新层级、时间与归类。
    chunk=re.sub(r'^(#{3,5}) ',lambda m:'#'+m[1]+' ',chunk,flags=re.M)
    if n==1:
        chunk=re.sub(r'^#### D2\.1\.10 .*$', '#### D2.1.10 Hollis 企业 AI 实践：目标蓝图的企业能力输入｜60 分钟，包含在120分钟内',chunk,flags=re.M)
    if n==2:
        chunk=re.sub(r'^#### D2\.2 .*$', '#### D2.2.10 六业务域现状与最佳实践证据库',chunk,flags=re.M)
        chunk=chunk.replace('六域各 25 分钟为**建议分配**，包含讨论，不加时','六域资料通过会前表单收集，会中围绕跨域差距和突破主线讨论，不固定每域独立汇报时长')
        chunk=chunk.replace('（各域 25 分钟含讨论）','（用于会前输入和跨域讨论）')
    if n==3:chunk=re.sub(r'^#### D2\.3\.10 .*$', '#### D2.3.10 可持续能力资产：路线图的建设与运营机制',chunk,flags=re.M)
    if n==4:chunk=re.sub(r'^#### D2\.3\.20 .*$', '#### D2.3.20 AI 原生业务与组织衔接：路线图的责任机制',chunk,flags=re.M)
    if n==5:
        chunk=re.sub(r'^#### D2\.5\.10 .*$', '#### D2.5.10 统一建议积累：在前四议题同步形成',chunk,flags=re.M)
        chunk=chunk.replace('不再讲案例、平台或业务域','不重复讲案例、平台或业务域；建议在前四议题同步形成，末尾30分钟用于确认')
    if n==6:chunk=re.sub(r'^#### D2\.5\.20 .*$', '#### D2.5.20 决策门与行动确认｜包含在最后30分钟内',chunk,flags=re.M)
    return chunk

def fragments(path,prefix):
    t=(S/path).read_text()
    matches=list(re.finditer(r'^#{4,5} (D2\.\d\.\d+) .+$',t,re.M))
    chunks=[]
    for i,m in enumerate(matches):
        if m[1].startswith(prefix):
            e=matches[i+1].start() if i+1<len(matches) else len(t)
            x=t[m.start():e].strip();x=re.sub(r'^##### (D2\.)',r'#### \1',x,flags=re.M)
            x=x.replace('D2.5/D2.6','D2.5').replace('D2.6','D2.5.20')
            chunks.append(x)
    return '\n\n'.join(chunks)

intro='''# ISS AI Native 转型工作坊

## 实践对标、组织与流程重塑、能力演进与商业化

**AI Accelerator 的业务价值实现探讨｜R5.0｜2026-10-26**  
**ITEM × COO AI Team × ISS Biz (team)｜主持人：Tom｜两天**  
**Hollis：企业 AI 实践、方法框架与能力演进输入**

通过 ITEM、COO AI Team 和 ISS Biz 的真实实践与共同研讨，明确 ISS 未来两到三年的运营状态，识别当前流程、能力与组织协作的差距，形成分阶段实施路线及自主能力与商业化方向。不是以 Agent 数量证明成功，而是把知识、决策、行动和反馈连接到业务结果。

共同目标是减少重复开发及重复工作，让已有数据、软件、算力、模型、Agent 与 Skill 在同一业务流程中协作，并通过经过验证的能力复用，触发新的服务、流程和产品创新。

ITEM 直接对接 COO AI Team 紧密合作、共同开发，依托 Hollis 的 Accelerator 理论框架与已有 AI、预测、优化及数字化成果进一步扩展；ISS Biz 对业务目标、规则、采用及价值负责；COO AI Team 在数据、源码、现有软件、接口、基础设施或跨部门需要时按需支撑。

## 两天议程总览

### Day 1 · 八组实践：看实现过程、组织机制与 ISS 对标

| 顺序 | 正文 | 主题 | 时长 | 输出 |
|---|---|---|---:|---|
| 1 | D1.1 | ITEM 定位、合作与工作坊目的 | 5分钟 | 共同目标与讨论方式 |
| 2 | D1.2 | 八案例总览及七段展开：含预录视频、异常与组织证据 | 220分钟 | 方法、证据、对标及待补信息 |
| 3 | D1.3 | 平台、工具、知识与持续演进 | 120分钟 | 复用资产与运行机制 |
| 4 | D1.4 | 风险、失败、平台融合及业务价值 | 60分钟 | 验收与风险边界 |
| 5 | D1.5 | ISS 实施输入、七阶段与初步四字段 | 60分钟 | 第二天输入与责任 |
| 合计 | | | **465分钟／7小时45分钟** | 不含午休及休息 |

八案例原时长及顺序保留；多页展开支持讨论和后续隐藏，不表示增加时长。视频时长包含在对应案例时间内。

### Day 2 · 形成 ISS AI Native 转型方案

| 顺序 | 正文 | 主题 | 时长 | 主要输出 |
|---|---|---|---:|---|
| 1 | D2.1 | 目标运营蓝图与 Hollis 企业实践 | 120分钟 | 两到三年目标状态；Hollis60分钟包含在内 |
| 2 | D2.2 | 现状差距与突破主线 | 90分钟 | 六域材料归纳为跨域差距与优先任务 |
| 3 | D2.3 | 业务、组织、平台、产品路线图及动手共建 | 120分钟 | 分阶段任务、能力资产、组织责任与最小草稿 |
| 4 | D2.4 | 自主 IP、候选产品与商业化 | 90分钟 | 资产边界、客户验证、交付与启动条件 |
| 5 | D2.5 | 议题收敛与行动确认 | 30分钟 | 战略四成果、执行四字段及会末采集记录 |
| 合计 | | | **450分钟／7小时30分钟** | 不含午休及休息 |

两天净内容合计915分钟／15小时15分钟。开始时间、午休及休息另行安排。

## 贯穿两天的四个决策字段

| 执行字段 | 要明确什么 |
|---|---|
| ① 首个共建场景与验收指标 | 用户、问题、范围、基线、评测与验收，不只写 Agent 名称 |
| ② 联合团队与 Owner | ISS Biz、COO AI、ITEM，以及发起人、参与者、决策人、FDE、专家与按需 COO AI Team 角色 |
| ③ 能力输入与执行边界 | 数据、知识、代码、模型、接口、权限；真实执行／模拟／人工确认 |
| ④ 推进方式与下一决策门 | 阶段、交付、Owner、日期、投入、继续／调整／停止与审批 |

战略四项成果是目标蓝图、差距与突破主线、实施路线、自主能力与商业化；四个执行字段承接近期推进。第一天初步积累，第二天贯穿各议题补齐证据并最终确认。

---

## Day 1. ITEM 的 AI 实践、组织与流程改造，如何在 ISS 对标

从业务问题与实际材料出发，不仅看技术是否能运行，还要看流程怎样变化、谁承担审核与运营、怎样推动采用及持续改进。实际案例结果、建议设计和待补证据分别标识。
'''

case_intro='''### D1.2. 典型案例实践、组织流程与痛点分析｜3小时40分钟

#### D1.2.0 八案例总览：针对方向与共同观察点

| 案例 | 时长 | 针对方向 | 要共同观察什么 |
|---|---:|---|---|
| UNIS 港口拖柜 | 20分钟 | 无头Agent与切入点选择 | ticket识别问题、任务责任、后台执行、例外和回写 |
| ITEM WMS Dynamic Form | 40分钟 | 本地代码与定制开发效率 | 业务描述、生成页面、本地验证、版本与责任 |
| UNIS Rate & Quote | 60分钟 | 数据本体与业务开发共同语言 | 语义审核、分析与应用表单、规则变更及复用 |
| ISS BO | 40分钟 | FDE落地多样规则 | WIKI、小本体、专家/样本、评测与泛化 |
| General Record & Reply | 20分钟 | 线下流程知识采集 | 授权视频、SOP审核、Agent/执行与知识反馈 |
| ISS CEC＋Genesys | 20分钟 | 被动知识收集与受控集成 | 坐席参与、流程分析、人工接管、系统回写 |
| iCEO功能与案例 | 10分钟 | 功能、成功案例与失败教训 | 查事办事、供应商选择、复杂决策证据与权限边界 |
| 其他踩过的坑 | 10分钟 | 知识、法规、幻觉、模型投资与业务语义 | 适用性、证据、合规、评测及退出机制；WMS Agent 真实样例 |

每例按七段展开：**业务结果与改造前 → 改造后闭环 → 实施过程 → 组织与价值证据 → ISS对标 → 变更与长期资产 → 重复交付与动手。**

每例预留预录视频位置。视频由Tom选择/放置；注明真实、脱敏或模拟材料，不把建议流程说成历史事实。需要展示正常任务、缺失信息/异常、人工接管、状态回写与业务结果；视频本身不是验收证据。
'''

platform='''#### D1.3.5 平台持续演进：变化不推倒重来，成功可重复交付

在 COO AI Team Hollis 的框架支持下，将一次性实践逐步转成有责任、接口、评测、版本与运营反馈的可复用能力。

**业务变更链：业务提出新规则 → 专家确认范围与有效期 → FDE修改规则/本体/Skill → 正常、异常与独立样本回归 → 经授权发布或回滚 → 运行反馈。** 模型替换、系统接口变化也要回归验证，不认为统一网关就自动获得正确性。

可沉淀到企业核心知识库的包括经授权和审核的定义、SOP、业务规则与例外、语义/流程模型、Skill能力卡、评测与失败分类、版本和运营方法。客户原始数据、敏感录屏、未审核推测不自动变成可商业化资产。第二场景复用先比较共同核心、配置差异、数据/权限与验收，不无条件复制。

重复交付需要通用核心、场景配置、标准接口、评测与发布、部署维护、培训及运营责任；技术Marketplace提供发现与治理，Dashboard反映采用、质量、成本与业务结果，不把登记或调用数量当成果。

| 讨论记录 | 会中填写 |
|---|---|
| 现有可复用资产/证据 | ______ |
| 本次变更与回归要求 | ______ |
| 第二场景及需重验部分 | ______ |
| Owner、下一步与日期 | ______ |
'''

appendix_e='''## 附录 E. 会前问题采集与会末收敛表单

### 会前：ISS Biz 各域问题与材料采集

| 字段 | 提供什么 |
|---|---|
| 部门、人名、主题 | 业务域/部门、分享人与议题 |
| 痛点、现状 | 业务目标、现有做法及具体任务/问题 |
| 可提供input资料和数据 | 授权SOP、工单、WIKI、代码/数据、录屏、现有Agent或接口；说明可共享范围 |
| 期望的最好实践 | 希望对标或实现的工作方式，不假设已实现 |
| 基线 | 当前周期/工作量/质量/成本及统计范围；未知可写待补，不填虚构数字 |
| 断点 | 知识、数据、接口、流程交接、人工判断或组织机制 |
| Owner | 业务责任人和可协调的专家/系统责任人 |

HTML会前版包含可填写的采集表；提交前确认信息有权共享。材料用描述或受控链接，不自动上传原始文件。

### 会末：议题收敛

记录优先场景/从哪里开始、核心能力/护城河、共建方式及发起人/参与者/决策人、可能风险，并附验收、能力输入与执行边界、Owner、日期、推进状态和下一决策门。

**本地保存与集中提交不是同一件事。** 本机草稿与讨论笔记可导出JSON/CSV/Markdown供人工汇总；GitHub Pages仅托管静态页面。部署包内含集中收集API，配置后只有服务器返回真实回执才显示提交成功；未配置或失败明确提示，不丢草稿。讨论笔记不默认自动发送，须由记录人选择整理和共享。管理员读取集中记录需要后端凭证，凭证和记录不进入公共Git仓库。
'''

# 作者成果未到齐时失败，不生成不完整MD。
case_items=json.loads((S/'case_items.json').read_text())
for f in [S/'case_outputs'/(item['id']+'.md') for item in case_items]+[S/'day2_front_new.md',S/'day2_back_new.md']:
    if not f.is_file():raise SystemExit('Missing content: '+str(f))
first=between('### D1.1.','### D1.2.')
first=re.sub(r'^> 第一天先看.*$', '> 第一天从八组实践与失败经验看业务结果、改造前后、实施过程、组织和价值证据，并请ISS对标。第二天结合Hollis企业实践形成目标蓝图、差距、路线及产品化方案，最后明确执行与责任。',first,flags=re.M)
rest=between('### D1.3.','## Day 2.')
pos=rest.index('### D1.4.')
rest=rest[:pos]+platform+'\n\n---\n\n'+rest[pos:]
rest=remap_text(rest)
cases=[]
for item in case_items:
    t=(S/'case_outputs'/(item['id']+'.md')).read_text().strip()
    t=re.sub(r'^#{1,6}\s+(D1\.2\.\d+)\s+',r'#### \1 ',t,flags=re.M)
    t=re.sub(r'^#{1,6}\s+(D1\.2\.\d+\.\d+)\s+',r'##### \1 ',t,flags=re.M)
    first_break=t.index('\n')
    video_id=item['id']
    video=f'\n\n**预录视频留位：{video_id}。** 素材链接/文件、时长、录制日期、真实/脱敏/模拟状态及授权负责人由Tom补充；部署播放器配置对应 `assets/site-config.js` 的 `{video_id}`。当前不引用未提供的视频。演示应对应本例正常、异常/缺失信息、人工接管、状态回写与最终结果。\n'
    t=t[:first_break]+video+t[first_break:]
    cases.append(t)
blocks=[intro,first,case_intro]+cases+[rest]
blocks+=['## Day 2. ISS AI Native 转型方案：蓝图、差距、路线与商业化\n\n目标不是增加一批孤立Agent，而是形成可追溯的目标状态和分阶段行动。各环节留出领导意见、证据、结论、Owner和日期记录；原企业实践、六域、能力资产、组织和决策资料归入相应主题。']
blocks+=['### D2.1 目标运营蓝图与Hollis企业实践｜120分钟',fragments('day2_front_new.md','D2.1.'),old_d2(1)]
blocks+=['### D2.2 现状差距、六业务域与突破主线｜90分钟',old_d2(2),fragments('day2_front_new.md','D2.2.')]
blocks+=['### D2.3 实施路线图、组织机制、能力资产与动手共建｜120分钟',fragments('day2_front_new.md','D2.3.'),old_d2(3),old_d2(4)]
blocks+=['### D2.4 自主IP、产品与商业化｜90分钟',fragments('day2_back_new.md','D2.4.')]
blocks+=['### D2.5 议题收敛与行动确认｜30分钟',fragments('day2_back_new.md','D2.5.'),old_d2(5),old_d2(6)]
app=between('## 附录 A.','## 附录 C.')
app=remap_text(app).replace('D2.1、D2.3','D2.1、D2.3').replace('两日版位置','R5位置')
app=app.replace('D1.2.8','__ICEO_CASE__').replace('D1.2.9','D1.2.8').replace('__ICEO_CASE__','D1.2.7')
app=app.replace('CFS/Depot','').replace('CFS＋Depot','')
blocks+=[app,'## 附录 C. 内容迁移与保留说明\n\n八案例原始细节保留在各例第8小节；平台、风险、三方职责及七阶段仍在Day1；原Hollis企业实践位于D2.1.10及后续小节，六业务域位于D2.2，资产生命周期位于D2.3.10，组织责任位于D2.3.20，原统一建议和决策门位于D2.5.10及D2.5.20。新增IP商业化独立位于D2.4。原始R4和原生页备份保留在工程源码供追溯，不作为当前会议的另一套议程。',appendix_e]
text='\n\n---\n\n'.join(x.strip() for x in blocks if x.strip())+'\n'
text=text.replace('九案例','八案例').replace('九组','八组').replace('九例','八例').replace('CFS/Depot','').replace('CFS＋Depot','')
text=re.sub(r'\n---\n\s*---\n','\n---\n',text)
(R/MD_NAME).write_text(text)
(R/'delivery').mkdir(exist_ok=True)
(R/'delivery'/MD_NAME).write_text(text)
print(MD_NAME,len(text.encode()),'bytes')
