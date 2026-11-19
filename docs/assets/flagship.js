const repo = 'https://github.com/FreedomIntelligence/OmniDentBench';
const data = window.ODB_DATA;
const selectedLanguage = new URLSearchParams(location.search).get('lang');
let en = selectedLanguage ? selectedLanguage !== 'zh' : !location.pathname.endsWith('/zh.html');

const specialtyNames = {
  'Endodontics': '牙体牙髓病学',
  'Oral and Maxillofacial Pathology': '口腔颌面病理学',
  'Orthodontics and Dentofacial Orthopedics': '口腔正畸学',
  'Oral and Maxillofacial Surgery': '口腔颌面外科学',
  'Pediatric Dentistry': '儿童口腔医学',
  'Dental Public Health': '口腔公共卫生',
  'Prosthodontics': '口腔修复学',
  'Oral and Maxillofacial Radiology': '口腔颌面影像学',
  'Periodontics': '牙周病学',
  'Orofacial Pain': '口腔颌面疼痛',
  'Oral Medicine': '口腔内科学',
  'Dental Anesthesiology': '口腔麻醉学'
};

const groups = [
  ['steering_chair', '项目主席', 'Steering chairs'],
  ['steering_member', '指导委员会', 'Steering committee'],
  ['specialty_chair', '专科主席', 'Specialty chairs'],
  ['student_member', '学生委员会', 'Student committee'],
  ['specialty_member', '专科委员会', 'Specialty committee']
];

