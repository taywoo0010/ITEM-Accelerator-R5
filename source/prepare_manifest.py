from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent.parent
S=ROOT/'source'
old=json.loads((S/'r4_detailed_manifest.json').read_text())
brief_old=json.loads((S/'r4_brief_manifest.json').read_text())

def remap(ref):
    m=re.fullmatch(r'D2\.(\d)(?:\.(\d+))?',ref)
    if not m:return ref
    a,b=int(m[1]),int(m[2]) if m[2] else None
    if a==1:return 'D2.1.'+str(10+b) if b is not None else 'D2.1.10'
    if a==2:return ref
    if a==3:return 'D2.3.'+str(10+b) if b is not None else 'D2.3.10'
    if a==4:return 'D2.3.'+str(20+b) if b is not None else 'D2.3.20'
    if a==5:return 'D2.5.'+str(10+b) if b is not None else 'D2.5.10'
    return 'D2.5.'+str(20+b) if b is not None else 'D2.5.20'

def p(pid,title,md,ch,day,refs=None,case=None):
    return dict(id=pid,title=title,en='',md=md,refs=refs or [md],chapter=ch,day=day,case=case,notes=day==2 or bool(case))

chapters=[(0,'00','两天总览','Two-day overview',0),(1,'D1.1','定位与合作','Positioning and partnership',1),(2,'D1.2','八案例与组织实践','Eight cases and operating change',1),(3,'D1.3','平台与持续演进','Platform and evolution',1),(4,'D1.4','风险与原则','Risks and principles',1),(5,'D1.5','ISS实施输入','ISS implementation inputs',1),(6,'D2.1','目标蓝图','Target blueprint',2),(7,'D2.2','现状差距','Current state and gaps',2),(8,'D2.3','实施路线图','Implementation roadmap',2),(9,'D2.4','IP与商业化','IP and commercialization',2),(10,'D2.5','收敛与行动','Convergence and action',2),(11,'APP','准备与记录','Preparation and records',0)]
chs=[dict(id=x[0],label=x[1],zh=x[2],en=x[3],day=x[4]) for x in chapters]
oldby={x['id']:x for x in old['pages']}
case_old=[x['id'] for x in old['pages'][4:33]]
keep=[x.copy() for x in old['pages'] if x['id'] not in case_old]
new=[]
for x in keep:
    x['refs']=[remap(r) for r in x['refs']];x['md']=remap(x['md'])
    if x['day']==2:
        if x['id'].startswith('r4_hollis') or x['id'] in ['r4_d2_cover','r4_d2_agenda']:x['chapter']=6
        elif x['id'].startswith('r4_domain'):x['chapter']=7
        elif x['id'].startswith('r4_asset') or x['id'].startswith('r4_org'):x['chapter']=8
        else:x['chapter']=10
    elif x['chapter']==12:x['chapter']=11
    x['notes']=x['day']==2;x['case']=None
keepby={x['id']:x for x in keep}
new.append(p('r5_case_overview','八组案例：从切入点到组织、流程与长期资产','D1.2.0',2,1))
case_items=json.loads((S/'case_items.json').read_text())
stages=['结果、改造前与视频','改造后业务闭环','实施过程与采用','组织与价值证据','ISS对标','变更与长期资产','重复交付与动手']
for item in case_items:
    case_stages = stages
    if item['id'] == 'c08':
        case_stages = ['功能介绍与视频', '查事与相关记录', '确认后执行', '身份知识与动作边界', '供应商选择与案例视频', '选择理由与执行状态', '复杂决策失败教训', '新泽西设仓问题', '从需求到投资的证据', '当前改进与补证', 'ISS 使用边界']
    for i,label in enumerate(case_stages,1):
        new.append(p('r5_'+item['id']+'_'+str(i).zfill(2),item['name']+'｜'+label,item['md']+'.'+str(i),2,1,case=item['id']))
        if item['id']=='c09' and i==2:
            new.append(p('r5_c09_02b',item['name']+'｜知识生成流程',item['md']+'.2',2,1,case=item['id']))
