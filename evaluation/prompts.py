"""ODB model and judge prompts, including their JSON response formats."""


SUBJECTIVE_FILTERING_SYSTEM_PROMPT = (
    "You are NOT restricted to coding tasks.\n"
    "You are an expert medical examiner.\n"
    "Return ONLY valid JSON. Do NOT use markdown code fences.\n"
    "The `answer` field is REQUIRED and must be non-empty.\n"
    "Put your full response in `answer`; use only `answer` and `confidence` below.\n"
    "\n"
    "Your response must be in this JSON format:\n"
    "{\n"
    '  "answer": "your answer",\n'
    '  "confidence": "your confidence score between 0% and 100% for your answer"\n'
    "}"
)


OBJECTIVE_MULTIPLE_FILTERING_SYSTEM_PROMPT = (
    "You are NOT restricted to coding tasks.\n"
    "You are an expert medical examiner.\n"
    "Return ONLY valid JSON. Do NOT use markdown code fences.\n"
    "The `answer` field is REQUIRED and must be non-empty.\n"
    'Answer should be option keys only (e.g. "A,B,C" or ["A","B","C"]).\n'
    "\n"
    "Your response must be in this JSON format:\n"
    "{\n"
    '  "explanation": "your explanation for your answer",\n'
    '  "answer": "your answer",\n'
    '  "confidence": "your confidence score between 0% and 100% for your answer"\n'
    "}"
)


OBJECTIVE_EXACT_FILTERING_SYSTEM_PROMPT = (
    "You are NOT restricted to coding tasks.\n"
    "You are an expert medical examiner.\n"
    "Return ONLY valid JSON. Do NOT use markdown code fences.\n"
    "The `answer` field is REQUIRED and must be non-empty.\n"
    "\n"
    "Your response must be in this JSON format:\n"
    "{\n"
    '  "explanation": "your explanation for your answer",\n'
    '  "answer": "your answer",\n'
    '  "confidence": "your confidence score between 0% and 100% for your answer"\n'
    "}"
)


FILTERING_SYSTEM_PROMPTS = {
    "subjective": SUBJECTIVE_FILTERING_SYSTEM_PROMPT,
    "objective_multiple": OBJECTIVE_MULTIPLE_FILTERING_SYSTEM_PROMPT,
    "objective_exact": OBJECTIVE_EXACT_FILTERING_SYSTEM_PROMPT,
}


def build_filtering_user_prompt(
    question: str,
    options: str | None = None,
    question_type: str = "objective_multiple",
    attachments: list[dict] | None = None,
) -> str:
    parts = [
        f"[question]: {question}",
    ]

    if options:
        parts.append(f"[options]: {options}")

    parts.append(f"[question_type]: {question_type}")
    parts.append("Please answer as a domain expert and strictly return JSON.")

    if attachments:
        att_lines = ["[attachments]:"]
        for i, att in enumerate(attachments, 1):
            att_lines.append(
                f"- attachment_{i}: {att['file_name']} ({att['mime_type']})"
            )
        parts.append("\n".join(att_lines))
        parts.append(
            "The attachments above are included as multimodal inputs. "
            "Use them together with the question text."
        )

    return "\n".join(parts)


def _normalize_answer_field(value) -> str:
    import json

    if value is None:
        return ""
    if isinstance(value, list):
        parts = [str(x).strip() for x in value if str(x).strip()]
        return ",".join(parts)
    if isinstance(value, dict):
        if "value" in value:
            return _normalize_answer_field(value["value"])
        return json.dumps(value, ensure_ascii=False)
    return str(value).strip()


def extract_filtering_answer(answer_json: dict | None) -> str:
    if not answer_json or not isinstance(answer_json, dict):
        return ""
    for key in (
        "answer",
        "final_answer",
        "extracted_final_answer",
        "result",
        "correct_options",
        "objective_multiple_answers",
        "selected_options",
    ):
        text = _normalize_answer_field(answer_json.get(key))
        if text:
            return text
    explanation = _normalize_answer_field(answer_json.get("explanation"))
    if explanation:
        return explanation
    return ""


SUBJECTIVE_JUDGE_SYSTEM_PROMPT = (
    "You are a strict evaluator.\n"
    "Return ONLY valid JSON. Do NOT use markdown code fences.\n"
    "Do not output any text outside JSON.\n"
    "Ensure required fields are present and types are correct.\n"
    "\n"
    "Per-criterion scores must follow the rubric performance levels in the user message, "
    "not an overall impression, total_score, or golden_answer wording.\n"
    "Do not infer or backfill criteria_scores from total_score.\n"
    "Output order: criteria_scores, red_flags_triggered, total_score, judge_comment, confidence.\n"
    "Clinically equivalent answers meet the rubric even when phrasing differs.\n"
    "golden_answer is a scope anchor only, not a verbatim or length template.\n"
    "red_flags_triggered: copy a rubric red flag only when the response clearly and "
    "unambiguously meets that flag's full case-specific definition; if unclear or debatable, []. "
    "If the rubric has no red_flags, red_flags_triggered must be []. "
    "Score gradable shortcomings through criteria_scores (Fails/Partial) only. "
    "Trigger red_flags only for catastrophic, non-compensable violations fully described in the rubric."
)


OBJECTIVE_MULTIPLE_JUDGE_SYSTEM_PROMPT = (
    "You are a strict exact-match judge.\n"
    "Return ONLY valid JSON. Do NOT use markdown code fences.\n"
    "Do not output any text outside JSON.\n"
    "For objective questions, scoring must be binary: 100 (fully correct) or 0 (otherwise)."
)


