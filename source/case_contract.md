# R5 案例作者契约

先读Slides技能与html-syntax；只用native write/edit逐页写登记HTML，禁止用脚本生成/修改幻灯、禁止修改project.json、禁止调用Slides工具或浏览器。每个case原则上独立7页；D1.2.9.2因引入两页Knowledge Fabric源材料拆成02与02b，其余页序不变。不能改其他案例文件。只依据给定原MD，不查外部，不假设已有实测收益或实际组织改造；可以补建议流程、待补证据、审核/运营机制。Tom主持；ITEM直接对接COO AI Team/Hollis紧密共同开发并依托现有成果扩展；ISS Biz业务Owner与验收；COO AI Team在数据/代码/软件/接口/跨部门需求时按需支撑。术语ISS Biz (team)，不提德国或Steven。

## 输出

每例写一个扩写MD /home/ubuntu/iss_r5_package/source/case_outputs/{case_id}.md；标题保留原D1.2.x。新增7小节编号D1.2.x.1–7，下面列出内容要求。所有原有事实、验证点、痛点、方法、限制、持续优化、迁移条件要保留；整段原案例细节可完整保留到“##### D1.2.x.8 既有详细实践与边界补充”（原firstheading去掉，余原文保持，仅为避免重复标题可以下移层级）。将新设计标为建议，把未知运营数据/人名/结果列为待补证据，不能写成已经实现。不要减少失败案例或本体失效的原因，不把BO90%写成已达标，不为Top10/Top6虚构具体名单。

HTML登记路径 /home/ubuntu/manus-slides/ai-accelerator-tom-mvkeywht-068eb1d1/r5_{case_id}_01.html 至 _07.html。

01 业务结果＋改造前流程＋预录视频位置：说明业务痛点、期望结果、原流程/交接；右侧div.video-slot[data-case-id={case_id}]有文字“预录视频｜待Tom放置”、建议录什么和“区分真实/脱敏/模拟”；不得写video src、假视频、外链iframe。网页将此区域变成播放器，但原生页本身必须有有意义的预留说明，不空框。
02 改造后闭环：正常任务、缺失信息/异常、人确认/接管、状态回写、最终业务结果，具体到该案例，标清建议/已知路径；iCEO不得补造成功决策执行。
03 实施过程：输入与建设过程、可能/已知困难、如何克服（建议机制）、推动业务采用及持续改进；未证实的阻力不要写成历史事实。
04 组织与价值证据：谁的职责可能改变，专家审核、交接、Owner/运营；验收、基线、分母/周期、质量/成本、错误级别、待补实测结果。不得虚构KPI。
05 ISS对标：现状、已有最好实践、知识/数据/接口/组织差距、Owner；用具体提问及会中填写的位置。
06 思考：业务变更链（业务提规则→专家审核→FDE改→回归→发布/回滚）；可沉淀到核心知识库的授权/审核知识、流程、Skill、评测、运营机制；第二场景复用哪些、哪些重验证。
07 可重复交付＋动手：该案例提炼的方法流程、通用核心/配置/接口/评测/维护，授权材料现场修改一个规则或流程、产出小范围草稿/能力卡/验收/责任。失败例可提出缩小/停止/转交机制，不能强行产品化。

## 视觉与DOM

1280×720；背景#f6f7f9、字#152439、副字#52647b、强调#007f86；系统sans字体。slide-container width1280 min-height720无padding；page-inner margin52px 60px min-height616 flexcolumn；kicker14px；h1 32/1.15；lead18/1.45；content flex1 grid gap24 padding-top20；h2 22/1.3；p/li/td18/1.5；footer14；讨论18。主内容最多4块；英文简洁不删要点；不低于18正文；不隐藏溢出、不固定内部滚动、不用auto缩字、不写bodyCSS/动画/SVG/外链/图片。相邻页可两列、三列、步骤表、横向条目交替。

CSS必须首先正确处理双语：.en{display:none!important}html[data-lang=en] .zh{display:none!important}html[data-lang=en] .en{display:revert!important}；不通过filter做夜间。

每页完整DOCTYPE文档。所有标题用h1中.zh和.en；所有正文有两种语言互斥DOM。
<div class=slide-container><div class=page-inner><header><div class=kicker>DAY 1 · MD §D1.2.x.y</div><h1><span class=zh>中文</span><span class=en>English</span></h1></header><p class=lead>zh/en</p><main class="content cols|three|stack">...</main><div class=discussion><b class=zh>讨论</b><b class=en>Discussion</b><span class=zh>具体问题</span><span class=en>English</span></div><footer class=foot>ITEM × COO AI Team × ISS Biz (team)<span>R5 · MD §D1.2.x.y</span></footer></div></div>

留给Tom补充的数据或视频是明确要求，可以出现标注的待填区域；但页面要尽量填已有事实和可操作建议，不能整页只有空表。
