"""Convert judge outputs into fixed-denominator benchmark scores."""

import re
from collections import Counter

from .client import InvalidResponse
from .prompts import extract_filtering_answer


def _normalize_red_flag(text):
    return re.sub(r"\s+", " ", text).strip().rstrip(".。")


def _red_flag_prefix(text):
    return re.split(r"[:：]", text, maxsplit=1)[0].strip()


def extract_answer(parsed):
    if not parsed.get("answer") and parsed.get("answer") != 0:
        raise InvalidResponse("A non-empty top-level answer field is required.")
    # Keep provider aliases out of responses lacking a usable primary answer.
    answer = extract_filtering_answer({"answer": parsed["answer"]})
    if not answer.strip():
        raise InvalidResponse("A non-empty top-level answer field is required.")
    return answer


def grade(item, judgment):
    if item["question_type"] != "subjective":
        value = judgment.get("total_score")
        if isinstance(value, bool) or value not in (0, 100):
            raise InvalidResponse("Objective total_score must be 0 or 100.")
        return float(value), None, None

    criteria = item["rubric"]["criteria"]
    rows = judgment.get("criteria_scores")
    if not isinstance(rows, list):
        raise InvalidResponse("criteria_scores must list every rubric criterion.")
    scores = {}
    for row in rows:
        if not isinstance(row, dict):
            raise InvalidResponse("Each criterion score must be an object.")
        identifier = row.get("criterion_id") or row.get("id")
        if not isinstance(identifier, str) or identifier in scores:
            raise InvalidResponse("Missing or duplicate criterion ID.")
        try:
            if isinstance(row["score"], bool):
                raise ValueError
            scores[identifier] = float(row["score"])
        except (KeyError, TypeError, ValueError):
            raise InvalidResponse("Each criterion needs a numeric score.") from None
    if set(scores) != {c["id"] for c in criteria}:
        raise InvalidResponse("Criterion IDs must match the rubric exactly.")
    for criterion in criteria:
        allowed = {float(level["score"]) for level in criterion["levels"]}
        if scores[criterion["id"]] not in allowed:
            raise InvalidResponse("Criterion score must match a rubric level.")
    flags = judgment.get("red_flags_triggered", judgment.get("triggered_red_flags"))
    if not isinstance(flags, list) or not all(isinstance(f, str) and f.strip() for f in flags):
        raise InvalidResponse("red_flags_triggered must be an array of flag descriptions.")
    rubric_flags = item["rubric"].get("red_flags") or []
    for flag in flags:
        normalized = _normalize_red_flag(flag)
        matches = [entry for entry in rubric_flags if _normalize_red_flag(entry) == normalized]
        if not matches:
            prefix = _red_flag_prefix(flag)
            matches = [entry for entry in rubric_flags if _red_flag_prefix(entry) == prefix]
        if len(matches) != 1:
            raise InvalidResponse("Each red flag must match a unique red flag in the rubric.")
    total = sum(float(c["weight"]) * scores[c["id"]] for c in criteria)
    return 0.0 if flags else round(total, 4), scores, flags


def summarize(rows, scope):
    report = {"scope": scope, "complete": all(r["score"] is not None for r in rows),
              "status_counts": dict(Counter(r["status"] for r in rows))}
    for name in ("objective", "subjective"):
        group = [r for r in rows if r["question_type"].split("_")[0] == name]
        mean = None
        if group and all(r["score"] is not None for r in group):
            mean = sum(r["score"] for r in group) / len(group)
        report[name] = {
            "n": len(group), "valid": sum(r["answer"] is not None for r in group),
            "scored": sum(r["status"] == "scored" for r in group), "mean_score": mean,
        }
    return report
