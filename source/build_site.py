from pathlib import Path
from urllib.parse import urlsplit
import json,re,html,shutil,zipfile,argparse
from bs4 import BeautifulSoup
import markdown,tinycss2

SOURCE=Path(__file__).resolve().parent
ROOT=SOURCE.parent
SITE=ROOT/'site'
DELIVERY=ROOT/'delivery'
MD_NAME='Item_ISS_AI_Native_Workshop_R5.md'
NAMES={'brief':'Item_ISS_PreRead_R5.html','detailed':'Item_ISS_Meeting_R5.html'}


def scope_css(text,pid):
    out=[]
    for rule in tinycss2.parse_stylesheet(text,skip_comments=True,skip_whitespace=True):
        if rule.type!='qualified-rule':continue
        selectors=[]
        for raw in tinycss2.serialize(rule.prelude).strip().split(','):
            raw=raw.strip()
            if raw in ('body','html',':root'):continue
            if raw.startswith('html'):
                parts=raw.split(' ',1);selectors.append(parts[0]+' #'+pid+(' '+parts[1] if len(parts)>1 else ''))
            elif raw.startswith('body'):selectors.append('#'+pid+raw[4:])
            else:selectors.append('#'+pid+' '+raw)
        if selectors:out.append(','.join(selectors)+'{'+tinycss2.serialize(rule.content)+'}')
    return '\n'.join(out)


def collection_embed_css(text):
    prefix='.scene .collection-shell'
    def emit(rules):
        out=[]
        for rule in rules:
            if rule.type=='at-rule' and rule.lower_at_keyword=='media' and rule.content is not None:
                condition=tinycss2.serialize(rule.prelude)
                if 'prefers-color-scheme' not in condition:
                    out.append('@media '+condition+'{'+emit(tinycss2.parse_rule_list(rule.content,skip_comments=True,skip_whitespace=True))+'}')
            elif rule.type=='qualified-rule':
                selectors=[]
                for raw in tinycss2.serialize(rule.prelude).strip().split(','):
                    raw=raw.strip()
                    if raw in ('html','main'):continue
                    if raw in (':root','body'):selectors.append(prefix)
                    elif raw.startswith('html['):
                        parts=raw.split(' ',1);selectors.append(parts[0]+' '+prefix+(' '+parts[1] if len(parts)>1 else ''))
                    elif raw.startswith('.collection-shell'):selectors.append(raw.replace('.collection-shell',prefix,1))
                    else:selectors.append(prefix+' '+raw)
                if selectors:out.append(','.join(selectors)+'{'+tinycss2.serialize(rule.content)+'}')
        return '\n'.join(out)
    result=emit(tinycss2.parse_stylesheet(text,skip_comments=True,skip_whitespace=True))
    return result+'\n'+prefix+'{--iss-bg:var(--bg);--iss-panel:var(--paper);--iss-text:var(--ink);--iss-muted:var(--muted);--iss-line:var(--line);--iss-accent:var(--accent);--iss-accent-soft:var(--soft);--iss-shadow:none;grid-column:1/-1}html[data-theme=night] '+prefix+'{--iss-success:#79d5b8;--iss-warning:#ffda95;--iss-danger:#ffa4a4}'


def render_md(text):
    soup=BeautifulSoup(markdown.markdown(text,extensions=['tables','fenced_code','sane_lists']),'html.parser')
    seen=set()
    for tag in soup.find_all(re.compile('^h[1-6]$')):
        v=tag.get_text().strip();m=re.match(r'^(D[12]\.\d(?:\.\d+)*)\b',v)
        day=re.match(r'^Day\s+([12])\.',v);app=re.match(r'^附录\s+([A-Z])',v)
        key=''
        if m:key='md-'+m[1].replace('.','-')
        elif v=='两天议程总览':key='md-overview'
        elif v=='贯穿两天的四个决策字段':key='md-decisions'
        elif day:key='md-day'+day[1]
        elif app:key='md-appendix-'+app[1].lower()
        if key:
            if key in seen:raise ValueError('Duplicate MD anchor: '+key)
            tag['id']=key;seen.add(key)
    return str(soup),seen


def form_markup(kind):
    path=SITE/'forms'/('prework.html' if kind=='prework' else 'convergence.html')
    doc=BeautifulSoup(path.read_text(),'html.parser');form=doc.select_one('form[data-workshop-form]')
    if not form:raise ValueError('Missing actual form: '+str(path))
    return '<div class="collection-shell">'+str(form)+'</div>'


