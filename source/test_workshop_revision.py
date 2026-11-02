"""Minimal regression checks for the current (non-historical) R5 workshop revision."""
import json
import subprocess
from pathlib import Path
import unittest

from lxml import html, etree

ROOT = Path(__file__).resolve().parents[1]

# The former platform/risk sections were 25 pages in total; d48/d49 are retired
# separately while the seven implementation phases remain part of the workshop.
RETIRED_PLATFORM_RISK = {
    "d33_architecture", "d34_writeback", "d35_action_control", "d36_data_hub",
    "d37_model_hub", "d38_marketplace", "d39_dashboard_cost", "d40_runtime",
    "d41_factory", "d42_qualification", "d43_skill_modes", "d44_hollis_governance",
    "d45_knowledge_inputs", "d46_ontology_cycle", "d47_knowledge_states",
    "r5_platform_evolution", "d61_accuracy", "d62_super_agent", "d63_supplyx",
    "d64_copilot", "d65_activity", "d66_business_value", "d67_ap_inventory",
    "d68_ap_reuse", "r4_risk_to_implementation",
}
PHASES = {f"d{number:02d}_phase{number - 51}" for number in range(52, 59)}
REVISION_REFS = {
    "r5_platform_architecture", "r5_product_panorama", "r5_knowledge_foundation",
    "r5_delivery_boundaries", "r5_implementation_overview", "r5_c01_04",
}


class CurrentWorkshopRevisionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "source/detailed_manifest.json").read_text(encoding="utf-8"))
        cls.brief = json.loads((ROOT / "source/brief_manifest.json").read_text(encoding="utf-8"))
        cls.ids = {page["id"] for page in cls.manifest["pages"]}
        cls.document = html.fromstring((ROOT / "Item_ISS_Meeting_R5.html").read_text(encoding="utf-8"))
        cls.reader = (ROOT / "docs/reader.html").read_text(encoding="utf-8")

    def test_current_chapter_sizes_and_implementation_prefix(self):
        chapter3 = [page for page in self.manifest["pages"] if page["chapter"] == 3]
        chapter4 = [page for page in self.manifest["pages"] if page["chapter"] == 4]
        chapter5 = [page["id"] for page in self.manifest["pages"] if page["chapter"] == 5]
        self.assertEqual(len(chapter3), 3)
        self.assertEqual(len(chapter4), 1)
        self.assertEqual(
            chapter5[:4],
            ["d51_joint_roles", "d50_accelerator", "r5_implementation_overview", "d52_phase1"],
        )

    def test_retired_pages_are_gone_and_seven_phases_remain(self):
        self.assertTrue(RETIRED_PLATFORM_RISK.isdisjoint(self.ids))
        self.assertFalse({"d48_best_practice", "d49_reform_process"} & self.ids)
        self.assertTrue(PHASES <= self.ids)
        scenes = {node.get("id") for node in self.document.xpath('//section[@class="scene"]')}
        self.assertTrue(RETIRED_PLATFORM_RISK.isdisjoint(scenes))
        self.assertTrue(PHASES <= scenes)

    def test_product_knowledge_revision_pages_and_new_refs_exist(self):
        self.assertTrue(REVISION_REFS <= self.ids)
        product = self.document.get_element_by_id("r5_product_panorama")
        knowledge = self.document.get_element_by_id("r5_knowledge_foundation")
        # Keep this intentionally content-level: native slide class names may evolve,
        # while these two counts are the workshop promises being protected.
        self.assertRegex(product.text_content(), r"22")
        self.assertRegex(knowledge.text_content(), r"(?:4|四)")
        for page in self.manifest["pages"]:
            for ref in page.get("refs", [page["md"]]):
                anchor = "md-" + ref.replace(".", "-")
                self.assertIn(f'id="{anchor}"', self.reader, msg=f"missing reader ref {ref}")

    def test_brief_objectives_is_current_revision_page(self):
        brief_ids = {page["id"] for page in self.brief["pages"]}
        self.assertIn("b5_01_objectives", brief_ids)
        pre_read = html.fromstring((ROOT / "Item_ISS_PreRead_R5.html").read_text(encoding="utf-8"))
        self.assertIsNotNone(pre_read.get_element_by_id("b5_01_objectives"))

    def test_all_22_product_names_and_four_knowledge_inputs_are_present(self):
        product = self.document.get_element_by_id("r5_product_panorama").text_content()
        expected = ["ItemGPT", "ItemClaw", "ItemFlow", "ItemSense", "ItemPredict", "ItemOps AI", "ItemAudit", "ItemVision", "ItemVoice", "ItemSupport", "ItemGrow", "ItemDoc", "ItemChain", "ItemDock", "ItemTrade", "ItemFin", "ItemDine", "ItemEstate", "ItemBuild", "ItemHealth", "ItemAuto", "ItemRetail"]
        for name in expected:
            self.assertIn(name, product)
        knowledge = self.document.get_element_by_id("r5_knowledge_foundation")
        self.assertEqual(len(knowledge.xpath('.//section[@class="input"]')), 4)
        overview = self.document.get_element_by_id("r5_implementation_overview")
        self.assertEqual(len(overview.xpath('.//section[@class="phase"]')), 7)

    def test_embedded_reader_uses_current_condensed_content(self):
        reader = self.document.get_element_by_id("reader-content")
        self.assertIn("产品全景：12 个通用应用", reader.text_content())
        self.assertIn("七阶段总图：业务轴", reader.text_content())
        self.assertFalse(reader.xpath('.//*[@id="md-D1-4-6"]'))
        self.assertIn("会议目的不是寻找一个 Hero 案例", reader.text_content())

    def test_untouched_rendered_slide_containers_match_accepted_version(self):
        revised = REVISION_REFS | {"b5_01_objectives", "r5_c09_00"}
        for filename in ("Item_ISS_Meeting_R5.html", "Item_ISS_PreRead_R5.html"):
            before = html.fromstring(subprocess.check_output(["git", "show", f"HEAD:{filename}"], cwd=ROOT, text=True))
            after = html.fromstring((ROOT / filename).read_text())
            for scene in after.xpath('//section[@class="scene"]'):
                page_id = scene.get("id")
                if page_id in revised:
                    continue
                old_scene = before.get_element_by_id(page_id)
                selector = './div[contains(concat(" ", normalize-space(@class), " "), " slide-container ")]'
                with self.subTest(page_id=page_id):
                    self.assertEqual(etree.tostring(old_scene.xpath(selector)[0]), etree.tostring(scene.xpath(selector)[0]))


if __name__ == "__main__":
    unittest.main()
