<p align="center">
  <a href="https://freedomintelligence.github.io/OmniDentBench/"><img src="docs/images/atlas/odb-mark.png" width="96" alt="OmniDentBench logo"></a>
</p>

<h1 align="center">OmniDentBench</h1>

<p align="center"><strong>A multilingual, multimodal benchmark for dental AI reasoning</strong></p>

<p align="center">
  <a href="https://freedomintelligence.github.io/OmniDentBench/">Project website</a> ·
  <a href="https://freedomintelligence.github.io/OmniDentBench/zh.html">中文主页</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="data">Explore the data</a> ·
  <a href="#institutions-and-team">Institutions &amp; team</a> ·
  <a href="#citation-and-licensing">Cite</a>
</p>

<p align="center">
  <a href="https://github.com/FreedomIntelligence/OmniDentBench/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/Release-v1.0.0-085d49" alt="Benchmark release v1.0.0"></a>
  <a href="https://github.com/FreedomIntelligence/OmniDentBench/stargazers"><img src="https://img.shields.io/github/stars/FreedomIntelligence/OmniDentBench?style=social" alt="GitHub stars"></a>
</p>

A **benchmark** gives different AI models the same questions and applies the same scoring rules to their answers. OmniDentBench tests how models interpret dental findings and reason across **12 specialties**. Each of its **8 language editions** contains the same **1,178 items**, including **1,099 with figures**.

