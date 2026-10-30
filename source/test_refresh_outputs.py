"""Regression checks for deck assembly after removing or inserting cases."""
import importlib.util
from copy import deepcopy
import json
import re
from pathlib import Path
import unittest
from tempfile import TemporaryDirectory
from unittest.mock import patch

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("refresh", ROOT / ".refresh_r5_outputs.py")
refresh = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(refresh)


class DeckAssemblyTests(unittest.TestCase):
    def test_manifest_can_rebuild_after_current_version_is_committed(self):
        current = json.loads((ROOT / 'source/detailed_manifest.json').read_text())
        with TemporaryDirectory() as directory:
            temporary = Path(directory)
            (temporary / 'source').mkdir()
            with patch.object(refresh, 'ROOT', temporary), patch.object(refresh, 'git_json', return_value=deepcopy(current)):
                rebuilt = refresh.merge_detailed_manifest()
        self.assertEqual(rebuilt, current)

    def test_failure_topics_share_section_numbers_and_reader_targets(self):
        groups = (
            ('D1.2.8.1', '知识抽取与知识生成', ['r5_c09_01', 'r5_c09_02', 'r5_c09_02b']),
            ('D1.2.8.2', 'WMS Agent：业务本体连接规则与动作', ['r5_c09_wms']),
            ('D1.2.8.3', '自建模型实验复盘', ['r5_c09_08', 'r5_c09_09', 'r5_c09_10']),
            ('D1.2.8.4', '小模型训练复盘：样本、规则与可解释性的边界', ['r5_c09_small_models', 'r5_c09_model_selection']),
            ('D1.2.8.5', 'AI 招聘的跨国本地化', ['r5_c09_hiring']),
            ('D1.2.8.6', '可信 Agent：一套标准，三重保障', ['r5_agent_assurance']),
        )
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        reader = html.fromstring((ROOT / 'docs/reader.html').read_text())
        markdown = (ROOT / 'Item_ISS_AI_Native_Workshop_R5.md').read_text()
        for ref, topic, ids in groups:
            anchor = 'md-' + ref.replace('.', '-')
            self.assertEqual(len(reader.xpath(f'//*[@id="{anchor}"]')), 1)
            self.assertEqual(reader.get_element_by_id(anchor).text_content(), f'{ref} {topic}')
            self.assertEqual(markdown.count(f'##### {ref} {topic}\n'), 1)
            for page_id in ids:
                with self.subTest(page_id=page_id):
                    scene = document.get_element_by_id(page_id)
                    self.assertEqual(scene.get('data-md'), ref)
                    kicker = scene.xpath('.//div[@class="kicker"]')[0]
                    self.assertEqual(kicker.xpath('./span[@class="zh"]')[0].text_content(), topic)
                    self.assertIn(f'MD §{ref}', kicker.text_content())
                    self.assertIn(topic, scene.xpath('./div[@class="scene-tools"]')[0].text_content())
                    self.assertEqual(scene.xpath('./div[@class="scene-tools"]//button/@data-md'), [ref])
                    self.assertIn(ref, scene.xpath('.//footer')[0].text_content())

    def test_failure_overview_uses_the_case_list_as_its_only_subdirectory(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        scene = document.get_element_by_id('r5_c09_00')
        content = scene.xpath('.//main[@class="content"]')[0]
        self.assertEqual([node.get('class') for node in content], ['case-column', 'root-column'])
        self.assertEqual(len(content.xpath('.//*[@class="route"]')), 0)
        self.assertIn('共同根因', content.xpath('./section[@class="root-column"]//h2')[0].text_content())

    def test_remote_updates_and_local_cases_are_present_together(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        manifest = json.loads((ROOT / 'source/detailed_manifest.json').read_text())
        embedded = json.loads(document.get_element_by_id('page-data').text)
        self.assertEqual(manifest, embedded)
        ids = {page['id'] for page in manifest['pages']}
        self.assertFalse(any(page_id.startswith('r5_c07_') for page_id in ids))
        self.assertFalse({'r5_c01_06', 'r5_c01_07', 'r5_c09_03', 'r5_c09_04', 'r5_c09_05', 'r5_c09_06', 'r5_c09_07'} & ids)
        updated = [f'r5_c01_{i:02d}' for i in range(1, 6)] + [f'r5_c06_{i:02d}' for i in range(1, 8)]
        updated += ['r5_c09_hiring', 'r5_c09_00', 'r5_c09_08', 'r5_c09_09', 'r5_c09_10', 'r5_c09_small_models', 'r5_c09_model_selection']
        for page_id in updated:
            with self.subTest(page_id=page_id):
                self.assertIn(page_id, ids)
                native = html.fromstring((ROOT / f'slides-source/detailed/{page_id}.html').read_text())
                source_slide = native.xpath('//div[@class="slide-container"]')[0]
                scene = document.get_element_by_id(page_id)
                rendered_slide = scene.xpath('./div[@class="slide-container"]')[0]
                self.assertEqual(source_slide.text_content(), rendered_slide.text_content())
                for button in scene.xpath('./div[@class="scene-tools"]//button'):
                    self.assertIsNotNone(document.get_element_by_id('md-' + button.get('data-md').replace('.', '-')))
        hiring = document.get_element_by_id('r5_c09_hiring')
        self.assertEqual(hiring.get('data-md'), 'D1.2.8.5')
        self.assertTrue(hiring.xpath('.//img')[0].get('src').startswith('data:image/png;base64,'))

    def test_new_failure_pages_localize_all_visible_chinese_content(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        page_ids = ('r5_c09_08', 'r5_c09_09', 'r5_c09_10', 'r5_c09_hiring', 'r5_agent_assurance')
        page_ids += ('r5_c09_small_models', 'r5_c09_model_selection', 'r5_c09_00')
        page_ids += tuple(f'r5_c02_{i:02d}' for i in range(1, 8))
        page_ids += tuple(f'r5_c05_{i:02d}' for i in range(1, 7))
        for page_id in page_ids:
            with self.subTest(page_id=page_id):
                scene = document.get_element_by_id(page_id)
                self.assertGreaterEqual(len(scene.xpath('.//span[contains(concat(" ", normalize-space(@class), " "), " zh ")]')), 2)
                self.assertGreaterEqual(len(scene.xpath('.//span[contains(concat(" ", normalize-space(@class), " "), " en ")]')), 2)
                unlocalized = []
                for node in scene.xpath('.//text()[normalize-space() and not(ancestor::title or ancestor::desc or ancestor::script or ancestor::style)]'):
                    if re.search(r'[\u4e00-\u9fff]', node):
                        parent = node.getparent().getparent() if node.is_tail else node.getparent()
                        ancestors = parent.xpath('ancestor-or-self::*[@class]')
                        classes = {' '.join((ancestor.get('class') or '').split()) for ancestor in ancestors}
                        if not any('zh' in class_names.split() or 'en' in class_names.split() for class_names in classes):
                            unlocalized.append(node.strip())
                self.assertEqual(unlocalized, [], f'unlocalized Chinese text: {unlocalized}')

    def test_integrated_case_sources_and_media_are_preserved(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        for case, count in [('c02', 7), ('c05', 6)]:
            for number in range(1, count + 1):
                page_id = f'r5_{case}_{number:02d}'
                with self.subTest(page_id=page_id):
                    native = html.fromstring((ROOT / f'slides-source/detailed/{page_id}.html').read_text())
                    source = native.xpath('//div[@class="slide-container"]')[0]
                    scene = document.get_element_by_id(page_id)
                    built = scene.xpath('./div[@class="slide-container"]')[0]
                    self.assertEqual(source.text_content(), built.text_content())
        self.assertFalse(document.xpath('//*[@id="r5_c05_07"]'))
        demo = document.get_element_by_id('r5_c05_01')
        video = demo.xpath('.//aside[@class="video-slot"]//video')[0]
        self.assertEqual(video.get('poster'), 'media/record-reply/fms-service-ticket-poster.jpg')
        self.assertEqual(video.xpath('./source/@src'), ['media/record-reply/fms-service-ticket.mp4'])
        self.assertEqual(video.xpath('./source/@type'), ['video/mp4'])
        self.assertTrue((ROOT / 'media/record-reply/fms-service-ticket.mp4').is_file())
        self.assertTrue((ROOT / 'media/record-reply/fms-service-ticket-poster.jpg').is_file())
        self.assertFalse(demo.xpath('.//*[@data-case-id="c05"]'))
        self.assertFalse(demo.xpath('.//aside//iframe | .//aside//input'))
        config = (ROOT / 'assets/site-config.js').read_text()
        self.assertIn('media/c02-dynamic-forms/index.html', config)
        self.assertTrue((ROOT / 'media/c02-dynamic-forms/index.html').is_file())

    def test_assurance_page_order_assets_and_reader_are_preserved(self):
        text = (ROOT / 'Item_ISS_Meeting_R5.html').read_text()
        document = html.fromstring(text)
        scene = document.get_element_by_id('r5_agent_assurance')
        self.assertEqual(scene.getprevious().get('id'), 'r5_c09_hiring')
        self.assertEqual(scene.getnext().get('data-md'), 'D1.3.1')
        self.assertEqual(len(scene.xpath('.//*[@data-trust-step]')), 4)
        self.assertEqual(scene.get('data-md'), 'D1.2.8.6')
        link = scene.xpath('.//a[@data-trust-attachment]')[0].get('href')
        self.assertTrue((ROOT / link).is_file())
        video = scene.xpath('.//video[@data-trust-video]')[0]
        for attr in ('data-video-file', 'data-poster-file'):
            self.assertTrue((ROOT / 'media/attachments' / video.get(attr)).is_file())
        for filename in ('assurance.js', 'workshop.js'):
            self.assertIn((ROOT / 'assets' / filename).read_text().strip(), text)
        self.assertEqual(len(document.xpath('//*[@id="md-D1-2-8-0"]')), 1)
        reader = html.fromstring((ROOT / 'docs/reader.html').read_text())
        self.assertIn('Evaluation Agent', reader.text_content())
        self.assertIn('ItemGPT', reader.text_content())
        self.assertEqual(len(document.xpath('//section[@class="scene"]')), 143)

    def test_small_model_review_keeps_both_pages_and_all_examples(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        cases = document.get_element_by_id('r5_c09_small_models')
        selection = document.get_element_by_id('r5_c09_model_selection')
        self.assertEqual(cases.getprevious().get('id'), 'r5_c09_10')
        self.assertEqual(cases.getnext(), selection)
        self.assertEqual(len(cases.xpath('.//tbody/tr')), 4)
        self.assertEqual(len(selection.xpath('.//li')), 12)
        overview = document.get_element_by_id('r5_c09_00')
        self.assertEqual(len(overview.xpath('.//*[@class="case-item"]')), 6)
        for scene in (cases, selection):
            self.assertEqual(scene.get('data-md'), 'D1.2.8.4')
            self.assertIn(f'#{scene.get("id")} .small-model-page', document.get_element_by_id('model-failure-css').text)

    def test_reader_refresh_preserves_assurance_and_is_repeatable(self):
        reader = (ROOT / 'docs/reader.html').read_text()
        updated = refresh.append_model_failure_reader_sections(reader)
        self.assertEqual(updated, refresh.append_model_failure_reader_sections(updated))
        self.assertIn('Evaluation Agent', updated)
        self.assertIn('ItemGPT', updated)

    def test_failure_chapter_builds_toward_customer_acceptance(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        scenes = document.xpath('//section[@class="scene"][starts-with(@data-md, "D1.2.8.")]')
        refs = [scene.get('data-md') for scene in scenes]
        self.assertEqual(refs, sorted(refs))
        overview = document.get_element_by_id('r5_c09_00')
        self.assertNotIn('经历这些失败之后', overview.text_content())
        self.assertIn('先选一个可验收任务：什么输入、谁负责、什么证据才算完成？', overview.text_content())
        assurance = document.get_element_by_id('r5_agent_assurance')
        expected = ['trust-overview', 'trust-knowledge', 'trust-testing', 'trust-evaluation']
        panels = assurance.xpath('.//article[contains(@class, "trust-panel")]')
        self.assertEqual([panel.get('id') for panel in panels], expected)
        buttons = assurance.xpath('.//button[@data-trust-step]')
        self.assertEqual([button.get('aria-controls') for button in buttons], expected)
        self.assertEqual([button.get('data-trust-step') for button in buttons], ['0', '1', '2', '3'])
        self.assertEqual([panel.get('aria-label') for panel in panels], ['1 / 4', '2 / 4', '3 / 4', '4 / 4'])
        self.assertIn('从哪个真实任务开始？', panels[-1].text_content())
        metadata = json.loads(document.get_element_by_id('page-data').text)
        self.assertTrue(next(page for page in metadata['pages'] if page['id'] == 'r5_agent_assurance')['notes'])
        for filename in ('Item_ISS_AI_Native_Workshop_R5.md', 'docs/reader.html'):
            notes = (ROOT / filename).read_text()
            headings = [f'D1.2.8.{n} ' for n in range(1, 7)]
            positions = [notes.index(heading) for heading in headings]
            self.assertEqual(positions, sorted(positions))
            self.assertLess(notes.index('横向画面 2｜人工审核'), notes.index('横向画面 3｜自动化测试'))

    def test_css_injection_handles_explicit_and_omitted_head_end(self):
        for head_end in ("</head>", "", "</HEAD>"):
            with self.subTest(head_end=head_end):
                source = '<html><head><!-- </head><body> --><title>Deck</title>' + head_end + '<body><p>Keep me</p></body></html>'
                styled = refresh.inject_model_failure_css(source)
                document = html.fromstring(styled)
                styles = document.xpath('//head/style[@id="model-failure-css"]')
                self.assertEqual(len(styles), 1)
                self.assertEqual(len(document.xpath('//style')), 1)
                self.assertEqual(document.xpath('//body/p/text()'), ['Keep me'])
                self.assertEqual(styled, refresh.inject_model_failure_css(styled))

    def test_css_injection_requires_a_boundary(self):
        with self.assertRaisesRegex(ValueError, 'head/body boundary'):
            refresh.inject_model_failure_css('<html><head><title>Incomplete</title>')

    def test_delivered_deck_contains_scoped_model_styles(self):
        document = html.fromstring((ROOT / 'Item_ISS_Meeting_R5.html').read_text())
        styles = document.xpath('//head/style[@id="model-failure-css"]')
        self.assertEqual(len(styles), 1)
        css = styles[0].text
        for page_id, class_name, declaration in (
            ('r5_c09_08', 'pano', 'grid-template-columns:repeat(5,minmax(0,1fr))'),
            ('r5_c09_09', 'quad-grid', 'grid-template-columns:repeat(4,minmax(0,1fr))'),
            ('r5_c09_10', 'route-table', 'table-layout:fixed'),
        ):
            with self.subTest(page_id=page_id):
                self.assertIn(f'#{page_id} .failure-page .{class_name}', css)
                self.assertIn(declaration, css)
                self.assertTrue(document.get_element_by_id(page_id).xpath(
                    './/*[contains(concat(" ", normalize-space(@class), " "), $name)]', name=f' {class_name} '))

    def test_container_parser_preserves_nested_main_and_ignores_comments(self):
        slide = '<div class="slide-container"><!-- </div> --><main><div>x</div></main><footer>y</footer></div>'
        self.assertEqual(refresh.matching_div_end(slide + '<div>next</div>', 0), len(slide))

    def test_generated_structure_and_metadata(self):
        for kind, filename in (("detailed", "Item_ISS_Meeting_R5.html"), ("brief", "Item_ISS_PreRead_R5.html")):
            with self.subTest(kind=kind):
                manifest = json.loads((ROOT / f"source/{kind}_manifest.json").read_text())
                document = html.fromstring((ROOT / filename).read_text())
                story = document.get_element_by_id("story")
                scenes = document.xpath('//section[@class="scene"]')
                self.assertEqual([s.get("id") for s in scenes], [p["id"] for p in manifest["pages"]])
                self.assertEqual(list(story), scenes)
                self.assertFalse(document.xpath('//*[@class="discussion" or @class="foot"][not(ancestor::section[@class="scene"])]'))
                for index, (scene, page) in enumerate(zip(scenes, manifest["pages"])):
                    self.assertEqual(scene.get("data-index"), str(index))
                    self.assertEqual(scene.get("data-md"), page["md"])
                    self.assertEqual(len(document.xpath(f'//*[@id="{page["id"]}"]')), 1)
                    tools = scene.find('div')
                    self.assertEqual(tools.get("class"), "scene-tools")
                    self.assertTrue(tools.text_content().startswith(f'{index + 1:03d} · MD §' + ' / '.join(page['refs'])))
                    for button in tools.xpath('.//button'):
                        self.assertEqual(button.get("data-index"), str(index))
                        self.assertIn(button.get("data-md"), [page["reader_md"]] if page.get("reader_md") else page["refs"])
                if kind == "detailed":
                    self.assertEqual(document.get_element_by_id("r5_c06_07").getnext().get("id"), "r5_c08_01")
                    self.assertEqual(document.get_element_by_id("r5_c08_01").get("data-md"), "D1.2.7.1")
                    self.assertIn("其他踩过的坑：", document.get_element_by_id("r5_c09_00").text_content())

    def test_rebuild_removes_orphaned_tails_and_is_repeatable(self):
        manifest = json.loads((ROOT / 'source/detailed_manifest.json').read_text())
        text = (ROOT / 'Item_ISS_Meeting_R5.html').read_text()
        damaged = text.replace('<footer class="bottom-bar">', '</main><div class="discussion">retired case</div></section><footer class="bottom-bar">', 1)
        rebuilt = refresh.rebuild_scenes(damaged, manifest)
        self.assertNotIn('retired case', rebuilt)
        self.assertEqual(rebuilt, refresh.rebuild_scenes(rebuilt, manifest))
        styled = refresh.inject_model_failure_css(rebuilt)
        self.assertEqual(styled, refresh.inject_model_failure_css(styled))


if __name__ == "__main__":
    unittest.main()
