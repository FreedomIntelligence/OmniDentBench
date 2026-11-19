"""Run a model and a judge on one language edition of OmniDentBench."""

import argparse
import base64
import csv
import hashlib
import json
from pathlib import Path

from . import client, prompts
from .scoring import extract_answer, grade, summarize


LANGUAGES = ("en", "zh-CN", "zh-HK", "es", "fr", "de", "ja", "ar")
MODEL_OPTIONS = {"temperature", "top_p", "top_k", "reasoning_effort", "max_tokens",
                 "max_completion_tokens", "thinking"}


class MissingAsset(ValueError):
    pass


def model_messages(item, data_dir):
    """Use only the model-visible fields. Preserve the order of figure attachments."""
    images = []
    assets = item["attachments"]
    for asset in assets:
        path = Path(asset["path"])
        if path.parts[:2] != ("data", "images") or ".." in path.parts:
            raise ValueError("Invalid relative asset path.")
        image_path = data_dir.joinpath(*path.parts[1:]).resolve()
        if not image_path.is_relative_to(data_dir.resolve() / "images"):
            raise ValueError("Image outside data/images.")
        try:
            image = image_path.read_bytes()
        except FileNotFoundError:
            raise MissingAsset("Image absent from local dataset.") from None
        if hashlib.sha256(image).hexdigest() != asset["sha256"]:
            raise MissingAsset("Image checksum does not match dataset.")
        encoded = base64.b64encode(image).decode("ascii")
        images.append({"type": "image_url", "image_url": {
            "url": f"data:{asset['mime_type']};base64,{encoded}", "detail": "high",
        }})
    kind = item["question_type"]
    options = None
    if kind == "objective_multiple":
        options = "\n".join(f"{option['key']}. {option['text']}" if isinstance(option, dict)
                            else str(option) for option in item["question_options"])
    text = prompts.build_filtering_user_prompt(item["question_content"], options, kind, assets)
    return prompts.FILTERING_SYSTEM_PROMPTS[kind], text, images


def evaluate_item(item, data_dir, target, judge, args, model_options, judge_options):
    kind = item["question_type"]
    result = {"item_id": item["id"], "question_type": kind, "status": None, "score": None,
              "answer": None, "criterion_scores": None, "red_flags_triggered": None}
    try:
        system, message, images = model_messages(item, data_dir)
        raw, answer = client.completion(target, args.model, system, message, images,
                                        model_options, extract_answer)
    except MissingAsset as exc:
        return {**result, "status": "missing_assets", "reason": str(exc)}
    except client.InvalidResponse as exc:
        return {**result, "status": "invalid_response", "score": 0, "reason": str(exc)}
    except client.RequestFailure as exc:
        return {**result, "status": "model_failed", "score": 0, "reason": str(exc)}

    result["answer"] = answer
    message = prompts.build_judge_user_prompt(item["question_content"], answer, raw,
                                              item["golden_answer"], kind, item.get("rubric"))
    try:
        _, (score, criteria, flags) = client.completion(
            judge, args.judge, prompts.JUDGE_SYSTEM_PROMPTS[kind], message, [],
            judge_options, lambda judgment: grade(item, judgment),
        )
    except (client.RequestFailure, client.InvalidResponse) as exc:
        return {**result, "status": "judge_failed", "reason": str(exc)}
    return {**result, "status": "scored", "score": score, "criterion_scores": criteria,
            "red_flags_triggered": flags}


