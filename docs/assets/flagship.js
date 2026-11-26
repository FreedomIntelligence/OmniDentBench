const repo = 'https://github.com/FreedomIntelligence/OmniDentBench';
const data = window.ODB_DATA;
const specialties = [...data.specialties].sort((a, b) => b.items - a.items);
const largestSpecialty = Math.max(...specialties.map(specialty => specialty.items));
const selectedLanguage = new URLSearchParams(location.search).get('lang');
let en = selectedLanguage ? selectedLanguage !== 'zh' : !location.pathname.endsWith('/zh.html');

const chairProfiles = {
  '059-junwen-wang': { en: 'HKU Dentistry · Hong Kong', zh: '香港大学牙医学院 · 香港', url: 'https://hub.hku.hk/cris/rp/rp00280' },
  '060-zuolin-jin': { en: 'Shenzhen Stomatology Hospital (Pingshan) · Shenzhen', zh: '南方医科大学深圳口腔医院（坪山）· 深圳', url: 'https://www.sz.gov.cn/hdjl/ywzsk/wsj/xzsx/content/post_13000002.html' },
  '061-benyou-wang': { en: 'CUHK-Shenzhen · Shenzhen', zh: '香港中文大学（深圳）· 深圳', url: 'https://sds.cuhk.edu.cn/en/teacher/571' },
  '105-jianquan-li': { en: 'Freedom AI · Shenzhen', zh: '自由动脉 · 深圳', url: 'https://www.freedomai.cn/' }
};

const groups = [
  ['steering_chair', '项目主席', 'Steering chairs'],
  ['steering_member', '指导委员会', 'Steering committee'],
  ['specialty_chair', '专科主席', 'Specialty chairs'],
  ['student_member', '学生委员会', 'Student committee'],
  ['overseas_expert', '海外专家', 'Overseas experts'],
  ['consortium_contributor', '联盟协作者', 'Consortium contributors'],
  ['specialty_member', '专科委员会', 'Specialty committee']
];

