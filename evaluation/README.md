# OmniDentBench evaluator

Run `python -m evaluation --help` from the repository root for the complete CLI. See the [quick start](../README.md#quick-start) for installation and the [dataset section](../README.md#dataset-and-scoring) for language codes.

## Windows PowerShell

Run these commands from the repository root. Replace all placeholders. Set the two API key variables in the current PowerShell session through your usual secret management workflow before running the evaluator.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

$env:ODB_MODEL_BASE_URL = 'YOUR_MODEL_API_BASE'
$env:ODB_JUDGE_BASE_URL = 'YOUR_JUDGE_API_BASE'
# The evaluator also reads ODB_MODEL_API_KEY and ODB_JUDGE_API_KEY.
.\.venv\Scripts\python.exe -m evaluation --language en --model YOUR_MODEL_ID --judge YOUR_JUDGE_ID --limit 3 --output runs/smoke
```

Use versioned API bases, such as a provider URL ending in `/v1`. The evaluator appends `/chat/completions`.

## Selection and provider options

- Remove `--limit` for a full run. By default the evaluator selects all items for the requested language.
- Use `--text-only` to select the 79 items without image references.
- Use `--available-only` with a partial figure bundle to select items whose referenced images are present. Report this selection when comparing results.
- Pass `--data-dir` to use an alternate data directory and `--model-options options.json` for provider-specific target model options such as `{"reasoning_effort":"medium"}`.
- Use a new `--output` directory per run.

## Scoring and failure handling

The judge scores exact-answer and multiple-choice items as 0 or 100. Their mean is percentage accuracy. For open-ended items, the evaluator combines criterion scores using the item's rubric weights. A triggered safety red flag sets the item score to zero.

Invalid or blocked target-model answers receive zero and stay in the selected denominator. A missing or corrupt figure or a failed judgment leaves the item score unresolved. The affected group mean is unavailable. Unassessed red flags remain unknown. Authentication or service configuration errors stop the run, and a run that stops before completion has no final summary.

| Output | Contents |
| --- | --- |
| `manifest.json` | Language, selection scope, and model and judge configuration |
| `scores.jsonl` | One score record for each selected item in a completed run |
| `summary.json` | Objective and open-ended means, denominators, valid answer counts, judged counts, and failure counts |

Use the manifest and summary when reporting results. Compare models on the same language and item set and report the judge used.

## Code map

| Module | Responsibility |
| --- | --- |
| [`__main__.py`](__main__.py) | CLI, item selection, image loading, and output files |
| [`client.py`](client.py) | Provider configuration, requests, and response handling |
| [`prompts.py`](prompts.py) | Target model and judge prompts |
| [`scoring.py`](scoring.py) | Item scores and summary statistics |

Run the [offline tests](../tests) with `python -m unittest discover -s tests -v`. They use mocked responses and require no API credentials.