def build(kind):
    meta=json.loads((SOURCE/(kind+'_manifest.json')).read_text())
    deck=ROOT/'slides-source'/kind
    if not deck.is_dir():deck=Path(meta['project_dir'])
    md=(ROOT/MD_NAME).read_text();reader,anchors=render_md(md)
    scenes=[];styles=[];titles=[]
    actual_form={'brief':'prework','detailed':'convergence'}[kind]
    for i,p in enumerate(meta['pages']):
        f=deck/(p['id']+'.html')
        if not f.is_file():raise ValueError('Missing native page: '+str(f))
        doc=BeautifulSoup(f.read_text(),'html.parser');slide=doc.select_one('.slide-container')
        if not slide or slide.select('script'):raise ValueError('Invalid native slide: '+p['id'])
        for frame in slide.select('iframe'):
            url=urlsplit(frame.get('src',''))
            if (url.scheme!='https' or url.netloc not in {'www.youtube.com','www.youtube-nocookie.com'}
                    or not re.fullmatch(r'/embed/[A-Za-z0-9_-]{11}',url.path)):
                raise ValueError('Invalid native iframe: '+p['id'])
        for link in slide.select('a[data-trust-attachment]'):
            link['href']=link['href'].removeprefix('../../')
        zh=doc.select_one('h1 .zh');en=doc.select_one('h1 .en')
        if not zh or not en:raise ValueError('Missing bilingual title: '+p['id'])
        p['title']=zh.get_text(' ',strip=True);p['en']=en.get_text(' ',strip=True);p['index']=i
        p['number']=i+1;p['total']=len(meta['pages'])
        for ref in p['refs']:
            if 'md-'+ref.replace('.','-') not in anchors:raise ValueError('Missing MD ref '+p['id']+' '+ref)
        host=slide.select_one('[data-workshop-form]')
        if host:
            # 互动表单是网页组件；原生页的登记标题与内容保留。
            host.replace_with(BeautifulSoup(form_markup(actual_form),'html.parser'))
        for rule in tinycss2.parse_stylesheet('\n'.join(x.get_text() for x in doc.select('style')),skip_comments=True,skip_whitespace=True):
            if rule.type!='qualified-rule':continue
            declarations=tinycss2.parse_declaration_list(rule.content,skip_comments=True,skip_whitespace=True)
            if not any(x.type=='declaration' and x.lower_name=='display' and tinycss2.serialize(x.value).strip()=='grid' for x in declarations):continue
            for selector in tinycss2.serialize(rule.prelude).strip().split(','):
                try:
                    for element in slide.select(selector.strip()):element['data-responsive-grid']='true'
                except Exception:pass
        ch=next(x for x in meta['chapters'] if x['id']==p['chapter'])
        links=''.join(f'<button class="ctrl read-section" data-index="{i}" data-md="{html.escape(ref)}">§{html.escape(ref)}</button>' for ref in p['refs'])
        tag=f'{i+1:03d} · MD §'+html.escape(' / '.join(p['refs']))
        tools=f'<div class="scene-tools"><span class="tag">{tag} · <span class="zh">{html.escape(ch["zh"])}</span><span class="en">{html.escape(ch["en"])}</span></span><span class="read-links">{links}</span></div>'
        scenes.append(f'<section class="scene" id="{p["id"]}" data-index="{i}" data-day="{p["day"]}" data-chapter="{p["chapter"]}" data-md="{p["md"]}">{tools}{slide}</section>')
        styles.append(scope_css('\n'.join(x.get_text() for x in doc.select('style')),p['id']))
    css=collection_embed_css((SITE/'assets'/'collection.css').read_text())+'\n'+(SITE/'assets'/'workshop.css').read_text()
    scripts=['collection.js','workshop.js']
    if any(p['id']=='r5_agent_assurance' for p in meta['pages']):
        css+='\n'+(SITE/'assets'/'assurance.css').read_text()
        scripts.append('assurance.js')
    # 配置作为独立文件便于部署后编辑；离线单文件有空配置fallback，能使用本机记录与视频。
    head='<script src="assets/site-config.js"></script><script>if(!window.ISS_CONFIG)window.ISS_CONFIG={version:"R5.0",formsEndpoint:"",siteBase:new URL("./",document.baseURI).href,media:{}};</script><style>'+css+'</style>'
    js='\n'.join((SITE/'assets'/f).read_text() for f in scripts).replace('</script','<\\/script')
    buttons=''.join(f'<button class="chapter-button" data-chapter="{c["id"]}" data-day="{c["day"]}"><span class="num">{c["label"]}</span><span><span class="zh">{c["zh"]}</span><span class="en">{c["en"]}</span></span></button>' for c in meta['chapters'])
    other='detailed' if kind=='brief' else 'brief'
    repl={'__SCOPED_STYLES__':'<style>'+ '\n'.join(styles)+'</style>','__INTERACTION_HEAD__':head,'__INTERACTION_SCRIPTS__':'<script>'+js+'</script>','__CHAPTER_BUTTONS__':buttons,'__SCENES__':'\n'.join(scenes),'__READER_CONTENT__':reader,'__PAGE_DATA__':json.dumps(meta,ensure_ascii=False).replace('</','<\\/'),'__MD_SOURCE__':json.dumps(md,ensure_ascii=False).replace('</','<\\/'),'__EDITION_ZH__':'会前共享版' if kind=='brief' else '会中讨论版','__EDITION_EN__':'Pre-work sharing' if kind=='brief' else 'Workshop presentation','__OTHER_EDITION__':'打开会中版 / Meeting' if kind=='brief' else '打开会前版 / Pre-work','__OTHER_HTML__':NAMES[other],'__MD_NAME__':MD_NAME,'__HTML_NAME__':NAMES[kind],'__ZIP_NAME__':'Item_ISS_R5_Git_Installation.zip','__VISIBILITY_NAME__':'ISS_R5_'+kind+'_Visibility.json','__PAGE_COUNT__':str(len(meta['pages'])),'__VERSION__':meta['version'],'__STORE_PREFIX__':'iss-r5-'+kind+'-'}
    text=(SOURCE/'shell.html').read_text()
    for a,b in repl.items():text=text.replace(a,b)
    text=text.replace('</head>','<style>.scene .slide-container,.scene .page-inner{height:auto!important;overflow:visible!important}.scene .content,.scene .block{overflow:visible!important}.scene .page-inner{margin:0!important}@media(max-width:700px){.scene [data-responsive-grid]{grid-template-columns:minmax(0,1fr)!important}.scene *{min-width:0!important;overflow-wrap:anywhere!important}.scene .block .tag{float:none!important}.scene .cover-inner{margin:0!important;padding:24px!important}.scene .story{gap:24px!important}.scene .bottom{padding-top:24px!important}}</style></head>',1)
    mobile_rules=''.join('html[data-lang] #'+p['id']+' [data-responsive-grid]{grid-template-columns:minmax(0,1fr)!important}html[data-lang] #'+p['id']+' .page-inner,html[data-lang] #'+p['id']+' .cover-inner{margin:0!important;width:100%!important}' for p in meta['pages'])
    text=text.replace('</head>','<style>@media(max-width:700px){'+mobile_rules+'}.scene h1{text-wrap:balance}</style></head>',1)
    if re.search(r'__[A-Z][A-Z_]+__',text):raise ValueError('Unreplaced token')
    SITE.mkdir(exist_ok=True);DELIVERY.mkdir(exist_ok=True)
    (SITE/NAMES[kind]).write_text(text)
    (DELIVERY/NAMES[kind]).write_text(text.replace('<script src="assets/site-config.js"></script>',''))
    (SOURCE/(kind+'_built_manifest.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2))
    (SOURCE/(kind+'_manifest.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2))
    mapping='# '+('会前共享版' if kind=='brief' else '会中讨论版')+' · R5 MD对应\n\n|页|Day|MD|主题|\n|---|---|---|---|\n'+'\n'.join(f'|{i+1}|{p["day"]}|{p["md"]}|{p["title"]}|' for i,p in enumerate(meta['pages']))+'\n'
    (DELIVERY/(kind+'_MD_Map_R5.md')).write_text(mapping)
    docs=SITE/'docs';docs.mkdir(exist_ok=True);(docs/MD_NAME).write_text(md);(DELIVERY/MD_NAME).write_text(md)
    (docs/(kind+'_MD_Map_R5.md')).write_text(mapping)
    (docs/'reader.html').write_text('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ISS AI Native 完整正文 · R5</title><style>body{font:16px/1.85 system-ui;background:#f6f7f9;color:#152439;margin:0}main{max-width:1100px;margin:auto;padding:24px}table{display:block;overflow:auto;border-collapse:collapse}td,th{border:1px solid #ccd8e1;padding:9px}a{color:#007f86}</style></head><body><main><a href="../index.html">项目入口</a> · <a href="../'+NAMES['brief']+'">会前版</a> · <a href="../'+NAMES['detailed']+'">会中版</a>'+reader+'</main></body></html>')
    alias=SITE/('brief' if kind=='brief' else 'meeting');alias.mkdir(exist_ok=True)
    (alias/'index.html').write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=../'+NAMES[kind]+'"><a href="../'+NAMES[kind]+'">打开 R5 HTML</a>')
    if (ROOT/'slides-source').is_dir():
        shutil.copy2(SITE/NAMES[kind],ROOT/NAMES[kind])
        shutil.copytree(SITE/'docs',ROOT/'docs',dirs_exist_ok=True)
        shutil.copytree(alias,ROOT/alias.name,dirs_exist_ok=True)
    print(kind,len(meta['pages']),len(text.encode()),'bytes')


def package():
    out=DELIVERY/'installation'
    if out.exists():shutil.rmtree(out)
    out.mkdir(parents=True,exist_ok=True)
    # 可直接部署的site成为安装包根目录；源码和后端在子目录，不含实际记录/密钥。
    shutil.copytree(SITE,out,dirs_exist_ok=True,ignore=shutil.ignore_patterns('*.zip','*.sqlite*','*.db','__pycache__'))
    shutil.copytree(ROOT/'backend',out/'backend',dirs_exist_ok=True,ignore=shutil.ignore_patterns('*.db','*.sqlite*','__pycache__'))
    (out/'source').mkdir(exist_ok=True)
    for f in ['build_site.py','shell.html','assemble_md.py','prepare_manifest.py','case_contract.md','R4_Approved.md','day2_front_new.md','day2_back_new.md','brief_manifest.json','detailed_manifest.json','r4_brief_manifest.json','r4_detailed_manifest.json','case_items.json']:
        if (SOURCE/f).is_file():shutil.copy2(SOURCE/f,out/'source'/f)
    for folder in ['case_inputs','case_outputs']:
        shutil.copytree(SOURCE/folder,out/'source'/folder,dirs_exist_ok=True)
    if (SOURCE/'r4_slides').is_dir():shutil.copytree(SOURCE/'r4_slides',out/'reference'/'r4_slides',dirs_exist_ok=True)
    shutil.copy2(ROOT/MD_NAME,out/MD_NAME)
    for kind in ['brief','detailed']:
        m=json.loads((SOURCE/(kind+'_built_manifest.json')).read_text());dest=out/'slides-source'/kind;dest.mkdir(parents=True,exist_ok=True)
        deck=ROOT/'slides-source'/kind
        if not deck.is_dir():deck=Path(m['project_dir'])
        for p in m['pages']:shutil.copy2(deck/(p['id']+'.html'),dest/(p['id']+'.html'))
    for f in ['README.md','requirements.txt','.gitignore']:
        if (ROOT/f).is_file():shutil.copy2(ROOT/f,out/f)
    if (DELIVERY/'Delivery_Readme_R5.md').is_file():shutil.copy2(DELIVERY/'Delivery_Readme_R5.md',out/'Delivery_Readme_R5.md')
    if (ROOT/'.github').is_dir():shutil.copytree(ROOT/'.github',out/'.github',dirs_exist_ok=True)
    # 解压重建时assets/forms从根目录读取，首次构建前复制到site。
    archive=DELIVERY/'Item_ISS_R5_Git_Installation.zip'
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
        for f in sorted(out.rglob('*')):
            if f.is_file() and '__pycache__' not in f.parts:z.write(f,f.relative_to(out))
    (SITE/'download').mkdir(exist_ok=True);shutil.copy2(archive,SITE/'download'/archive.name)
    print('Package:',archive,archive.stat().st_size,'bytes')


def bootstrap():
    # 可在解压目录中重建，不依赖sandbox绝对路径或本机后台。
    if (ROOT/'slides-source').is_dir() and (ROOT/'assets').is_dir():
        SITE.mkdir(exist_ok=True)
        for name in ['index.html','.nojekyll','manus-routes.json']:
            if (ROOT/name).is_file():shutil.copy2(ROOT/name,SITE/name)
        shutil.copytree(ROOT/'assets',SITE/'assets',dirs_exist_ok=True)
        shutil.copytree(ROOT/'forms',SITE/'forms',dirs_exist_ok=True)
        if (ROOT/'media').is_dir():shutil.copytree(ROOT/'media',SITE/'media',dirs_exist_ok=True)


if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--kind',choices=['brief','detailed','all'],default='all');ap.add_argument('--package',action='store_true');a=ap.parse_args();bootstrap()
    for kind in ['brief','detailed'] if a.kind=='all' else [a.kind]:build(kind)
    if a.package:package()
