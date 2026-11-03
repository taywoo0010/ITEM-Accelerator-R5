"""Rebuild the current R5 workshop outputs without running historical migration code.

This script deliberately reads the working tree's current manifests and root Markdown.
It imports only the pure scene/page-data helpers from ``.refresh_r5_outputs.py``;
no case normalization, merge, or historical reader migration is used here.
"""
from __future__ import annotations

import importlib.util
import json
import re
import subprocess
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
MD_NAME = "Item_ISS_AI_Native_Workshop_R5.md"

# These are the pages whose native HTML was revised/copied for the current workshop.
# The manifest remains the source of truth: a page is styled only when it is in the
# current manifest and its native source exists.
REVISION_PAGES = {
    "brief": {"b5_01_objectives"},
    "detailed": {
        "r5_platform_architecture",
        "r5_product_panorama",
        "r5_knowledge_foundation",
        "r5_task_outcomes",
        "r5_task_execution",
        "r5_platform_mechanisms",
        "r5_execution_controls",
        "r5_reusable_assets",
        "r5_validation_scope",
        "r5_delivery_boundaries",
        "r5_implementation_overview",
        "r5_c01_04",
    },
}

# ``scope_css`` intentionally drops at-rules from native slide styles. Keep the
# mobile overrides here, where their selectors can remain limited to the six
# newly authored detailed pages rather than changing shared deck CSS.
MOBILE_RESPONSIVE_PAGES = {
    "r5_task_outcomes",
    "r5_task_execution",
    "r5_platform_mechanisms",
    "r5_execution_controls",
    "r5_reusable_assets",
    "r5_validation_scope",
}
MOBILE_GRID_CLASSES = (
    "chain",
    "examples",
    "faces",
    "path",
    "layer",
    "system",
    "head",
    "row",
    "scope",
    "steps",
)