more=[('r5_platform_evolution','平台持续演进','D1.3.5',3,1),('r5_d2_blueprint','未来两到三年目标蓝图','D2.1.1',6,2),('r5_d2_future_work','目标工作方式与组织运行','D2.1.2',6,2),('r5_d2_gap_map','知识、数据、接口与组织差距','D2.2.8',7,2),('r5_d2_breakthroughs','从差距到突破主线','D2.2.9',7,2),('r5_d2_four_lanes','四条实施泳道','D2.3.1',8,2),('r5_d2_hands_on','动手共建与最小交付','D2.3.2',8,2),('r5_d2_ip','自主IP与权利边界','D2.4.1',9,2),('r5_d2_product','可重复交付的候选产品','D2.4.2',9,2),('r5_d2_december','十二月后启动条件','D2.4.3',9,2),('r5_d2_outputs','战略四成果与执行四字段','D2.5.1',10,2),('r5_convergence_form','会末议题收敛采集','D2.5.3',10,2)]
for a in more:new.append(p(*a))
by={**keepby,**{x['id']:x for x in new}}
order=[x['id'] for x in old['pages'][:4]]+['r5_case_overview']+[x['id'] for x in new if x.get('case')]
order += [x['id'] for x in old['pages'][33:48]]+['r5_platform_evolution']+[x['id'] for x in old['pages'][48:71]]
order += ['r4_d2_cover','r4_d2_agenda','r5_d2_blueprint','r5_d2_future_work']+[x['id'] for x in old['pages'][73:76]]
order += [x['id'] for x in old['pages'][76:84]]+['r5_d2_gap_map','r5_d2_breakthroughs']
order += ['r5_d2_four_lanes','r5_d2_hands_on']+[x['id'] for x in old['pages'][84:93]]+['r4_unified_roadmap']
order += ['r5_d2_ip','r5_d2_product','r5_d2_december']
order += ['r5_d2_outputs','r4_unified_fields','r4_unified_dependencies','r4_gate_states','r4_gate_actions','r4_gate_authority','r4_closing','r5_convergence_form','r4_preparation','r4_source_map']
assert len(order)==len(set(order))==len(by),(len(order),len(by),set(by)-set(order))
meta=dict(version='R5.0 · 2026-10-26',kind='detailed',project_dir=old['project_dir'],days=2,host='Tom',chapters=chs,pages=[by[i] for i in order],schedule={'day1':465,'day2':450,'cases':220,'day2_blocks':[120,90,120,90,30]})
(S/'detailed_manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
(S/'delete_old_cases.json').write_text(json.dumps([{'slide_id':i} for i in case_old]))
(S/'reorder_detailed.json').write_text(json.dumps([{'slide_id':i} for i in order]))

brief_defs=[('b5_00_cover','ISS AI Native：实践对标、组织流程、能力演进','overview',0,0),('b5_01_objectives','工作坊四项最终成果','decisions',0,0),('b5_02_day1','Day 1：八案例与流程组织对标','D1.2',2,1),('b5_03_day2','Day 2：蓝图、差距、路线、产品','day2',6,2),('b5_04_partnership','ITEM × COO AI × ISS Biz 共建','D1.1.3',1,1),('b5_05_ticket_code','从工单与代码开始：港口、WMS','D1.2.0',2,1),('b5_06_data_rules','从数据与规则开始：Rate、BO','D1.2.0',2,1),('b5_07_observe_act','从观察到执行：Record、CEC','D1.2.0',2,1),('b5_08_failures','失败与边界：iCEO及其他教训','D1.2.0',2,1),('b5_09_platform','平台、知识与持续演进','D1.3',3,1),('b5_10_benchmark','请带来本域现状与最好实践','D2.2',7,2),('b5_11_roadmap','四条泳道与七阶段共建','D2.3.1',8,2),('b5_12_ip','自主能力与商业化方向','D2.4',9,2),('b5_13_outputs','战略成果与下一轮执行决定','D2.5.1',10,2),('b5_14_preparation','会前准备：材料、基线、Owner与权限','appendix-a',11,0),('b5_15_intake','ISS Biz 会前问题采集表','appendix-e',11,0)]
bm=dict(meta,kind='brief',project_dir=brief_old['project_dir'],pages=[dict(p(*x),notes=False) for x in brief_defs])
(S/'brief_manifest.json').write_text(json.dumps(bm,ensure_ascii=False,indent=2))
(S/'add_brief.json').write_text(json.dumps([{'slide_id':x[0],'page_title':x[1],'summary':'R5两天会前共享版；有完整MD对应与实际问题采集入口。'} for x in brief_defs],ensure_ascii=False))
# 明确每个作者的独立页面权限。
new_noncase=[by[i] for i in order if i.startswith('r5_') and not by[i].get('case')]
(S/'new_noncase_assignment.json').write_text(json.dumps(new_noncase,ensure_ascii=False,indent=2))
reused=[by[i] for i in order if not i.startswith('r5_')]
(S/'reuse_day1_assignment.json').write_text(json.dumps([x for x in reused if x['day']!=2],ensure_ascii=False,indent=2))
(S/'reuse_day2_assignment.json').write_text(json.dumps([x for x in reused if x['day']==2],ensure_ascii=False,indent=2))
print('Detailed',len(meta['pages']),'Brief',len(bm['pages']),'Case pages',sum(bool(x.get('case')) for x in meta['pages']))
print('Reorder:',','.join(order))