[![Collaboration map with 16 partner institutions, portraits for 105 team members and a sample dental radiograph](docs/images/atlas/network-overview.png)](https://freedomintelligence.github.io/OmniDentBench/#collaboration-map)

**Try reading a benchmark item.** In ODB-0777, the model sees a dental radiograph and names the root canal configuration. A judge compares its answer with the reference and awards 100 or 0. For an open-ended question, the judge scores each criterion in the item's weighted rubric. [Radiograph by Doumari et al., Fig. 2](https://doi.org/10.7759/cureus.86471) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

| Question format | Items | Scoring |
| --- | ---: | --- |
| Exact answer | 605 | Objective accuracy |
| Multiple choice | 108 | Objective accuracy |
| Open-ended | 465 | Weighted item-specific rubrics with safety red flags |

## Quick start

Install with **Python 3.10+**. Run the commands from the repository root.

```bash
git clone --depth 1 https://github.com/FreedomIntelligence/OmniDentBench.git
cd OmniDentBench
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
```

Copy [`.env.example`](.env.example) to `.env`, set the base URLs and API keys for the model and judge, and load it. Both endpoints must support OpenAI-compatible Chat Completions with JSON output. The target model needs image input for multimodal items. Replace both model ID placeholders below.

```bash
cp .env.example .env
# Fill in the API bases and keys in .env before sourcing.
. ./.env
python -m evaluation --language en --model YOUR_MODEL_ID --judge YOUR_JUDGE_ID --limit 3 --output runs/smoke
```

Remove `--limit 3` to run the full selected language, or add `--text-only` to evaluate the 79 items without figures. Choose a fresh `--output` directory each time. See the [evaluator guide](evaluation/README.md) for PowerShell setup, additional flags, and output files.

## Dataset and scoring

- **Items** are in [`data/<language>/items.json`](data). Files contain questions, answer options where applicable, references, scoring rubrics, and image references. Experts reviewed translations for a shared sample of 118 items.
- **Figures** ship with the repository. See the [figure manifest](data/figures.csv) and [source articles](data/sources.csv) for provenance and reuse terms.

<details>
<summary>Supported languages and CLI codes</summary>

| Language | Code | Language | Code |
| --- | --- | --- | --- |
| English | `en` | Simplified Chinese | `zh-CN` |
| Traditional Chinese (Hong Kong) | `zh-HK` | Spanish | `es` |
| French | `fr` | German | `de` |
| Japanese | `ja` | Modern Standard Arabic | `ar` |

</details>

### Interpretation and reproducibility

Report objective accuracy and the open-ended mean separately. A triggered safety red flag sets the open-ended item score to zero. When publishing results, include the language, item selection, denominators, model and judge IDs, and the exact tag or commit. [Scoring rules and failure handling](evaluation/README.md#scoring-and-failure-handling)

## Institutions and team

OmniDentBench brings together **105 team members** and **16 partner institutions**. [Explore the collaboration map](https://freedomintelligence.github.io/OmniDentBench/#collaboration-map)

### Steering chairs (3)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-059-junwen-wang"><img src="docs/images/team/team-059-junwen-wang.webp" width="60" alt=""><br><sub>Junwen Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-060-zuolin-jin"><img src="docs/images/team/team-060-zuolin-jin.webp" width="60" alt=""><br><sub>Zuolin Jin</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-061-benyou-wang"><img src="docs/images/team/team-061-benyou-wang.webp" width="60" alt=""><br><sub>Benyou Wang</sub></a></td>
  </tr>
</table>

### Steering committee members (13)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-063-walter-yu-hang-lam"><img src="docs/images/team/team-063-walter-yu-hang-lam.webp" width="60" alt=""><br><sub>Walter Yu Hang Lam</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-064-will-wei-qiao"><img src="docs/images/team/team-064-will-wei-qiao.webp" width="60" alt=""><br><sub>Will Wei Qiao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-065-john-adeoye"><img src="docs/images/team/team-065-john-adeoye.webp" width="60" alt=""><br><sub>John Adeoye</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-066-shan-zhiyi"><img src="docs/images/team/team-066-shan-zhiyi.webp" width="60" alt=""><br><sub>Zhiyi Shan</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-067-teddy-weifa-yang"><img src="docs/images/team/team-067-teddy-weifa-yang.webp" width="60" alt=""><br><sub>Wei-fa Yang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-068-xin-li"><img src="docs/images/team/team-068-xin-li.webp" width="60" alt=""><br><sub>Xin Li</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-069-zhongyuan-tang"><img src="docs/images/team/team-069-zhongyuan-tang.webp" width="60" alt=""><br><sub>Zhongyuan Tang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-075-andrew-nalley"><img src="docs/images/team/team-075-andrew-nalley.webp" width="60" alt=""><br><sub>Andrew Nalley</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-076-george-pelekos"><img src="docs/images/team/team-076-george-pelekos.webp" width="60" alt=""><br><sub>George Pelekos</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-077-pradeep-singh"><img src="docs/images/team/team-077-pradeep-singh.webp" width="60" alt=""><br><sub>Pradeep Singh</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-062-liangyi-chen"><img src="docs/images/team/team-062-liangyi-chen.webp" width="60" alt=""><br><sub>Liangyi Chen</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-078-gloria-hai-ming-wong"><img src="docs/images/team/team-078-gloria-hai-ming-wong.webp" width="60" alt=""><br><sub>Gloria Hai Ming Wong</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-079-lijian-jin"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Lijian Jin</sub></a></td>
  </tr>
</table>

### Steering committee student members (8)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-070-junjie-zhao"><img src="docs/images/team/team-070-junjie-zhao.webp" width="60" alt=""><br><sub>Junjie Zhao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-071-ziying-sheng"><img src="docs/images/team/team-071-ziying-sheng.webp" width="60" alt=""><br><sub>Ziying Sheng</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-072-jiajun-you"><img src="docs/images/team/team-072-jiajun-you.webp" width="60" alt=""><br><sub>Jiajun You</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-073-zhenyang-cai"><img src="docs/images/team/team-073-zhenyang-cai.webp" width="60" alt=""><br><sub>Zhenyang Cai</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-074-zhou-su"><img src="docs/images/team/team-074-zhou-su.webp" width="60" alt=""><br><sub>Zhou Su</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-080-jingyi-liang"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Jingyi Liang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-081-zikun-jin"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Zikun Jin</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-082-xiang-liu"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Xiang Liu</sub></a></td>
  </tr>
</table>

### Specialty chairs (12)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-001-ming-zhong"><img src="docs/images/team/team-001-ming-zhong.webp" width="60" alt=""><br><sub>Ming Zhong</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-002-dayong-liu"><img src="docs/images/team/team-002-dayong-liu.webp" width="60" alt=""><br><sub>Dayong Liu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-003-hui-zhang"><img src="docs/images/team/team-003-hui-zhang.webp" width="60" alt=""><br><sub>Hui Zhang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-004-mingming-xu"><img src="docs/images/team/team-004-mingming-xu.webp" width="60" alt=""><br><sub>Mingming Xu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-005-qing-liu"><img src="docs/images/team/team-005-qing-liu.webp" width="60" alt=""><br><sub>Qing Liu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-006-weihua-cai"><img src="docs/images/team/team-006-weihua-cai.webp" width="60" alt=""><br><sub>Weihua Cai</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-007-xiaojing-wang"><img src="docs/images/team/team-007-xiaojing-wang.webp" width="60" alt=""><br><sub>Xiaojing Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-008-yanning-ma"><img src="docs/images/team/team-008-yanning-ma.webp" width="60" alt=""><br><sub>Yanning Ma</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-009-shan-jiang"><img src="docs/images/team/team-009-shan-jiang.webp" width="60" alt=""><br><sub>Shan Jiang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-010-feng-wang"><img src="docs/images/team/team-010-feng-wang.webp" width="60" alt=""><br><sub>Feng Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-011-kun-qi"><img src="docs/images/team/team-011-kun-qi.webp" width="60" alt=""><br><sub>Kun Qi</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-012-yancheng-fang"><img src="docs/images/team/team-012-yancheng-fang.webp" width="60" alt=""><br><sub>Yancheng Fang</sub></a></td>
  </tr>
</table>

### Overseas experts (19)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-085-abdul-warith-akinshipo"><img src="docs/images/team/team-085-abdul-warith-akinshipo.webp" width="60" alt=""><br><sub>Abdul-Warith Akinshipo</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-086-abreham-ayele"><img src="docs/images/team/team-086-abreham-ayele.webp" width="60" alt=""><br><sub>Abreham Ayele</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-087-adetayo-aborisade"><img src="docs/images/team/team-087-adetayo-aborisade.webp" width="60" alt=""><br><sub>Adetayo Aborisade</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-088-antonin-tichy"><img src="docs/images/team/team-088-antonin-tichy.webp" width="60" alt=""><br><sub>Antonin Tichy</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-089-aylin-barthelme"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Aylin Barthelmé</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-090-brandon-c-key"><img src="docs/images/team/team-090-brandon-c-key.webp" width="60" alt=""><br><sub>Brandon C. Key</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-091-chizoba-okolo"><img src="docs/images/team/team-091-chizoba-okolo.webp" width="60" alt=""><br><sub>Chizoba Okolo</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-092-colman-mcgrath"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Colman McGrath</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-093-edward-chin-man"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Edward Chin Man</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-094-ekhosuehi-theophilus-agho"><img src="docs/images/team/team-094-ekhosuehi-theophilus-agho.webp" width="60" alt=""><br><sub>Ekhosuehi Theophilus Agho</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-095-elabbas-elhussain"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Elabbas Elhussain</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-096-falk-schwendicke"><img src="docs/images/team/team-096-falk-schwendicke.webp" width="60" alt=""><br><sub>Falk Schwendicke</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-097-ibrahim-kayode-suleiman"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Ibrahim Kayode Suleiman</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-098-miguel-roig-cayon"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Miguel Roig Cayón</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-099-nasir-bashir"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Nasir Bashir</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-100-olabisi-hajarat-oderinu"><img src="docs/images/team/team-100-olabisi-hajarat-oderinu.webp" width="60" alt=""><br><sub>Olabisi Hajarat Oderinu</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-101-ramat-oyebunmi-braimah"><img src="docs/images/team/team-101-ramat-oyebunmi-braimah.webp" width="60" alt=""><br><sub>Ramat Oyebunmi Braimah</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-102-ricardo-palacios-banuelos"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Ricardo Palacios-Bañuelos</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-103-suresh-kandagal-veerabhadrappa"><img src="docs/images/team/team-103-suresh-kandagal-veerabhadrappa.webp" width="60" alt=""><br><sub>Suresh Kandagal Veerabhadrappa</sub></a></td>
  </tr>
</table>

### ODB Consortium contributors (2)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-104-xiangbo-wu"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Xiangbo Wu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-105-jianquan-li"><img src="docs/images/team/team-anonymous.webp" width="60" alt=""><br><sub>Jianquan Li</sub></a></td>
  </tr>
</table>

### Specialty committee members (48)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-053-yifan-zheng"><img src="docs/images/team/team-053-yifan-zheng.webp" width="60" alt=""><br><sub>Yifan Zheng</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-042-shuwei-huang"><img src="docs/images/team/team-042-shuwei-huang.webp" width="60" alt=""><br><sub>Shuwei Huang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-016-fangjie-zhou"><img src="docs/images/team/team-016-fangjie-zhou.webp" width="60" alt=""><br><sub>Fangjie Zhou</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-048-xue-qiao"><img src="docs/images/team/team-048-xue-qiao.webp" width="60" alt=""><br><sub>Xue Qiao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-039-shiduo-sun"><img src="docs/images/team/team-039-shiduo-sun.webp" width="60" alt=""><br><sub>Shiduo Sun</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-041-shixin-zhang"><img src="docs/images/team/team-041-shixin-zhang.webp" width="60" alt=""><br><sub>Shixin Zhang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-025-junting-wang"><img src="docs/images/team/team-025-junting-wang.webp" width="60" alt=""><br><sub>Junting Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-057-zhiqiang-deng"><img src="docs/images/team/team-057-zhiqiang-deng.webp" width="60" alt=""><br><sub>Zhiqiang Deng</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-034-mingxin-zhang"><img src="docs/images/team/team-034-mingxin-zhang.webp" width="60" alt=""><br><sub>Mingxin Zhang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-024-jinyan-chen"><img src="docs/images/team/team-024-jinyan-chen.webp" width="60" alt=""><br><sub>Jinyan Chen</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-017-fen-liu"><img src="docs/images/team/team-017-fen-liu.webp" width="60" alt=""><br><sub>Fen Liu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-021-jiamin-zhao"><img src="docs/images/team/team-021-jiamin-zhao.webp" width="60" alt=""><br><sub>Jiamin Zhao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-022-jiaming-zhang"><img src="docs/images/team/team-022-jiaming-zhang.webp" width="60" alt=""><br><sub>Jiaming Zhang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-030-menghong-li"><img src="docs/images/team/team-030-menghong-li.webp" width="60" alt=""><br><sub>Menghong Li</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-028-lin-zhao"><img src="docs/images/team/team-028-lin-zhao.webp" width="60" alt=""><br><sub>Lin Zhao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-040-shirong-he"><img src="docs/images/team/team-040-shirong-he.webp" width="60" alt=""><br><sub>Shirong He</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-052-yidan-guo"><img src="docs/images/team/team-052-yidan-guo.webp" width="60" alt=""><br><sub>Yidan Guo</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-033-minghui-wei"><img src="docs/images/team/team-033-minghui-wei.webp" width="60" alt=""><br><sub>Minghui Wei</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-056-zhenlai-zhu"><img src="docs/images/team/team-056-zhenlai-zhu.webp" width="60" alt=""><br><sub>Zhenlai Zhu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-045-wu-songying"><img src="docs/images/team/team-045-wu-songying.webp" width="60" alt=""><br><sub>Songying Wu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-054-ying-wang"><img src="docs/images/team/team-054-ying-wang.webp" width="60" alt=""><br><sub>Ying Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-027-lei-shi"><img src="docs/images/team/team-027-lei-shi.webp" width="60" alt=""><br><sub>Lei Shi</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-044-tai-pak-chuen-patrick"><img src="docs/images/team/team-044-tai-pak-chuen-patrick.webp" width="60" alt=""><br><sub>Pak Chuen Patrick Tai</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-050-yaqiu-zhang"><img src="docs/images/team/team-050-yaqiu-zhang.webp" width="60" alt=""><br><sub>Yaqiu Zhang</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-037-peng-chen"><img src="docs/images/team/team-037-peng-chen.webp" width="60" alt=""><br><sub>Peng Chen</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-019-fujia-kang"><img src="docs/images/team/team-019-fujia-kang.webp" width="60" alt=""><br><sub>Fujia Kang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-032-min-huang"><img src="docs/images/team/team-032-min-huang.webp" width="60" alt=""><br><sub>Min Huang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-047-xiangjie-jin"><img src="docs/images/team/team-047-xiangjie-jin.webp" width="60" alt=""><br><sub>Xiangjie Jin</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-015-dongfei-wang"><img src="docs/images/team/team-015-dongfei-wang.webp" width="60" alt=""><br><sub>Dongfei Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-020-hao-chunxiu"><img src="docs/images/team/team-020-hao-chunxiu.webp" width="60" alt=""><br><sub>Hao Chunxiu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-043-siqi-qiu"><img src="docs/images/team/team-043-siqi-qiu.webp" width="60" alt=""><br><sub>Siqi Qiu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-049-yang-jiang"><img src="docs/images/team/team-049-yang-jiang.webp" width="60" alt=""><br><sub>Yang Jiang</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-036-peijuan-wang"><img src="docs/images/team/team-036-peijuan-wang.webp" width="60" alt=""><br><sub>Peijuan Wang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-031-mengmeng-song"><img src="docs/images/team/team-031-mengmeng-song.webp" width="60" alt=""><br><sub>Mengmeng Song</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-026-kuan-yang"><img src="docs/images/team/team-026-kuan-yang.webp" width="60" alt=""><br><sub>Kuan Yang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-058-zhuoying-li"><img src="docs/images/team/team-058-zhuoying-li.webp" width="60" alt=""><br><sub>Zhuoying Li</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-083-jian-jiao"><img src="docs/images/team/team-083-jian-jiao.webp" width="60" alt=""><br><sub>Jian Jiao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-084-wanjing-huang"><img src="docs/images/team/team-084-wanjing-huang.webp" width="60" alt=""><br><sub>Wanjing Huang</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-055-yujia-wu"><img src="docs/images/team/team-055-yujia-wu.webp" width="60" alt=""><br><sub>Yujia Wu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-014-daheng-li"><img src="docs/images/team/team-014-daheng-li.webp" width="60" alt=""><br><sub>Daheng Li</sub></a></td>
  </tr>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-023-jinwen-liu"><img src="docs/images/team/team-023-jinwen-liu.webp" width="60" alt=""><br><sub>Jinwen Liu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-038-rui-lu"><img src="docs/images/team/team-038-rui-lu.webp" width="60" alt=""><br><sub>Rui Lu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-013-bing-liu"><img src="docs/images/team/team-013-bing-liu.webp" width="60" alt=""><br><sub>Bing Liu</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-018-forest-cheng"><img src="docs/images/team/team-018-forest-cheng.webp" width="60" alt=""><br><sub>Nam Forest Cheng</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-029-mao-yilin"><img src="docs/images/team/team-029-mao-yilin.webp" width="60" alt=""><br><sub>Yilin Mao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-035-patricia-ho"><img src="docs/images/team/team-035-patricia-ho.webp" width="60" alt=""><br><sub>Patricia Ho</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-046-xu-leyao"><img src="docs/images/team/team-046-xu-leyao.webp" width="60" alt=""><br><sub>XU Leyao</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-051-yefeng-wu"><img src="docs/images/team/team-051-yefeng-wu.webp" width="60" alt=""><br><sub>Yefeng Wu</sub></a></td>
  </tr>
</table>

### Cat members (2)

<table>
  <tr>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-baize"><img src="docs/images/team/team-baize.webp" width="60" alt=""><br><sub>Baize</sub></a></td>
    <td align="center" width="88"><a href="https://freedomintelligence.github.io/OmniDentBench/#member-paopao"><img src="docs/images/team/team-paopao.webp" width="60" alt=""><br><sub>Paopao</sub></a></td>
  </tr>
</table>

### Partner institutions

<table>
  <tr>
    <td align="center" width="25%"><img src="docs/images/partner-marks/CUHK.webp" width="140" alt="The Chinese University of Hong Kong, Shenzhen"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/HKU.webp" width="140" alt="Faculty of Dentistry, The University of Hong Kong"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/FRD.webp" width="140" alt="Freedom AI"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/peking-university.webp" width="140" alt="Peking University"></td>
  </tr>
  <tr>
    <td align="center" width="25%"><img src="docs/images/partner-marks/peking-tesinghua-center-for-life-sciences.webp" width="140" alt="Peking-Tsinghua Center for Life Sciences"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/national-biomedical-imaging-center.webp" width="140" alt="Peking University National Biomedical Imaging Center"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/the-prince-philip-dentap-hospital.webp" width="140" alt="The Prince Philip Dental Hospital"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/mayo-clinic-logo.webp" width="140" alt="Mayo Clinic"></td>
  </tr>
  <tr>
    <td align="center" width="25%"><img src="docs/images/partner-marks/lmu-klinikum-logo.webp" width="140" alt="Ludwig-Maximilians-Universität München Klinikum (LMU Klinikum)"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/SEGi.webp" width="140" alt="SEGi University &amp; Colleges"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/national-hospital-abuja-logo.webp" width="140" alt="National Hospital Abuja"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/cmul-logo.webp" width="140" alt="College of Medicine, University of Lagos (CMUL)"></td>
  </tr>
  <tr>
    <td align="center" width="25%"><img src="docs/images/partner-marks/bayero-university-kano-logo.webp" width="140" alt="Bayero University Kano"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/smanu-Danfodiyo-University-Sokoto.webp" width="140" alt="Usmanu Danfodiyo University Sokoto"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/university-of-maiduguri-logo.webp" width="140" alt="University of Maiduguri"></td>
    <td align="center" width="25%"><img src="docs/images/partner-marks/madda-walabu-university-logo.webp" width="140" alt="Madda Walabu University"></td>
  </tr>
</table>

## Repository map

| Path | Contents |
| --- | --- |
| [`data/`](data) | Benchmark items, shared figures, and source manifests |
| [`evaluation/`](evaluation) | Python CLI, API client, prompts, and scoring |
| [`tests/`](tests) | Offline evaluator tests |
| [`docs/`](docs) | Bilingual GitHub Pages site and project assets |

To preview the site locally, run `python -m http.server --directory docs 8000` and open `http://localhost:8000`. GitHub Pages publishes from `main:/docs`. The [showcase data](docs/assets/showcase-data.js) contains the bilingual names, photos, and specialty counts. The [page script](docs/assets/flagship.js) and [stylesheet](docs/assets/flagship.css) control the layout.

## Contact & Data Access
If you have any questions or are interested in collaborating, feel free to reach out via: 📧 junjiezhao@connect.hku.hk or ziiyingsheng@gmail.com


## Citation and licensing

Cite *OmniDentBench (ODB)* with the [benchmark release](https://github.com/FreedomIntelligence/OmniDentBench/releases/tag/v1.0.0) or the exact Git commit used. The [MIT License](LICENSE) covers evaluator code. [CC BY 4.0](data/LICENSE) covers original benchmark content for which contributors hold licensing rights. Third-party figures and source materials retain their applicable terms. Consult the figure manifest and original articles for reuse and credit requirements.

If this benchmark is useful in your work, [star OmniDentBench](https://github.com/FreedomIntelligence/OmniDentBench) to follow the project. For data, evaluation, or reproducibility questions, [open an issue](https://github.com/FreedomIntelligence/OmniDentBench/issues).
