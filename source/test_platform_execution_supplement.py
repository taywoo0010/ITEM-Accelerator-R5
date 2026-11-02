"""Regression checks for the six-page D1.3 platform-execution supplement."""
from __future__ import annotations

from collections import Counter
import json
from pathlib import Path
import re
import unittest

from lxml import html


ROOT = Path(__file__).resolve().parents[1]
PLATFORM_EXECUTION_IDS = (
    "r5_task_outcomes",
    "r5_task_execution",
    "r5_platform_mechanisms",
    "r5_execution_controls",
    "r5_reusable_assets",
    "r5_validation_scope",
)
PLATFORM_EXECUTION_REFS = tuple(f"D1.3.{number}" for number in range(6, 12))
UNCHANGED_SCHEDULE = {
    "day1": 465,
    "day2": 450,
    "cases": 220,
    "day2_blocks": [120, 90, 120, 90, 30],
}
# Restrict the check to the six new pages: competitor-specific systems and its
# claimed production count must not become ITEM implementation claims.
FORBIDDEN_MIGRATION_PATTERN = re.compile(
    r"\b(?:9\s*production|IPC|ACE|SDE|LUDP|Data\s+Library|Master\s+Agent)\b|9\s*项\s*(?:核心能力.*?Production|Production)",
    flags=re.IGNORECASE,
)


class PlatformExecutionSupplementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "source/detailed_manifest.json").read_text(encoding="utf-8"))
        cls.brief_manifest = json.loads((ROOT / "source/brief_manifest.json").read_text(encoding="utf-8"))
        cls.pages = cls.manifest["pages"]
        cls.pages_by_id = {page["id"]: page for page in cls.pages}
        cls.page_ids = [page["id"] for page in cls.pages]
        cls.meeting = html.fromstring((ROOT / "Item_ISS_Meeting_R5.html").read_text(encoding="utf-8"))
        cls.reader = html.fromstring((ROOT / "docs/reader.html").read_text(encoding="utf-8"))

    def test_six_pages_follow_knowledge_foundation_before_delivery_boundaries(self):
        start = self.page_ids.index("r5_knowledge_foundation") + 1
        delivery = self.page_ids.index("r5_delivery_boundaries")
        self.assertEqual(self.page_ids[start:delivery], list(PLATFORM_EXECUTION_IDS))
        self.assertEqual(self.page_ids[start - 3:start], [
            "r5_platform_architecture",
            "r5_product_panorama",
            "r5_knowledge_foundation",
        ])
        self.assertEqual(self.page_ids[delivery], "r5_delivery_boundaries")

        scenes = self.meeting.xpath('//section[@class="scene"]')
        scene_ids = [scene.get("id") for scene in scenes]
        self.assertEqual(scene_ids[start:delivery], list(PLATFORM_EXECUTION_IDS))
        self.assertEqual(scene_ids[delivery], "r5_delivery_boundaries")

    def test_primary_refs_have_reader_anchors_and_bilingual_scenes(self):
        for page_id, ref in zip(PLATFORM_EXECUTION_IDS, PLATFORM_EXECUTION_REFS):
            with self.subTest(page_id=page_id):
                page = self.pages_by_id[page_id]
                scene = self.meeting.get_element_by_id(page_id)
                anchor_id = "md-" + ref.replace(".", "-")

                self.assertEqual(page["md"], ref)
                self.assertEqual(page["refs"][0], ref)
                self.assertEqual(scene.get("data-md"), ref)
                self.assertIn(ref, scene.xpath('.//div[@class="scene-tools"]//button/@data-md'))
                self.assertEqual(len(self.reader.xpath(f'//*[@id="{anchor_id}"]')), 1)
                self.assertEqual(len(self.meeting.xpath(f'//*[@id="{anchor_id}"]')), 1)

                zh_text = [node.text_content().strip() for node in scene.xpath(
                    './/*[contains(concat(" ", normalize-space(@class), " "), " zh ")]'
                ) if node.text_content().strip()]
                en_text = [node.text_content().strip() for node in scene.xpath(
                    './/*[contains(concat(" ", normalize-space(@class), " "), " en ")]'
                ) if node.text_content().strip()]
                self.assertTrue(zh_text, "new scene must retain Chinese copy")
                self.assertTrue(en_text, "new scene must retain English copy")

    def test_manifest_and_rendered_scenes_are_consistent(self):
        embedded_manifest = json.loads(self.meeting.get_element_by_id("page-data").text)
        scenes = self.meeting.xpath('//section[@class="scene"]')
        self.assertEqual(embedded_manifest, self.manifest)
        self.assertEqual([scene.get("id") for scene in scenes], self.page_ids)

        for page_id in PLATFORM_EXECUTION_IDS:
            with self.subTest(page_id=page_id):
                page = self.pages_by_id[page_id]
                scene = self.meeting.get_element_by_id(page_id)
                self.assertEqual(scene.get("data-index"), str(page["index"]))
                self.assertEqual(scene.get("data-md"), page["md"])
                self.assertEqual(page["number"], page["index"] + 1)
                self.assertEqual(page["total"], 133)

    def test_page_counts_and_agenda_remain_stable(self):
        self.assertEqual(len(self.pages), 133)
        self.assertEqual(Counter(page["day"] for page in self.pages), Counter({0: 3, 1: 90, 2: 40}))
        self.assertEqual(len(self.brief_manifest["pages"]), 16)
        self.assertEqual(self.manifest["schedule"], UNCHANGED_SCHEDULE)

    def test_supplement_does_not_restore_vendor_specific_migration_labels(self):
        for page_id in PLATFORM_EXECUTION_IDS:
            with self.subTest(page_id=page_id):
                scene_text = self.meeting.get_element_by_id(page_id).text_content()
                match = FORBIDDEN_MIGRATION_PATTERN.search(scene_text)
                self.assertIsNone(match, f"obsolete vendor/product label migrated: {match.group(0) if match else ''}")

    def test_client_revision_uses_v2_source_without_wms_dependencies(self):
        forbidden = re.compile(r"\b(?:WMS|SKU|WebAssembly|DMG-01)\b|Move\s+Inventory|Inventory\s+Issue", re.I)
        statistics = re.compile(r"70\s*%|<\s*10\s*%|10\s*[×x]|55\s*(?:个|separate)?\s*WMS", re.I)
        for page_id in PLATFORM_EXECUTION_IDS:
            with self.subTest(page_id=page_id):
                scene = self.meeting.get_element_by_id(page_id)
                text = scene.text_content()
                self.assertIsNone(forbidden.search(text))
                self.assertIsNone(statistics.search(text))
                self.assertTrue(scene.xpath('.//a[@href="https://tommyyula.github.io/item-ai-plateform-v2/"]'))

    def test_bilingual_titles_match_updated_manifest(self):
        for page_id in PLATFORM_EXECUTION_IDS:
            with self.subTest(page_id=page_id):
                scene = self.meeting.get_element_by_id(page_id)
                for lang, field in (("zh", "title"), ("en", "en")):
                    heading = scene.xpath(f'.//h1/span[@class="{lang}"]')[0].text_content()
                    self.assertEqual(heading, self.pages_by_id[page_id][field])


if __name__ == "__main__":
    unittest.main()
