# OmniDentBench

OmniDentBench (ODB) evaluates dental reasoning across 12 specialties. Each of its eight editions contains the same 1,178 items from 1,020 source articles. There are 605 exact-answer questions, 108 multiple-choice questions and 465 rubric-scored open-ended questions.

This local release candidate includes all **2,141 images** needed to evaluate a complete edition. The eight editions share the same images and item IDs.

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

Remove `--limit 3` and choose a new output directory to run all 1,178 items. Both runs send requests to the configured services. For a text model, use `--text-only` to select the 79 items that require no images. Use `--model-options options.json` for model-specific settings such as `{"reasoning_effort":"medium"}`. The judge identifier must resolve at your endpoint. Report the exact model and judge identifiers, inference settings, language and item selection with results.

| Language | CLI value | Language | CLI value |
|---|---|---|---|
| English | `en` | Simplified Chinese | `zh-CN` |
| Traditional Chinese (Hong Kong) | `zh-HK` | Spanish | `es` |
| French | `fr` | German | `de` |
| Japanese | `ja` | Modern Standard Arabic | `ar` |

## Data and figures

The `items` array in each `data/<language>/items.json` contains stable IDs shared across languages, a source PMCID, specialty, question type, task tags, question, options, reference answer, explanation, rubric and ordered attachments. The model sees the question, its options and the ordered local images with their figure labels. The judge receives the model response and the scoring reference. The translated editions underwent machine checks and source-guided revisions, with expert review of a shared sample of 118 items.

Across the 1,099 image-supported items, 2,353 figure references point to 2,141 distinct images. Some items reuse an image or need more than one. All figures are bundled, so `--available-only` selects the same 1,178 items as the default full run.

- Use the figure manifest to look up a figure's expected SHA-256 and source article. Where an individual figure label or licence link is blank, consult the original article and its figure credit line. [Figure manifest](data/figures.csv)
- Look up article titles, authors and copyright notices by PMCID. The article record also points to the original publication for any material with its own credit line or terms. [Source articles](data/sources.csv)
- For 254 files, non-rendering metadata was removed and the decoded pixels were verified unchanged. The other 1,887 files retain the benchmark's archived bytes and may include original embedded metadata. The evaluator verifies each image's checksum before inference and records absent or mismatched images as `missing_assets`.
- To check the files delivered with this candidate, run `shasum -a 256 -c SHA256SUMS` or `sha256sum -c SHA256SUMS` at the repository root.

## Scores and coverage

The judge grades both objective formats as 0 or 100. The objective mean on this scale is percentage accuracy. For open-ended items the evaluator combines the judge's criterion scores using the item-specific rubric weights. A triggered safety red flag sets the final item score to zero.

`scores.jsonl` contains one record per selected item. `summary.json` reports separate objective and open-ended means, selected denominators, valid answer counts, successfully judged counts and failure counts. Invalid or blocked target-model answers receive zero and stay in the selected denominator. Missing or corrupt figures and failed judgments leave the item score unresolved and the affected group mean unavailable. Unassessed red flags remain unknown. Authentication or service configuration failures stop the run. A run that stops before completion has no final summary.

`manifest.json` records the data digest, prompt digest, language, model and judge options, and selection scope. Report the denominator for every estimate. A full run selects 713 objective and 465 open-ended items per language. A text-only run covers 79 items in total.

## Rights and citation

The originating authors and rights holders retain their rights in source articles and figures. Follow each source's terms and attribution requirements. The software and original benchmark-content licences are pending confirmation by the maintainers. This review candidate carries no new licence grant for those components.

For this candidate, identify the resource as *OmniDentBench (ODB)* and record the checkout's commit identifier, the language-file SHA-256 and the item selection. The intended first public repository tag is `v1.0.0`. All editions share the repository tag.