function render() {
  const t = (zh, english) => en ? english : zh;
  document.documentElement.lang = en ? 'en' : 'zh-CN';
  const formats = [
    [605, '精确答案', 'Exact answer'],
    [108, '选择题', 'Multiple choice'],
    [465, '开放式回答', 'Open-ended']
  ];
  const openGroups = new Set([...document.querySelectorAll('details[open]')].map(el => el.id));
  const alreadyRendered = !!document.querySelector('main');
  let offset = 0;
  const rings = formats.map(([count], i) => {
    const length = count / 1178 * 100;
    const circle = `<circle class="ring-segment segment-${i}" cx="210" cy="210" r="178" pathLength="100" stroke-dasharray="${length - 0.7} ${100 - length + 0.7}" stroke-dashoffset="${-offset}"/>`;
    offset += length;
    return circle;
  }).join('');

  document.getElementById('app').innerHTML = `
    <a class="skip" href="#main">${t('跳到正文', 'Skip to content')}</a>
    <header class="site-header">
      <a class="brand" href="./" aria-label="OmniDentBench home">
        <img class="brand-logo" src="./images/logo.png" alt="" width="66" height="48">
        <span>OmniDentBench<small>DENTAL AI BENCHMARK</small></span>
      </a>
      <nav aria-label="${t('主导航', 'Main navigation')}">
        <a href="#benchmark">${t('评测体系', 'Benchmark')}</a>
        <a href="#institutions">${t('参与机构', 'Institutions')}</a>
        <a href="#team">${t('研究团队', 'People')}</a>
        <a href="${repo}">GitHub</a>
      </nav>
      <button id="language" aria-label="${t('Switch to English', '切换到中文')}">${t('English', '中文')}<span aria-hidden="true"> / ${t('中', 'EN')}</span></button>
    </header>

    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-topline"><p class="eyebrow">OMNIDENTBENCH</p><span>${t('多模态 · 多语言 · 专科深度', 'MULTIMODAL · MULTILINGUAL · CLINICALLY GROUNDED')}</span></div>
        <div class="hero-layout">
          <div class="hero-copy">
            <h1 id="hero-title">${t('挑战人工智能的<br><em>医学巅峰。</em>', 'Challenging<br>the limits of<br><em>dental AI.</em>')}</h1>
            <p class="hero-sub">${t('以口腔医学的专业深度，检验人工智能的临床推理能力。', 'Clinical expertise meets the next generation of artificial intelligence.')}</p>
            <p class="hero-desc">${t('以多模态题目、跨语言任务与逐题评分标准，构建可复现的口腔医学 AI 评测基准。', 'A rigorous, open benchmark for dental reasoning — built around multimodal evidence, multilingual questions and item-specific evaluation.')}</p>
            <div class="actions">
              <a class="button primary" href="${repo}/tree/main/data">${t('探索数据集', 'Explore the dataset')}</a>
              <a class="button secondary" href="#method">${t('评测方法', 'Evaluation protocol')}</a>
            </div>
          </div>
          <aside class="benchmark-portrait" aria-label="${t('题型构成', 'Benchmark composition')}">
            <div class="data-orbit">
              <svg viewBox="0 0 420 420" aria-hidden="true">
                <circle class="orbit-guide" cx="210" cy="210" r="204"/>
                <circle class="orbit-guide inner" cx="210" cy="210" r="148"/>
                ${rings}
                <path class="orbit-tick" d="M210 0v12 M210 408v12 M0 210h12 M408 210h12"/>
              </svg>
              <div class="orbit-label"><strong>1,178</strong><span>${t('独立评测题目', 'BENCHMARK ITEMS')}</span></div>
            </div>
            <div class="format-legend">${formats.map(([n, z, e], i) => `<div><span class="legend-name"><i class="key-${i}"></i>${t(z, e)}</span><strong>${n}</strong></div>`).join('')}</div>
            <a class="hero-source" href="${repo}/blob/main/data/en/items.json">${t('查看公开题集与参考答案', 'Explore the released questions and answers')}</a>
          </aside>
        </div>
        <div class="hero-bottom"><span>${t('临床专业知识，驱动 AI 评测。', 'CLINICAL EXPERTISE. MEASURABLE INTELLIGENCE.')}</span><a href="#benchmark">${t('认识 OmniDentBench', 'Discover the benchmark')}<span class="scroll-line" aria-hidden="true"></span></a></div>
      </section>

      <div class="metrics" aria-label="${t('基准概览', 'Benchmark at a glance')}">
        ${[['12', '口腔医学专科', 'Dental specialties'], ['8', '评测语言', 'Evaluation languages'], ['1,099', '含图题目', 'Image-supported items'], ['74', '项目成员', 'Team members'], ['16', '参与机构', 'Institutions']].map(([n, z, e]) => `<div><strong>${n}</strong><span>${t(z, e)}</span></div>`).join('')}
      </div>

      <section id="institutions" class="section institutions-section" aria-labelledby="institutions-title">
        <div class="section-heading"><p class="eyebrow">INTERNATIONAL COLLABORATION</p><div class="heading-row"><h2 id="institutions-title">${t('临床深度。<br><em>全球协作。</em>', 'Clinical expertise.<br><em>Global collaboration.</em>')}</h2><p>${t('汇聚大学、牙科学院、医院与人工智能研究团队，共同推进口腔医学 AI 评测。', 'Bringing together universities, dental schools, hospitals and AI researchers around a shared benchmark.')}</p></div></div>
        <div class="institution-grid">${data.partners.map(x => `<article class="institution"><div class="institution-mark"><img src="${x.logo}" alt="" loading="lazy"></div><h3>${en ? x.nameEn : x.nameZh}</h3></article>`).join('')}</div>
      </section>

      <section id="benchmark" class="section scope-section" aria-labelledby="scope-title">
        <div class="section-heading"><p class="eyebrow">THE BENCHMARK</p><div class="heading-row"><h2 id="scope-title">${t('一个基准。<br><em>十二个专科。</em>', 'One benchmark.<br><em>Twelve specialties.</em>')}</h2><p>${t('覆盖口腔医学的专科问题、视觉证据与临床推理，公开每个专科的实际题量。', 'From visual evidence to clinical reasoning, evaluate dental AI across a broad spectrum of specialist knowledge.')}</p></div></div>
        <div class="scope-content"><div class="evidence-panel"><div class="evidence-number">93.3<span>%</span></div><h3>${t('让推理立足于<br>图像证据。', 'Reasoning grounded<br>in visual evidence.')}</h3><p>${t('1,099 / 1,178 道题包含图像。各题可追溯到对应的图像与来源资料。', '1,099 of 1,178 items include images, with figure references and source attribution available in the release.')}</p><a class="text-link" href="${repo}/blob/main/data/figures.csv">${t('图像来源与许可', 'Figure sources & licences')}</a></div>
          <div class="scope-grid">${Object.entries(data.specialties).sort((a, b) => b[1] - a[1]).map(([name, n]) => `<div class="specialty"><div class="specialty-label"><h3>${en ? name : specialtyNames[name]}</h3><strong>${n}</strong></div><div class="bar"><i style="width:${n / 198 * 100}%"></i></div></div>`).join('')}</div>
        </div>
        <div class="language-panel"><div><h3>${t('同一套题目。八种语言。', 'One shared benchmark. Eight languages.')}</h3><p>${t('语言版本共享同一套 1,178 题；翻译专家审核覆盖共同抽样的 118 题。', 'Eight versions of the same 1,178 items. Expert translation review covers a shared sample of 118 items.')}</p></div><div class="languages">${['English', '简体中文', '繁體中文', 'Español', 'Français', 'Deutsch', '日本語', 'العربية'].map(x => `<span>${x}</span>`).join('')}</div></div>
      </section>

      <section id="team" class="section people-section" aria-labelledby="team-title">
        <div class="section-heading"><p class="eyebrow">THE RESEARCH COLLECTIVE</p><div class="heading-row"><h2 id="team-title">${t('专业的背后，<br><em>是每一位参与者。</em>', 'The people behind<br><em>the benchmark.</em>')}</h2><p>${t('74 位项目成员，将临床经验与人工智能研究汇聚为共同的评测实践。', '74 team members connecting clinical expertise with AI research, across steering and specialty committees.')}</p></div></div>
        ${groups.map(([key, z, e], i) => {
          const members = data.team.filter(x => x.category === key);
          const isOpen = alreadyRendered ? openGroups.has(key) : i < 3;
          return `<details class="team-group ${i === 0 ? 'leadership' : ''}" id="${key}" ${isOpen ? 'open' : ''}><summary><span>${t(z, e)}<small>${members.length} ${t('位成员', 'members')}</small></span><span class="expand-icon" aria-hidden="true"></span></summary><div class="team-grid ${i === 0 ? 'chairs' : ''}">${members.map(x => `<article class="person"><div class="portrait"><img loading="lazy" src="${x.photo}" alt="${en ? x.nameEn : x.nameZh}" width="400" height="400"></div><div class="person-caption"><h3>${en ? x.nameEn : x.nameZh}</h3>${x.nameEn !== x.nameZh ? `<p>${en ? x.nameZh : x.nameEn}</p>` : ''}</div></article>`).join('')}</div></details>`;
        }).join('')}
      </section>

      <section id="method" class="section method-section" aria-labelledby="method-title">
        <div class="section-heading"><p class="eyebrow">EVALUATION PROTOCOL</p><div class="heading-row"><h2 id="method-title">${t('透明可查。<br><em>可复现的评测。</em>', 'Transparent by design.<br><em>Reproducible in practice.</em>')}</h2><a class="text-link" href="${repo}#dataset-and-scoring">${t('阅读评测说明', 'Read the methodology')}</a></div></div>
        <div class="method-grid">${[
          ['713', '客观题', 'Objective items', '605 道精确答案题与 108 道选择题，由评判模型按 0 / 100 评分；均分对应百分比准确率。', '605 exact-answer and 108 multiple-choice items, judge-scored as 0 or 100. The mean corresponds to percentage accuracy.'],
          ['465', '开放式题目', 'Open-ended items', '采用逐题加权评分标准。触发题目定义的安全红线时，该题最终得分为零。', 'Item-specific, weighted rubrics assess open-ended responses. A triggered safety red flag sets the final item score to zero.'],
          ['Open', '公开评测工具', 'Reproducible evaluation', '公开题目、参考答案、评分标准与评测代码，记录模型与评判模型配置，分别报告两类题目的结果。', 'Released questions, reference answers, rubrics and code. Record model and judge settings; report objective and open-ended results separately.']
        ].map(([n, z, e, zp, ep]) => `<article class="method-card"><strong>${n}</strong><h3>${t(z, e)}</h3><p>${t(zp, ep)}</p></article>`).join('')}</div>
      </section>

      <section class="section release" aria-labelledby="release-title"><p class="eyebrow">OPEN SCIENCE. SHARED PROGRESS.</p><div class="release-layout"><div><h2 id="release-title">${t('让下一次突破，<br><em>经得起检验。</em>', 'Put your model<br><em>to the test.</em>')}</h2><p>${t('从公开数据、参考答案与评分标准开始。', 'Start with open data, reference answers and transparent evaluation.')}</p></div><div class="release-actions"><a class="button primary" href="${repo}">${t('访问 GitHub 仓库', 'Explore on GitHub')}</a><a class="button secondary" href="${repo}#quick-start">${t('开始评测', 'Get started')}</a></div></div></section>
    </main>

    <footer><div class="footer-top"><a class="footer-brand" href="./">OmniDentBench</a><p>${t('面向口腔医学 AI 的<br>多模态、多语言评测基准。', 'A multimodal, multilingual<br>benchmark for dental AI.')}</p><div><a href="${repo}#institutions-and-team">${t('项目团队', 'Project team')}</a><a href="${repo}/issues">${t('反馈与交流', 'Feedback & issues')}</a></div></div><div class="footer-bottom"><p>${t('评测代码：MIT · 原创基准内容：CC BY 4.0', 'Evaluation code: MIT · Original benchmark content: CC BY 4.0')}</p><a href="${repo}/blob/main/data/figures.csv">${t('第三方图像来源与许可', 'Third-party figure credits & licences')}</a></div></footer>
  `;

  document.getElementById('language').onclick = () => {
    en = !en;
    const url = new URL(location);
    url.searchParams.set('lang', en ? 'en' : 'zh');
    history.replaceState(null, '', url);
    render();
    document.getElementById('language').focus({ preventScroll: true });
  };
}

render();