function renderSampleItem(t) {
  const language = t('zh-CN', 'en');
  const objective = window.ODB_SAMPLE_ITEMS;
  const radiology = t('口腔颌面放射学', 'Oral and Maxillofacial Radiology');
  const samples = [
    {
      id: 'ODB-0264',
      label: t('主观题', 'Subjective'),
      specialty: t('牙周病学', 'Periodontics'),
      prompt: t(
        '一名36岁男性拟在上颌后牙区接受种植治疗。请查看其术前CBCT图像（图 1、图 2 和图 3）。这些图像中哪项解剖发现对治疗决策的影响最大？对该患者而言，最安全的治疗策略是什么？请根据影像作答，说明是否可以进行种植体植入；若考虑骨增量，哪项操作风险最高；以及如何尽量降低并处理主要的术中风险。',
        'A 36-year-old man is being prepared for implants in the posterior maxilla. Review Fig. 1, Fig. 2 and Fig. 3 from his preoperative CBCT. What anatomic finding on these images most changes management, and what is your safest treatment strategy for this patient? Base your answer on the imaging and explain whether implant placement can proceed, which maneuver becomes highest risk if augmentation is considered, and how you would minimize and manage the main intraoperative hazard.'
      ),
      article: 'PMC11987563',
      credit: 'Hosseinzadeh et al. (2025)',
      license: ['CC BY-NC-ND 4.0', 'by-nc-nd/4.0'],
      figures: [
        [699, 565, 'fig0001', t('双侧上颌窦的连续 CBCT 切片', 'Sequential CBCT sections of the maxillary sinuses on both sides')],
        [687, 359, 'fig0002', t('带数字测量标注的两幅 CBCT 切片', 'Two CBCT sections with numerical measurement labels')],
        [675, 359, 'fig0003', t('带垂直测量标注的两幅 CBCT 切片', 'Two CBCT sections with vertical measurement labels')]
      ],
      criteria: [
        [t('证据整合', 'Evidence Integration'), 25],
        [t('治疗规划', 'Treatment Planning'), 40],
        [t('风险获益分析', 'Risk-Benefit Analysis'), 20],
        [t('并发症识别与应对', 'Complication Awareness'), 15]
      ]
    },
    {
      id: 'ODB-1164',
      label: t('客观题 · 精确答案', 'Objective-Exact'),
      specialty: radiology,
      ...objective['ODB-1164'][language],
      article: 'PMC10814903',
      credit: 'Akitomo et al. (2024)',
      license: ['CC BY 4.0', 'by/4.0'],
      figures: [
        [718, 675, 'children-11-00006-f004', t('从牙冠到牙根的连续 CBCT 切片', 'Sequential CBCT sections from crown to root')],
        [756, 548, 'children-11-00006-f005', t('CBCT 切片与三维牙体重建图', 'CBCT sections and three-dimensional tooth reconstructions')]
      ]
    },
    {
      id: 'ODB-1161',
      label: t('客观题 · 选择题', 'Objective-Multiple Choice'),
      specialty: radiology,
      ...objective['ODB-1161'][language],
      article: 'PMC7758263',
      credit: 'Manila et al. (2020)',
      license: ['CC BY-NC 3.0', 'by-nc/3.0'],
      figures: [
        [676, 322, 'F2', t('双侧上颌窦的轴位及冠状位 CBCT 图像', 'Axial and coronal CBCT views of the maxillary sinuses')]
      ]
    }
  ];

  return `
    <section id="sample-item" class="section sample-item" aria-labelledby="sample-title">
      <h2 id="sample-title">${t('题目示例', 'Sample questions')}</h2>
      <div class="sample-tabs" role="tablist" aria-labelledby="sample-title">
        ${samples.map(({ id, label }, index) => `<button type="button" role="tab" id="sample-tab-${id}" aria-controls="sample-panel-${id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${label}</button>`).join('')}
      </div>
      ${samples.map(({ id, specialty, prompt, article, credit, license, figures, criteria, options, answers }, index) => `
        <div class="sample-panel" role="tabpanel" id="sample-panel-${id}" aria-labelledby="sample-tab-${id}" tabindex="0"${index === 0 ? '' : ' hidden'}>
          <p class="sample-meta">${id} · ${specialty}</p>
          <div class="sample-layout">
            <div>
              <p class="sample-prompt">${prompt}</p>
              ${options ? `<ol class="sample-options" type="A">${options.map(({ text }) => `<li>${text}</li>`).join('')}</ol>` : ''}
            </div>
            <div class="sample-plate" data-figures="${figures.length}">
              ${figures.map(([width, height, anchor, caption], figureIndex) => {
                const number = figureIndex + 1;
                const image = `./images/atlas/${id.toLowerCase()}-fig-${number}.jpg`;
                return `<figure>
                  <a class="sample-image" href="${image}" aria-label="${t(`查看图 ${number} 原图`, `View full-size figure ${number}`)}"><img src="${image}" alt="${caption}" width="${width}" height="${height}" loading="lazy"></a>
                  <figcaption><strong>${t(`图 ${number}`, `Fig. ${number}`)}.</strong> ${caption}<br><a href="https://pmc.ncbi.nlm.nih.gov/articles/${article}/#${anchor}">${credit}</a> · <a href="https://creativecommons.org/licenses/${license[1]}/">${license[0]}</a></figcaption>
                </figure>`;
              }).join('')}
            </div>
          </div>
          <details class="sample-rubric">
            <summary>${criteria ? t('查看评分规则', 'View scoring rubric') : t('查看答案', 'View answer')}</summary>
            ${criteria ? `<dl>${criteria.map(([name, weight]) => `<div><dt>${name}</dt><dd>${weight}%</dd></div>`).join('')}</dl>
              <p>${t('本题总分为四项得分的加权和。', 'The item score is the weighted sum of the four criteria.')}</p>` : `<p>${answers.join(t('、', ' / '))}</p>`}
            <a class="text-link" href="./assets/items/${id.toLowerCase()}.${language}.json">${criteria ? t('查看完整条目、参考答案与量表', 'View the full item, reference answer and rubric') : t('查看完整条目', 'View the full item')}</a>
          </details>
        </div>`).join('')}
    </section>`;
}

function initSampleTabs() {
  const tablist = document.querySelector('.sample-tabs');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  function selectTab(selected) {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  }

  tablist.addEventListener('click', event => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  tablist.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    const next = {
      ArrowLeft: (current + tabs.length - 1) % tabs.length,
      ArrowRight: (current + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next]);
    tabs[next].focus();
  });
}

function renderPortrait(person, t) {
  const name = en ? person.nameEn : person.nameZh;
  const image = `<img loading="lazy" src="${person.photo}" alt="" width="400" height="400">`;
  return `<button class="portrait" type="button" data-person="${person.key}" aria-haspopup="dialog" aria-label="${t(`查看 ${name} 的资料`, `View profile for ${name}`)}">${image}</button>`;
}

function render() {
  const t = (zh, english) => en ? english : zh;
  document.documentElement.lang = en ? 'en' : 'zh-CN';
  document.getElementById('app').innerHTML = `
    <a class="skip" href="#main">${t('跳到正文', 'Skip to content')}</a>
    <header class="site-header">
      <a class="brand" href="./" aria-label="OmniDentBench home">
        <img class="brand-logo" src="./images/atlas/odb-mark.png" alt="" width="66" height="48">
        <span>OmniDentBench</span>
      </a>
      <nav aria-label="${t('主导航', 'Main navigation')}">
        <a href="#sample-item">${t('题目示例', 'Sample')}</a>
        <a href="#benchmark">${t('数据覆盖', 'Dataset')}</a>
        <a href="#method">${t('评测', 'Evaluation')}</a>
        <a href="#team">${t('研究团队', 'Team')}</a>
      </nav>
      <button id="language" aria-label="${t('Switch to English', '切换到中文')}">${t('English', '中文')}<span aria-hidden="true"> / ${t('中', 'EN')}</span></button>
    </header>

    <main id="main">
      ${window.ODBNetwork.render({ en, data, groups })}

      ${renderSampleItem(t)}

      <section id="benchmark" class="section scope-section" aria-labelledby="scope-title">
        <div class="section-heading scope-heading"><h2 id="scope-title">${t('数据覆盖', 'Dataset coverage')}</h2><a class="text-link" href="${repo}/tree/main/data">${t('查看数据集', 'View dataset')}</a></div>
        <div class="scope-content"><div class="evidence-panel"><h3>${t('含图题目', 'Items with images')}</h3><p>${t('1,178 道题中有 1,099 道含图（93.3%）。', '1,099 of 1,178 items (93.3%) include images.')}</p><a class="text-link" href="${repo}/blob/main/data/figures.csv">${t('图像来源与许可', 'Figure sources & licences')}</a></div>
          <div class="scope-grid">${specialties.map(({ nameEn, nameZh, items }) => `<div class="specialty">${window.ODBSpecialtyIcon(nameEn)}<div class="specialty-label"><h3>${en ? nameEn : nameZh}</h3><strong>${items}</strong></div><div class="bar"><i style="width:${items / largestSpecialty * 100}%"></i></div></div>`).join('')}</div>
        </div>
        <div class="language-panel"><div><h3>${t('语言版本', 'Language editions')}</h3><p>${t('各语言使用同一套题目，专家审核了共同抽样的 118 道题的翻译。', 'All editions use the same items. Experts reviewed translations for a shared sample of 118 questions.')}</p></div><div class="languages">${['English', '简体中文', '繁體中文', 'Español', 'Français', 'Deutsch', '日本語', 'العربية'].map(x => `<span>${x}</span>`).join('')}</div></div>
      </section>

      <section id="method" class="section method-section" aria-labelledby="method-title">
        <div class="section-heading">
          <h2 id="method-title">${t('评测', 'Evaluation')}</h2>
          <p class="method-intro">${t('模型根据所给题干及随题提供的图像作答。评测分别报告客观题准确率和主观题最终得分的平均值。', 'Models answer dental questions using the supplied text and any accompanying images. We report objective accuracy and the mean final score for subjective items separately.')}</p>
        </div>
        <div class="method-grid">${[
          ['713', '客观题', 'Objective items', '包含 605 道精确答案题和 108 道选择题。精确答案题按预设的可接受答案判定，选择题要求所选选项与正确选项集合完全一致。完全正确得 100 分，其余得 0 分。', 'The benchmark includes 605 exact-answer items and 108 multiple-choice items. An exact answer must match an accepted variant. A multiple-choice response must match the full set of correct options. Each response earns 100 points if fully correct and zero otherwise.'],
          ['465', '主观题', 'Subjective items', '评判模型依据每道题的评分量表逐项评分，再按权重汇总为 0 至 100 分。若回答触发该题预设的安全红线，最终得分为 0。', 'The judge scores each response against a case-specific rubric. The weighted criterion scores yield an item score from 0 to 100. If the response triggers a prespecified safety red flag, the final item score is zero.'],
          ['', '评判模型', 'Judge Model', '论文研究以 24 位临床专家的独立评定为参照，比较了 5 个评判模型，最终选用 DeepSeek-Flash 为三种题型评分。', 'In the study, we compared 5 judge models against independent ratings from 24 clinicians and selected DeepSeek-Flash to score all three question formats.']
        ].map(([n, z, e, zp, ep]) => `<article class="method-card"><h3>${t(z, e)}${n ? ` <span>${n}</span>` : ''}</h3><p>${t(zp, ep)}</p></article>`).join('')}</div>
        <div class="method-actions"><a class="button method-run" href="${repo}#quick-start">${t('运行评测', 'Run the evaluation')}</a><a class="text-link" href="${repo}/blob/main/evaluation/README.md#scoring-and-failure-handling">${t('评分规则', 'Scoring protocol')}</a></div>
      </section>

      <section id="team" class="section people-section" aria-labelledby="team-title" tabindex="-1">
        <div class="section-heading"><h2 id="team-title">${t('研究团队', 'Research team')}</h2></div>
        ${groups.map(([key, z, e], i) => {
          const members = data.team.filter(x => x.category === key);
          return `<section class="team-group ${i === 0 ? 'leadership' : ''}" id="${key}"><h3 class="group-title">${t(z, e)} <small>${members.length}</small></h3><div class="team-grid ${i === 0 ? 'chairs' : ''}">${members.map(x => `<article class="person" id="member-${x.key}" tabindex="-1">${renderPortrait(x, t)}<div class="person-caption"><h4>${en ? x.nameEn : x.nameZh}</h4>${x.nameEn !== x.nameZh ? `<p>${en ? x.nameZh : x.nameEn}</p>` : ''}${chairProfiles[x.key] ? `<a class="chair-affiliation" href="${chairProfiles[x.key].url}">${en ? chairProfiles[x.key].en : chairProfiles[x.key].zh}</a>` : ''}</div></article>`).join('')}</div></section>`;
        }).join('')}
      </section>
    </main>

    <footer><div class="footer-top"><a class="footer-brand" href="./">OmniDentBench</a><div><a href="${repo}">GitHub</a><a href="${repo}/issues">${t('反馈与交流', 'Feedback & issues')}</a></div></div><div class="footer-bottom"><p>${t('评测代码：MIT · 原创基准内容：CC BY 4.0', 'Evaluation code: MIT · Original benchmark content: CC BY 4.0')}</p></div></footer>
  `;

  window.ODBNetwork.init({ en, data, groups });
  initSampleTabs();

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
document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
