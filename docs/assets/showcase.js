const repo = "https://github.com/FreedomIntelligence/OmniDentBench",
  data = window.ODB_DATA;
const requestedLanguage = new URLSearchParams(location.search).get("lang");
let en = (requestedLanguage ?? document.documentElement.lang) === "en";

function render() {
  const t = (a, b) => (en ? b : a);
  document.documentElement.lang = en ? "en" : "zh-CN";
  const groups = [
    ["steering_chair", "项目主席", "Steering chairs"],
    ["steering_member", "指导委员会", "Steering committee"],
    ["specialty_chair", "专科主席", "Specialty chairs"],
    ["student_member", "学生委员会", "Student committee"],
    ["specialty_member", "专科委员会", "Specialty committee"],
  ];
  document.getElementById("app").innerHTML = `
<a class="skip" href="#main">${t("跳到正文", "Skip to content")}</a><header><a class="brand" href="#"><img src="./images/logo.png" alt=""><span>OmniDentBench<small>DENTAL AI BENCHMARK</small></span></a><nav><a href="#benchmark">${t("评测体系", "Benchmark")}</a><a href="#institutions">${t("参与机构", "Institutions")}</a><a href="#team">${t("研究团队", "Team")}</a><a href="${repo}">GitHub</a></nav><button id="language" aria-label="${t("Switch to English", "切换中文")}">${t("EN / 中文", "中文 / EN")}</button></header>
<main id="main"><section class="hero"><div class="hero-top"><div><p class="eyebrow">OMNIDENTBENCH · MULTIMODAL · MULTILINGUAL</p><h1>${t("OmniDentBench<br><em>牙科 AI 评测基准</em>", "OmniDentBench<br><em>Dental AI benchmark</em>")}</h1><p class="hero-sub">${t("以口腔医学的专业深度，检验人工智能的临床推理能力。", "Testing clinical reasoning through the depth of dental expertise.")}</p><p class="muted">${t("汇聚临床医生与人工智能研究者，以多模态题目、跨语言任务和逐题评分标准，构建可复现的口腔医学 AI 评测基准。", "Clinicians and AI researchers working together on multimodal questions, multilingual tasks and item-specific rubrics for reproducible evaluation.")}</p><div class="actions"><a class="button primary" href="${repo}/tree/main/data">${t("探索开放数据集", "Explore the dataset")}</a><a class="button" href="#method">${t("查看评测方法", "Evaluation protocol")}</a></div><div class="hero-proof"><div class="avatars">${data.team
    .filter((x) => x.category === "steering_chair")
    .map((x) => `<img src="${x.photo}" alt="${x.nameEn}">`)
    .join(
      "",
    )}</div><span>${t("<b>74 位</b>项目成员 · <b>16 家</b>参与机构", "<b>74</b> team members · <b>16</b> institutions")}</span></div></div>
<aside class="snapshot"><div class="snapshot-head">BENCHMARK AT A GLANCE <b>ODB</b></div><div class="big-number">1,178<small>${t("独立评测题目", "benchmark items")}</small></div><div class="composition"><i></i><i></i><i></i></div>${[
    ["605", "精确答案", "Exact answer"],
    ["108", "选择题", "Multiple choice"],
    ["465", "开放式回答", "Open-ended"],
  ]
    .map(
      ([n, z, e], i) =>
        `<div class="format-row"><span><b class="dot d${i}"></b>${t(z, e)}</span><strong>${n}</strong></div>`,
    )
    .join(
      "",
    )}<div class="snapshot-bottom"><strong>93.3%</strong><span>${t("题目包含图像证据<br>1,099 / 1,178 题", "items include visual evidence<br>1,099 / 1,178 items")}</span></div><a class="source" href="${repo}/blob/main/data/en/items.json">${t("数据来源：公开英文题集", "Source: released English item set")}</a></aside></div>
<div class="metrics">${[
    ["12", "口腔医学专科", "Dental specialties"],
    ["8", "评测语言", "Evaluation languages"],
    ["1,099", "含图评测题目", "Image-supported items"],
    ["74", "项目成员", "Team members"],
    ["16", "参与机构", "Institutions"],
  ]
    .map(
      ([n, z, e]) => `<div><strong>${n}</strong><span>${t(z, e)}</span></div>`,
    )
    .join("")}</div></section>
<section id="institutions"><div class="section-title"><div><p class="eyebrow">INTERNATIONAL COLLABORATION</p><h2>${t("共同构建，专业同行。", "Built through collaboration.")}</h2></div><p>${t("汇聚大学、牙科学院、医院与人工智能研究团队。<br>以下机构沿用项目原有公开名单。", "Universities, dental schools, hospitals and AI researchers.<br>Institutions listed on the original project website.")}</p></div><div class="institution-grid">${data.partners.map((x) => `<article class="institution"><img src="${x.logo}" alt="" loading="lazy"><span>${en ? x.nameEn : x.nameZh}</span></article>`).join("")}</div></section>
<section id="benchmark" class="tinted"><div class="section-title"><div><p class="eyebrow">SCOPE & DATA</p><h2>${t("专业深度，有数据可循。", "Clinical depth. Measurable scope.")}</h2></div><p>${t("覆盖 12 个口腔医学专科，公开各专科实际题量。<br>8 种语言版本共享同一套 1,178 题。", "Twelve dental specialties with explicit item counts.<br>Eight language versions of the same 1,178-item benchmark.")}</p></div><div class="scope-grid">${data.specialties.map(({ nameEn, nameZh, items }) => `<div class="specialty"><div><span>${t(nameZh, nameEn)}</span><strong>${items}</strong></div><div class="bar"><i style="width:${(100 * items) / data.specialties[0].items}%"></i></div></div>`).join("")}</div><div class="languages"><strong>${t("跨语言评测", "Multilingual evaluation")}</strong>${["English", "简体中文", "繁體中文", "Español", "Français", "Deutsch", "日本語", "العربية"].map((x) => `<span>${x}</span>`).join("")}</div><p class="note">${t("翻译专家审核覆盖共同抽样的 118 题；各语言版本不作为新增独立题目累计。", "Expert translation review covers a shared sample of 118 items. Language versions are not counted as additional independent items.")}</p></section>
<section id="method"><div class="section-title"><div><p class="eyebrow">EVALUATION PROTOCOL</p><h2>${t("让每一次评测，都有据可查。", "Make every evaluation traceable.")}</h2></div><a class="source" href="${repo}#dataset-and-scoring">${t("阅读完整评测说明", "Read the evaluation documentation")}</a></div><div class="method-grid">${[
    [
      "客观答案",
      "Objective answers",
      "605 道精确答案题与 108 道选择题，由评判模型按 0 / 100 评分；均分对应百分比准确率。",
      "605 exact-answer and 108 multiple-choice items are judge-scored as 0 or 100; the mean corresponds to percentage accuracy.",
    ],
    [
      "逐题评分标准",
      "Item-specific rubrics",
      "465 道开放式题目采用加权评分标准。触发题目定义的安全红线时，该题最终得分为零。",
      "465 open-ended items use weighted rubrics. A triggered item-specific safety red flag sets the final item score to zero.",
    ],
    [
      "可复现结果",
      "Reproducible reporting",
      "公开题目、参考答案、评分标准与评测代码。记录模型及评判模型配置，分别报告客观题与开放式题目结果。",
      "Released questions, reference answers, rubrics and evaluation code. Log model and judge settings and report objective and open-ended results separately.",
    ],
  ]
    .map(
      ([z, e, zp, ep]) =>
        `<article class="method-card"><div class="accent"></div><h3>${t(z, e)}</h3><p>${t(zp, ep)}</p></article>`,
    )
    .join("")}</div></section>
<section id="team" class="tinted"><div class="section-title"><div><p class="eyebrow">PEOPLE BEHIND THE BENCHMARK</p><h2>${t("专业来自每一位参与者。", "The people behind the benchmark.")}</h2></div><p>${t("74 位成员，协同推进临床与 AI 评测。<br>按项目公开角色展示。", "74 contributors connecting clinical expertise and AI evaluation.<br>Organized by publicly listed project roles.")}</p></div>${groups
    .map(
      ([key, z, e], i) =>
        `<details class="team-group" ${i === 0 ? "open" : ""}><summary>${t(z, e)}<span>${data.team.filter((x) => x.category === key).length} ${t("位成员", "members")}</span></summary><div class="team-grid ${i === 0 ? "chairs" : ""}">${data.team
          .filter((x) => x.category === key)
          .map(
            (x) =>
              `<article class="person"><img loading="lazy" src="${x.photo}" alt="${en ? x.nameEn : x.nameZh}"><div><h3>${en ? x.nameEn : x.nameZh}</h3><p>${en ? x.nameZh : x.nameEn}</p><small>${t(z, e)}</small></div></article>`,
          )
          .join("")}</div></details>`,
    )
    .join("")}</section>
<section class="release"><div><p class="eyebrow">OPEN & REPRODUCIBLE</p><h2>${t("从公开数据，开始下一次评测。", "Start your next evaluation.")}</h2><p>${t("获取题集、参考答案、评分标准和评测工具。", "Access benchmark items, reference answers, rubrics and evaluation tools.")}</p></div><div class="actions"><a class="button primary" href="${repo}">${t("访问 GitHub 仓库", "View GitHub repository")}</a><a class="button" href="${repo}#quick-start">${t("快速开始", "Quick start")}</a></div></section></main>
<footer><div class="footer-top"><strong>OmniDentBench</strong><span>${t("面向口腔医学 AI 的多模态、多语言评测基准", "A multimodal, multilingual benchmark for dental AI")}</span><a href="${repo}/issues">${t("反馈与交流", "Feedback & issues")}</a></div><p>${t("评测代码：MIT · 原创基准内容：CC BY 4.0 · 第三方图像遵循其原始许可。", "Evaluation code: MIT · Original benchmark content: CC BY 4.0 · Third-party figures retain their original terms.")} <a href="${repo}/blob/main/data/figures.csv">${t("图像来源与许可", "Figure sources & licences")}</a></p></footer>`;
  document.getElementById("language").onclick = () => {
    en = !en;
    const u = new URL(location);
    u.searchParams.set("lang", en ? "en" : "zh");
    history.replaceState(null, "", u);
    render();
  };
}
render();