def write_json(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def items_with_bundled_images(items, figures):
    """Select by declared distribution so damage to a bundled file stays visible."""
    availability = {}
    for row in csv.DictReader(figures.splitlines()):
        digest, status = row["sha256"], row["distribution"]
        if status not in {"bundled", "withheld"} or availability.get(digest, status) != status:
            raise ValueError("Inconsistent distribution status in figures.csv.")
        availability[digest] = status
    selected = []
    for item in items:
        statuses = [availability.get(asset["sha256"]) for asset in item["attachments"]]
        if None in statuses:
            raise ValueError("Attachment missing from figures.csv.")
        if "withheld" not in statuses:
            selected.append(item)
    return selected


def run(args):
    file = args.data_dir / args.language / "items.json"
    data = file.read_bytes()
    dataset = json.loads(data)
    if dataset["language"] != args.language:
        raise ValueError("Language mismatch in input file.")
    all_items = dataset["items"]
    ids = [item["id"] for item in all_items]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate item IDs.")
    items = all_items
    selection = "full"
    figure_hash = None
    if args.text_only:
        selection = "text_only"
        items = [item for item in items if not item["attachments"]]
    if args.available_only:
        selection = "available_only"
        figures = (args.data_dir / "figures.csv").read_bytes()
        figure_hash = hashlib.sha256(figures).hexdigest()
        items = items_with_bundled_images(items, figures.decode("utf-8-sig"))
    if args.limit is not None:
        if args.limit < 1:
            raise ValueError("--limit must be positive.")
        items = items[:args.limit]
    if not items:
        raise ValueError("No items selected.")
    selection_info = {
        "scope": "subset" if args.limit else selection,
        "available_only": args.available_only, "text_only": args.text_only, "limit": args.limit,
        "language_items": len(all_items), "selected_items": len(items),
        "filtered_out": len(all_items) - len(items),
    }

    options = json.loads(args.model_options.read_text(encoding="utf-8")) if args.model_options else {}
    if not isinstance(options, dict) or set(options) - MODEL_OPTIONS:
        raise ValueError("--model-options must be a JSON object containing supported inference options.")
    judge_options = {"max_tokens": args.judge_max_tokens}
    if args.judge_max_tokens < 1:
        raise ValueError("--judge-max-tokens must be positive.")
    target, judge = client.endpoint("model"), client.endpoint("judge")
    args.output.mkdir(parents=True, exist_ok=False)
    # A missing summary identifies a partial run. Never overwrite earlier results.
    manifest = {
        "language": args.language, "dataset_sha256": hashlib.sha256(data).hexdigest(),
        "model": args.model, "model_options": options, "judge": args.judge,
        "judge_options": judge_options, "protocol": "OpenAI-compatible chat completions",
        "prompt_file_sha256": hashlib.sha256(Path(prompts.__file__).read_bytes()).hexdigest(),
        "figure_manifest_sha256": figure_hash, **selection_info,
    }
    write_json(args.output / "manifest.json", manifest)
    rows = []
    with (args.output / "scores.jsonl").open("x", encoding="utf-8") as stream:
        for item in items:
            result = evaluate_item(item, args.data_dir, target, judge, args, options, judge_options)
            stream.write(json.dumps(result, ensure_ascii=False) + "\n")
            stream.flush()
            rows.append(result)
    write_json(args.output / "summary.json", {**selection_info, **summarize(rows, selection_info["scope"])})


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--language", required=True, choices=LANGUAGES)
    parser.add_argument("--model", required=True, help="Provider's model ID.")
    parser.add_argument("--judge", default="deepseek-flash", help="Judge model ID (default: %(default)s).")
    parser.add_argument("--data-dir", type=Path, default=Path(__file__).resolve().parents[1] / "data")
    parser.add_argument("--output", type=Path, required=True, help="New directory for this run.")
    selection = parser.add_mutually_exclusive_group()
    selection.add_argument("--text-only", action="store_true", help="Select items with zero image references.")
    selection.add_argument("--available-only", action="store_true",
                           help="Select text items and cases whose figures are all marked bundled.")
    parser.add_argument("--limit", type=int, help="Evaluate only the first N selected items.")
    parser.add_argument("--judge-max-tokens", type=int, default=65536)
    parser.add_argument("--model-options", type=Path,
                        help="JSON file containing one or more of: " + ", ".join(sorted(MODEL_OPTIONS)))
    args = parser.parse_args(argv)
    try:
        run(args)
    except (ValueError, OSError, client.EndpointError) as exc:
        parser.exit(2, f"Evaluation stopped: {exc}\n")


if __name__ == "__main__":
    main()
