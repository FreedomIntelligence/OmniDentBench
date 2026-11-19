"""Exercise the public CLI with synthetic cases and deterministic, offline API replies."""

import base64
import hashlib
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from evaluation.__main__ import main


# A synthetic one-pixel PNG. No clinical image or provider account is required.
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOor68H"
    "AAL+AX66JXAlAAAAAElFTkSuQmCC"
)
FLAG = "Selected the forbidden test action"
ENV = {
    "ODB_MODEL_BASE_URL": "https://model.example.invalid/v1",
    "ODB_JUDGE_BASE_URL": "https://judge.example.invalid/v1",
    "ODB_MODEL_API_KEY": "offline-model-key",
    "ODB_JUDGE_API_KEY": "offline-judge-key",
}


def case(index, kind, stem):
    reference = {
        "subjective_answer": "",
        "subjective_directions": "",
        "objective_exact_answers": [],
        "objective_multiple_answers": [],
    }
    rubric = None
    options = None
    if kind == "objective_exact":
        reference["objective_exact_answers"] = ["reference-only"]
    elif kind == "objective_multiple":
        reference["objective_multiple_answers"] = ["A"]
        options = [{"key": "A", "text": "Alpha"}, {"key": "B", "text": "Beta"}]
    else:
        reference["subjective_answer"] = "reference-only"
        levels = [
            {"level": i, "score": score, "title": str(score), "description": str(score)}
            for i, score in enumerate((0, 50, 100))
        ]
        rubric = {
            "criteria": [
                {"id": name, "name": name, "description": "rubric-only",
                 "weight": weight, "levels": levels}
                for name, weight in (("criterion-1", 0.6), ("criterion-2", 0.4))
            ],
            "red_flags": [FLAG],
            "global_notes": "",
        }
    return {
        "id": f"ODB-{index:04}",
        "question_type": kind,
        "question_content": stem,
        "question_options": options,
        "golden_answer": reference,
        "answer_explanation": "explanation-only",
        "attachments": [],
        "specialty": "specialty-only",
        "source_pmcid": "PMC999999999",
        "rubric": rubric,
    }


def with_image(item):
    digest = hashlib.sha256(PNG).hexdigest()
    item["attachments"] = [{
        "file_name": "Figure.png",
        "mime_type": "image/png",
        "path": f"data/images/{digest}.png",
        "sha256": digest,
    }]
    return item


def rubric_judgment(flags):
    return {
        "criteria_scores": [
            {"criterion_id": "criterion-1", "score": 50},
            {"criterion_id": "criterion-2", "score": 100},
        ],
        "red_flags_triggered": flags,
        # Deliberately inconsistent. The evaluator must recompute from the rubric.
        "total_score": 99,
    }


def response(content):
    return {"choices": [{"message": {"content": content}}]}