def _load_module(name: str, path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot import {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Only these pure helpers are imported from the historical refresh module.
_refresh = _load_module("refresh_helpers", ROOT / ".refresh_r5_outputs.py")
rebuild_scenes = _refresh.rebuild_scenes
page_data = _refresh.page_data

# Use the site's canonical CSS scoping and current-Markdown rendering behavior.
_build_site = _load_module("build_site_helpers", SOURCE / "build_site.py")
scope_css = _build_site.scope_css
render_md = _build_site.render_md


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def sync_page_metadata(manifest: dict) -> bool:
    """Synchronize only index/number/total; retain every other page field."""
    pages = manifest["pages"]
    total = len(pages)
    changed = False
    for index, page in enumerate(pages):
        values = {"index": index, "number": index + 1, "total": total}
        for key, value in values.items():
            if page.get(key) != value:
                page[key] = value
                changed = True
    return changed


def write_manifest(kind: str, manifest: dict) -> None:
    (SOURCE / f"{kind}_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def changed_native_pages(kind: str) -> set[str]:
    """Include later authored edits instead of silently restoring their old container."""
    tracked = subprocess.check_output(["git", "diff", "--name-only", "HEAD", "--", f"slides-source/{kind}"], cwd=ROOT, text=True)
    untracked = subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard", f"slides-source/{kind}"], cwd=ROOT, text=True)
    return {Path(name).stem for name in (tracked + untracked).splitlines() if name.endswith(".html")}


def native_style_css(kind: str, manifest: dict) -> str:
    """Extract and scope styles only for the explicitly revised native pages."""
    deck = ROOT / "slides-source" / kind
    selected = {page["id"] for page in manifest["pages"]} & (REVISION_PAGES[kind] | changed_native_pages(kind))
    blocks = []
    for page_id in sorted(selected):
        source_path = deck / f"{page_id}.html"
        if not source_path.is_file():
            raise FileNotFoundError(f"Missing revised native page: {source_path}")
        source = source_path.read_text(encoding="utf-8")
        styles = re.findall(r"<style\b[^>]*>(.*?)</style\s*>", source, flags=re.I | re.S)
        if not styles:
            raise ValueError(f"Missing native style for revised page: {page_id}")
        css = "\n".join(styles).strip()
        scoped = scope_css(css, page_id)
        if scoped.strip():
            blocks.append(f"/* {page_id} */\n{scoped}")
    mobile_pages = {page["id"] for page in manifest["pages"]} & MOBILE_RESPONSIVE_PAGES
    if mobile_pages:
        blocks.append(mobile_revision_css(mobile_pages))
    return "\n".join(blocks)


def mobile_revision_css(page_ids: set[str]) -> str:
    """Return narrowly scoped mobile rules omitted by ``scope_css``."""
    pages = sorted(page_ids)
    slide_containers = ",\n".join(f"#{page_id} .slide-container" for page_id in pages)
    constrained = ",\n".join(
        f"#{page_id} .{class_name}"
        for page_id in pages
        for class_name in ("page-inner", "content", *MOBILE_GRID_CLASSES)
    )
    grids = ",\n".join(
        f"#{page_id} .{class_name}"
        for page_id in pages
        for class_name in MOBILE_GRID_CLASSES
    )
    return f"""/* Mobile layout overrides for the six newly authored detailed pages. */
@media(max-width:700px){{
{slide_containers}{{
width:100%!important;
min-width:0!important;
max-width:100%!important;
}}
{constrained}{{
min-width:0!important;
max-width:100%!important;
}}
{grids}{{
grid-template-columns:minmax(0,1fr)!important;
}}
#r5_reusable_assets .matrix{{
width:100%!important;
min-width:0!important;
max-width:100%!important;
table-layout:fixed!important;
}}
#r5_reusable_assets .matrix tr > :nth-child(1){{width:21%!important;}}
#r5_reusable_assets .matrix tr > :nth-child(2){{width:45%!important;}}
#r5_reusable_assets .matrix tr > :nth-child(3){{width:34%!important;}}
#r5_reusable_assets .matrix th,
#r5_reusable_assets .matrix td{{
min-width:0!important;
overflow-wrap:anywhere;
word-break:break-word;
padding-left:6px!important;
padding-right:6px!important;
}}
}}"""


def inject_revision_css(text: str, css: str) -> str:
    """Replace the one independent revision style block without touching other styles."""
    text = re.sub(r'<style\s+id=["\']workshop-revision-css["\']>.*?</style>\s*', "", text, flags=re.I | re.S)
    style = f'<style id="workshop-revision-css">{css}</style>\n'
    match = re.search(r"</head\s*>", text, flags=re.I)
    if not match:
        raise ValueError("Cannot inject workshop revision CSS: missing </head>")
    return text[: match.start()] + style + text[match.start() :]


def rebuild_deck(kind: str, manifest: dict, markdown: str) -> None:
    filename = "Item_ISS_PreRead_R5.html" if kind == "brief" else "Item_ISS_Meeting_R5.html"
    path = ROOT / filename
    if not path.is_file():
        raise FileNotFoundError(path)
    # Preserve the accepted rendered containers for untouched pages. Native sources
    # may contain form placeholders; reassembling them must not lose real forms.
    baseline = subprocess.check_output(["git", "show", f"HEAD:{filename}"], cwd=ROOT, text=True)
    starts = list(re.finditer(r'<section class="scene" id="([^"]+)"', baseline))
    containers = {}
    for index, match in enumerate(starts):
        stop = starts[index + 1].start() if index + 1 < len(starts) else len(baseline)
        block = baseline[match.start():stop]
        container = re.search(r'''<div\b[^>]*\bclass\s*=\s*["'][^"']*\bslide-container\b[^"']*["'][^>]*>''', block)
        if container:
            containers[match[1]] = block[container.start():_refresh.matching_div_end(block, container.start())]
    text = rebuild_scenes(path.read_text(encoding="utf-8"), manifest)
    starts = list(re.finditer(r'<section class="scene" id="([^"]+)"', text))
    revised = REVISION_PAGES[kind] | changed_native_pages(kind)
    for index in range(len(starts) - 1, -1, -1):
        match = starts[index]
        page_id = match[1]
        if page_id in revised or page_id not in containers:
            continue
        stop = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        block = text[match.start():stop]
        container = re.search(r'''<div\b[^>]*\bclass\s*=\s*["'][^"']*\bslide-container\b[^"']*["'][^>]*>''', block)
        start = match.start() + container.start()
        end = match.start() + _refresh.matching_div_end(block, container.start())
        text = text[:start] + containers[page_id] + text[end:]
    text = page_data(text, manifest, markdown)
    rendered, _anchors = render_md(markdown)
    reader_pattern = r'(<article class="reader-content" id="reader-content">).*?(</article>)'
    text, replaced = re.subn(reader_pattern, lambda match: match[1] + rendered + match[2], text, count=1, flags=re.S)
    if replaced != 1:
        raise ValueError("Missing embedded current reader: " + filename)
    text = inject_revision_css(text, native_style_css(kind, manifest))
    path.write_text(text, encoding="utf-8")


def rebuild_reader(markdown: str) -> None:
    """Refresh docs/reader.html from the current root MD, never from git HEAD."""
    rendered, _anchors = render_md(markdown)
    path = ROOT / "docs" / "reader.html"
    if path.is_file():
        old = path.read_text(encoding="utf-8")
        start = old.find("<h1")
        end = old.rfind("</main>")
        if start >= 0 and end >= 0 and start < end:
            path.write_text(old[:start] + rendered + old[end:], encoding="utf-8")
            return
    fallback = (
        '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>ISS AI Native 完整正文 · R5</title></head><body><main>'
        '<a href="../index.html">项目入口</a> · '
        '<a href="../Item_ISS_PreRead_R5.html">会前版</a> · '
        '<a href="../Item_ISS_Meeting_R5.html">会中版</a>'
        f"{rendered}</main></body></html>"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(fallback, encoding="utf-8")


def write_docs(kind: str, manifest: dict, markdown: str) -> None:
    docs = ROOT / "docs"
    docs.mkdir(parents=True, exist_ok=True)
    (docs / MD_NAME).write_text(markdown, encoding="utf-8")
    edition = "会前共享版" if kind == "brief" else "会中讨论版"
    rows = [f"# {edition} · R5 MD对应", "", "|页|Day|MD|主题|", "|---|---|---|---|"]
    rows.extend(
        f"|{index + 1}|{page['day']}|{page['md']}|{page.get('title', '')}|"
        for index, page in enumerate(manifest["pages"])
    )
    (docs / f"{kind}_MD_Map_R5.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
    if kind == "detailed":
        (docs / "detailed_MD_Map_R5.md").write_text("\n".join(rows) + "\n", encoding="utf-8")


def main() -> None:
    markdown = (ROOT / MD_NAME).read_text(encoding="utf-8")
    manifests = {kind: load_json(SOURCE / f"{kind}_manifest.json") for kind in ("brief", "detailed")}
    _rendered, anchors = render_md(markdown)
    for kind, manifest in manifests.items():
        ids = [page["id"] for page in manifest["pages"]]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate page IDs in " + kind)
        for page in manifest["pages"]:
            for ref in page.get("refs", [page["md"]]):
                if "md-" + ref.replace(".", "-") not in anchors:
                    raise ValueError("Missing Markdown anchor: " + page["id"] + " " + ref)
    for kind, manifest in manifests.items():
        sync_page_metadata(manifest)
        write_manifest(kind, manifest)
        rebuild_deck(kind, manifest, markdown)
        write_docs(kind, manifest, markdown)
    rebuild_reader(markdown)
    print(
        "Rebuilt current workshop:",
        ", ".join(f"{kind}={len(manifest['pages'])}" for kind, manifest in manifests.items()),
    )


if __name__ == "__main__":
    main()