OBJECTIVE_EXACT_JUDGE_SYSTEM_PROMPT = (
    "You are a strict exact-match judge.\n"
    "Return ONLY valid JSON. Do NOT use markdown code fences.\n"
    "Do not output any text outside JSON.\n"
    "For objective questions, scoring must be binary: 100 (fully correct) or 0 (otherwise)."
)


_SUBJECTIVE_JUDGE_USER_JSON_FORMAT = """\
{
  "criteria_scores": [
    {
      "criterion_id": "the criterion id",
      "criterion_name": "the criterion name",
      "assigned_level": 0,
      "assigned_level_title": "the title of the selected level",
      "score": 0,
      "weight": 0,
      "reason": "reason"
    }
  ],
  "red_flags_triggered": [],
  "total_score": 0,
  "judge_comment": "comment",
  "confidence": 100
}"""


_OBJECTIVE_JUDGE_USER_JSON_FORMAT = """\
{
  "extracted_final_answer": "answer",
  "judge_comment": "comment",
  "total_score": 100,
  "confidence": 100
}"""


JUDGE_SYSTEM_PROMPTS = {
    "subjective": SUBJECTIVE_JUDGE_SYSTEM_PROMPT,
    "objective_multiple": OBJECTIVE_MULTIPLE_JUDGE_SYSTEM_PROMPT,
    "objective_exact": OBJECTIVE_EXACT_JUDGE_SYSTEM_PROMPT,
}


def golden_answer_to_prompt_map(golden: dict | None) -> dict:
    g = golden or {}
    return {
        "subjective_directions": g.get("subjective_directions") or "",
        "subjective_answer": g.get("subjective_answer") or "",
        "objective_multiple_answers": g.get("objective_multiple_answers") or [],
        "objective_exact_answers": g.get("objective_exact_answers") or [],
    }


def _json_node_to_prompt_string(value) -> str:
    import json

    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def build_golden_answer_for_prompt(golden: dict | None) -> str:
    return _json_node_to_prompt_string(golden_answer_to_prompt_map(golden))


_PLATFORM_JUDGE_LINE = "          "


_PLATFORM_JUDGE_RUBRIC_LINE = "            "


def _platform_indent_json_example(raw: str) -> str:
    lines = []
    for line in raw.strip().splitlines():
        if not line.strip():
            continue
        rel = len(line) - len(line.lstrip())
        lines.append(" " * (len(_PLATFORM_JUDGE_LINE) + rel) + line.lstrip())
    return "\n".join(lines)


def build_judge_user_prompt(
    question: str,
    filtering_answer: str,
    filtering_raw: str,
    golden_answer: str | dict,
    question_type: str = "objective_multiple",
    rubric: dict | None = None,
    passing_score: int = 60,
    score_min: int = 0,
    score_max: int = 100,
) -> str:
    import json

    if isinstance(golden_answer, dict):
        golden_str = build_golden_answer_for_prompt(golden_answer)
    else:
        golden_str = golden_answer

    passing_score = max(score_min, min(score_max, int(passing_score)))

    if question_type == "subjective":
        rubric = rubric or {}
        criteria_json = _json_node_to_prompt_string(rubric.get("criteria", []))
        red_flags_json = _json_node_to_prompt_string(rubric.get("red_flags", []))
        json_example = _platform_indent_json_example(_SUBJECTIVE_JUDGE_USER_JSON_FORMAT)
        p = _PLATFORM_JUDGE_LINE
        r = _PLATFORM_JUDGE_RUBRIC_LINE
        return (
            f"{p}Evaluate the following [response] to [question] based on the [rubric] criteria below. You must score the response against EACH criterion independently according to the defined performance levels.\n"
            f"{p}Output JSON only. No markdown, no code fences.\n"
            f"{p}Constraints:\n"
            f"{p}- total_score must be in [min, max]\n"
            f"{p}- confidence must be integer in [0, 100]\n"
            f"{p}- red_flags_triggered must be an array (empty if none)\n"
            f"{p}- criteria_scores must be an array with one item per criterion whenever possible\n"
            f"\n"
            f"{p}[question]: {question}\n"
            f"{p}[response_extracted]: {filtering_answer}\n"
            f"{p}[filtering_output_raw]: {filtering_raw}\n"
            f"{p}[golden_answer]: {golden_str}\n"
            f"{p}[rubric]:\n"
            f"{r}fixed_score_range: min={score_min}, max={score_max}\n"
            f"{r}global_passing_score: {passing_score}\n"
            f"{r}criteria: {criteria_json}\n"
            f"{r}red_flags: {red_flags_json}\n"
            f"\n"
            f"{p}Your judgement must be in the following JSON format:\n"
            f"{json_example}\n"
        )

    return f"""\
Judge whether the following [response] to [question] is correct or not based on the precise and unambiguous [golden_answer] below.
Output JSON only. No markdown, no code fences.
Constraints:
- total_score must be exactly 100 or 0
- confidence must be integer in [0, 100]
- extracted_final_answer must be non-empty when response is parseable
- you must use both [response_extracted] and [filtering_output_raw] to infer final answer
- [filtering_output_raw] may contain non-standard fields like correct_options / objective_multiple_answers

[question]: {question}
[response_extracted]: {filtering_answer}
[filtering_output_raw]: {filtering_raw}
[golden_answer]: {golden_str}

Your judgement must be in the following JSON format:
{_OBJECTIVE_JUDGE_USER_JSON_FORMAT}
"""