class OfflineEvaluation(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.root = Path(folder.name)
        self.data = self.root / "data"
        self.output = self.root / "results"

    def write_cases(self, language, items):
        directory = self.data / language
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "items.json").write_text(
            json.dumps({"language": language, "items": items}, ensure_ascii=False),
            encoding="utf-8",
        )

    def evaluate(self, language, reply, *extra):
        argv = [
            "--data-dir", str(self.data), "--language", language, "--model", "test-model",
            "--judge", "test-judge", "--output", str(self.output), *extra,
        ]
        with patch.dict(os.environ, ENV, clear=True), patch(
            "evaluation.client.post_json", side_effect=reply
        ):
            main(argv)
        scores = [
            json.loads(line) for line in (self.output / "scores.jsonl").read_text().splitlines()
        ]
        return scores, json.loads((self.output / "summary.json").read_text())

    def test_answers_reach_only_judge_and_fixed_denominators_include_invalid_answers(self):
        self.write_cases("ar", [
            with_image(case(1, "objective_exact", "رمز الاختبار [exact]")),
            case(2, "objective_multiple", "[multiple]"),
            case(3, "subjective", "[weighted]"),
            case(4, "subjective", "[flagged]"),
            case(5, "subjective", "[invalid]"),
        ])
        image_dir = self.data / "images"
        image_dir.mkdir()
        digest = hashlib.sha256(PNG).hexdigest()
        (image_dir / f"{digest}.png").write_bytes(PNG)

        def reply(url, payload, key):
            messages = json.dumps(payload["messages"], ensure_ascii=False)
            if payload["model"] == "test-model":
                self.assertEqual(key, ENV["ODB_MODEL_API_KEY"])
                self.assertTrue(url.startswith(ENV["ODB_MODEL_BASE_URL"]))
                for hidden in ("reference-only", "rubric-only", "specialty-only",
                               "explanation-only", "PMC999999999", FLAG):
                    self.assertNotIn(hidden, messages)
                if "[exact]" in messages:
                    self.assertIn("رمز الاختبار", messages)
                    self.assertIn(base64.b64encode(PNG).decode(), messages)
                if "[multiple]" in messages:
                    self.assertIn("A. Alpha", messages)
                    self.assertIn("B. Beta", messages)
                if "[invalid]" in messages:
                    return response("{}")
                return response(json.dumps({"answer": "B" if "[multiple]" in messages else "trial"}))
            self.assertEqual(payload["model"], "test-judge")
            self.assertEqual(key, ENV["ODB_JUDGE_API_KEY"])
            self.assertTrue(url.startswith(ENV["ODB_JUDGE_BASE_URL"]))
            self.assertNotIn("[invalid]", messages)
            if "[weighted]" in messages or "[flagged]" in messages:
                self.assertIn("rubric-only", messages)
                return response(json.dumps(rubric_judgment([FLAG] if "[flagged]" in messages else [])))
            if "[exact]" in messages:
                self.assertIn("reference-only", messages)
            return response(json.dumps({"total_score": 0 if "[multiple]" in messages else 100}))

        scores, summary = self.evaluate("ar", reply)
        rows = {row["item_id"]: row for row in scores}
        self.assertEqual([rows[f"ODB-{i:04}"]["score"] for i in range(1, 6)],
                         [100, 0, 70, 0, 0])
        self.assertEqual(rows["ODB-0004"]["red_flags_triggered"], [FLAG])
        self.assertEqual(rows["ODB-0005"]["status"], "invalid_response")
        self.assertIsNone(rows["ODB-0005"]["red_flags_triggered"])
        self.assertEqual(summary["objective"]["valid"], 2)
        self.assertEqual(summary["objective"]["mean_score"], 50)
        self.assertEqual(summary["subjective"]["n"], 3)
        self.assertEqual(summary["subjective"]["valid"], 2)
        self.assertAlmostEqual(summary["subjective"]["mean_score"], 70 / 3, places=3)

    def test_missing_visual_material_does_not_become_a_model_error(self):
        self.write_cases("en", [with_image(case(1, "objective_exact", "Needs a figure"))])
        scores, summary = self.evaluate("en", self.unexpected_api)
        self.assertEqual(scores[0]["status"], "missing_assets")
        self.assertIsNone(scores[0]["score"])
        self.assertFalse(summary["complete"])
        self.assertIsNone(summary["objective"]["mean_score"])

    def test_available_subset_respects_figure_inventory_and_detects_missing_files(self):
        missing = with_image(case(2, "objective_exact", "Declared bundled"))
        withheld = with_image(case(3, "objective_exact", "Declared withheld"))
        digest = hashlib.sha256(b"unavailable").hexdigest()
        withheld["attachments"][0].update(sha256=digest, path=f"data/images/{digest}.png")
        self.write_cases("en", [case(1, "objective_exact", "Text item"), missing, withheld])
        (self.data / "figures.csv").write_text(
            "sha256,distribution\n"
            + missing["attachments"][0]["sha256"] + ",bundled\n"
            + digest + ",withheld\n"
        )

        def reply(url, payload, key):
            self.assertIn("Text item", json.dumps(payload["messages"]))
            content = {"answer": "trial"} if payload["model"] == "test-model" else {"total_score": 100}
            return response(json.dumps(content))

        scores, summary = self.evaluate("en", reply, "--available-only")
        self.assertEqual([row["item_id"] for row in scores], ["ODB-0001", "ODB-0002"])
        self.assertEqual(scores[1]["status"], "missing_assets")
        self.assertEqual(summary["scope"], "available_only")
        self.assertEqual(summary["language_items"], 3)
        self.assertEqual(summary["filtered_out"], 1)
        self.assertFalse(summary["complete"])

    @staticmethod
    def unexpected_api(*args, **kwargs):
        raise AssertionError("A case requiring unavailable visual evidence reached the API.")

    def test_malformed_judgment_does_not_zero_a_valid_answer(self):
        self.write_cases("en", [case(1, "subjective", "Review both criteria")])
        attempts = []

        def reply(url, payload, key):
            if payload["model"] == "test-model":
                return response('{"answer": "trial"}')
            attempts.append(None)
            bad = rubric_judgment([])
            bad["criteria_scores"][0]["score"] = 75  # absent from rubric levels
            return response(json.dumps(bad))

        scores, summary = self.evaluate("en", reply)
        self.assertGreater(len(attempts), 1)
        self.assertEqual(scores[0]["status"], "judge_failed")
        self.assertIsNone(scores[0]["score"])
        self.assertIsNone(scores[0]["red_flags_triggered"])
        self.assertFalse(summary["complete"])
        self.assertEqual(summary["subjective"]["valid"], 1)
        self.assertIsNone(summary["subjective"]["mean_score"])

    def test_text_only_selects_language_and_excludes_visual_items(self):
        self.write_cases("en", [case(1, "objective_exact", "Unselected language")])
        self.write_cases("ja", [
            with_image(case(1, "objective_exact", "Excluded visual item")),
            case(2, "objective_exact", "選択された設問"),
        ])

        def reply(url, payload, key):
            messages = json.dumps(payload["messages"], ensure_ascii=False)
            self.assertIn("選択された設問", messages)
            self.assertNotIn("Excluded visual item", messages)
            self.assertNotIn("Unselected language", messages)
            content = {"answer": "trial"} if payload["model"] == "test-model" else {"total_score": 100}
            return response(json.dumps(content))

        scores, summary = self.evaluate("ja", reply, "--text-only")
        self.assertEqual([row["item_id"] for row in scores], ["ODB-0002"])
        self.assertEqual(summary["objective"]["n"], 1)
        self.assertEqual(summary["objective"]["mean_score"], 100)


if __name__ == "__main__":
    unittest.main()
