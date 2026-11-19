# OmniDentBench

OmniDentBench (ODB) evaluates dental reasoning across 12 specialties. Each of its eight editions contains the same 1,178 items from 1,020 source articles. There are 605 exact-answer questions, 108 multiple-choice questions and 465 rubric-scored open-ended questions.

The eight editions share the same item IDs and all **2,141 images**. [Project website](https://freedomintelligence.github.io/OmniDentBench/)

## Repository layout

```text
OmniDentBench/
├── data/
│   ├── <language>/items.json   # Benchmark items for each language
│   ├── images/                # Shared figures
│   ├── figures.csv            # Figure sources and licences
│   └── sources.csv            # Source articles and attribution
├── evaluation/                # Model inference, judging and scoring
└── tests/                     # Offline tests
```

## Run an evaluation

Use Python 3.10 or newer. From the root of a downloaded checkout, install the evaluator and run the offline tests.

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
```

Copy `.env.example` to `.env`, fill in the API bases and keys for your model and judge, then load it. Both endpoints must support OpenAI-compatible chat completions with JSON output. The target model also needs image support for multimodal items. Each run writes to a new output directory.

```sh
cp .env.example .env
# Edit .env, then load the completed file.
. ./.env
python -m evaluation --language en --model YOUR_MODEL_ID --judge deepseek-flash \
  --limit 3 --output runs/smoke
```

Remove `--limit 3` for a full run. Use `--text-only` for the 79 items that require no images. Set `--judge` to the model ID at your judge endpoint. Pass `--model-options options.json` for model-specific settings such as `{"reasoning_effort":"medium"}`.

| Language | CLI value | Language | CLI value |
|---|---|---|---|
| English | `en` | Simplified Chinese | `zh-CN` |
| Traditional Chinese (Hong Kong) | `zh-HK` | Spanish | `es` |
| French | `fr` | German | `de` |
| Japanese | `ja` | Modern Standard Arabic | `ar` |

## Data and figures

Each `data/<language>/items.json` contains questions, answer options, reference answers, scoring rubrics and image references. Item IDs are shared across languages. The translations were machine-checked and revised against the source text. Experts reviewed a shared sample of 118 items.

The repository includes all figures for the 1,099 image-supported items. The figure manifest maps images to source articles and lists licences where available. Consult the original article for figure-specific credits and reuse terms. Some images retain their original embedded metadata. [Figure manifest](data/figures.csv) · [Source articles](data/sources.csv)

## Scores and coverage

The judge grades both objective formats as 0 or 100. The objective mean on this scale is percentage accuracy. For open-ended items the evaluator combines the judge's criterion scores using the item-specific rubric weights. A triggered safety red flag sets the final item score to zero.

`scores.jsonl` contains one record per selected item. `summary.json` reports separate objective and open-ended means, selected denominators, valid answer counts, successfully judged counts and failure counts. Invalid or blocked target-model answers receive zero and stay in the selected denominator. Missing or corrupt figures and failed judgments leave the item score unresolved and the affected group mean unavailable. Unassessed red flags remain unknown. Authentication or service configuration failures stop the run. A run that stops before completion has no final summary.

`manifest.json` records the language, item selection, and model and judge settings. Include these details and the item denominator when reporting scores.

## Rights and citation

The evaluation code is available under the [MIT License](LICENSE). Original benchmark content for which the OmniDentBench contributors hold licensing rights is available under [CC BY 4.0](data/LICENSE). Third-party figures and other source material retain their applicable terms. Use the figure manifest and the source article to verify attribution and reuse rights.

Cite *OmniDentBench (ODB)* with the release tag or Git commit you used.
