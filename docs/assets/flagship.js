const repo = 'https://github.com/FreedomIntelligence/OmniDentBench';
const data = window.ODB_DATA;
const specialties = [...data.specialties].sort((a, b) => b.items - a.items);
const largestSpecialty = Math.max(...specialties.map(specialty => specialty.items));
const selectedLanguage = new URLSearchParams(location.search).get('lang');
let en = selectedLanguage ? selectedLanguage !== 'zh' : !location.pathname.endsWith('/zh.html');

const chairProfiles = {
  '059-junwen-wang': { en: 'HKU Dentistry · Hong Kong', zh: '香港大学牙医学院 · 香港', url: 'https://hub.hku.hk/cris/rp/rp00280' },
  '060-zuolin-jin': { en: 'Shenzhen Stomatology Hospital (Pingshan) · Shenzhen', zh: '南方医科大学深圳口腔医院（坪山）· 深圳', url: 'https://www.sz.gov.cn/hdjl/ywzsk/wsj/xzsx/content/post_13000002.html' },
  '061-benyou-wang': { en: 'CUHK-Shenzhen · Shenzhen', zh: '香港中文大学（深圳）· 深圳', url: 'https://sds.cuhk.edu.cn/en/teacher/571' }
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
  const record = `./assets/items/odb-0264.${t('zh-CN', 'en')}.json`;
  const article = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11987563/';
  const license = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';
  const prompt = t(
    '一名36岁男性拟在上颌后牙区接受种植治疗。请查看其术前CBCT图像（图 1、图 2 和图 3）。这些图像中哪项解剖发现对治疗决策的影响最大？对该患者而言，最安全的治疗策略是什么？请根据影像作答，说明是否可以进行种植体植入；若考虑骨增量，哪项操作风险最高；以及如何尽量降低并处理主要的术中风险。',
    'A 36-year-old man is being prepared for implants in the posterior maxilla. Review Fig. 1, Fig. 2 and Fig. 3 from his preoperative CBCT. What anatomic finding on these images most changes management, and what is your safest treatment strategy for this patient? Base your answer on the imaging and explain whether implant placement can proceed, which maneuver becomes highest risk if augmentation is considered, and how you would minimize and manage the main intraoperative hazard.'
  );
  const figures = [
    [1, 699, 565, t('双侧上颌窦的连续 CBCT 切片', 'Sequential CBCT sections of the maxillary sinuses on both sides')],
    [2, 687, 359, t('带数字测量标注的两幅 CBCT 切片', 'Two CBCT sections with numerical measurement labels')],
    [3, 675, 359, t('带垂直测量标注的两幅 CBCT 切片', 'Two CBCT sections with vertical measurement labels')]
  ];
  const criteria = [
    [t('证据整合', 'Evidence Integration'), 25],
    [t('治疗规划', 'Treatment Planning'), 40],
    [t('风险获益分析', 'Risk-Benefit Analysis'), 20],
    [t('并发症识别与应对', 'Complication Awareness'), 15]
  ];

  return `
    <section id="sample-item" class="section sample-item" aria-labelledby="sample-title">
      <header class="sample-heading">
        <h2 id="sample-title">${t('主观题示例', 'Sample open-ended question')}</h2>
        <p>ODB-0264 · ${t('牙周病学', 'Periodontics')}</p>
      </header>
      <div class="sample-layout">
        <p class="sample-prompt">${prompt}</p>
        <div class="sample-plate">
          ${figures.map(([number, width, height, caption]) => {
            const image = `./images/atlas/odb-0264-fig-${number}.jpg`;
            const label = t(`图 ${number}`, `Fig. ${number}`);
            return `<figure>
              <a class="sample-image" href="${image}" aria-label="${t(`查看图 ${number} 原图`, `View full-size figure ${number}`)}"><img src="${image}" alt="${caption}" width="${width}" height="${height}" loading="lazy"></a>
              <figcaption><strong>${label}.</strong> ${caption}<br><a href="${article}#fig000${number}">Hosseinzadeh et al. (2025)</a> · <a href="${license}">CC BY-NC-ND 4.0</a></figcaption>
            </figure>`;
          }).join('')}
        </div>
      </div>
      <details class="sample-rubric">
        <summary>${t('查看评分规则', 'View scoring rubric')}</summary>
        <dl>${criteria.map(([name, weight]) => `<div><dt>${name}</dt><dd>${weight}%</dd></div>`).join('')}</dl>
        <p>${t('本题总分为四项得分的加权和。', 'The item score is the weighted sum of the four criteria.')}</p>
        <a class="text-link" href="${record}">${t('查看完整条目、参考答案与量表', 'View the full item, reference answer and rubric')}</a>
      </details>
    </section>`;
}

let activeInstitution = null;
let pinnedInstitution = null;

function closeInstitution() {
  if (!activeInstitution) return;
  activeInstitution.removeAttribute('data-open');
  activeInstitution.setAttribute('aria-expanded', 'false');
  activeInstitution = null;
}

function showInstitution(button) {
  if (activeInstitution !== button) {
    closeInstitution();
    pinnedInstitution = null;
  }
  activeInstitution = button;
  button.setAttribute('data-open', '');
  button.setAttribute('aria-expanded', 'true');
}

function render() {
  closeInstitution();
  pinnedInstitution = null;
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
        <a href="#benchmark">${t('数据覆盖', 'Data coverage')}</a>
        <a href="#method">${t('评分方法', 'Scoring')}</a>
        <a href="#institutions">${t('合作机构', 'Institutions')}</a>
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
        <div class="section-heading"><h2 id="method-title">${t('评分方法', 'Scoring methods')}</h2></div>
        <div class="method-grid">${[
          ['713', '客观题', 'Objective items', '605 道精确答案题与 108 道选择题，由评判模型按 0 / 100 评分；均分对应百分比准确率。', '605 exact-answer and 108 multiple-choice items, judge-scored as 0 or 100. The mean corresponds to percentage accuracy.'],
          ['465', '开放式题目', 'Open-ended items', '采用逐题加权评分标准。触发题目定义的安全红线时，该题最终得分为零。', 'Item-specific, weighted rubrics assess open-ended responses. A triggered safety red flag sets the final item score to zero.'],
          ['', '运行与报告', 'Running and reporting', '记录待测模型与评判模型的配置，分别报告客观题准确率和开放题平均分。', 'Record the model and judge settings. Report objective accuracy and the open-ended mean separately.']
        ].map(([n, z, e, zp, ep]) => `<article class="method-card"><h3>${t(z, e)}${n ? ` <span>${n}</span>` : ''}</h3><p>${t(zp, ep)}</p></article>`).join('')}</div>
        <div class="method-actions"><a class="button method-run" href="${repo}#quick-start">${t('运行评测', 'Run the evaluation')}</a><a class="text-link" href="${repo}#dataset-and-scoring">${t('阅读评测说明', 'Read the methodology')}</a></div>
      </section>

      <section id="team" class="section people-section" aria-labelledby="team-title" tabindex="-1">
        <div class="section-heading"><h2 id="team-title">${t('研究团队', 'Research team')}</h2></div>
        ${[...groups, ['cat_members', '猫咪成员', 'Cat members']].map(([key, z, e], i) => {
          const members = key === 'cat_members' ? data.catMembers : data.team.filter(x => x.category === key);
          return `<section class="team-group ${i === 0 ? 'leadership' : ''}" id="${key}"><h3 class="group-title">${t(z, e)} <small>${members.length}</small></h3><div class="team-grid ${i === 0 ? 'chairs' : ''}">${members.map(x => `<article class="person" id="member-${x.key}" tabindex="-1"><div class="portrait"><img loading="lazy" src="${x.photo}" alt="${en ? x.nameEn : x.nameZh}" width="400" height="400"></div><div class="person-caption"><h4>${en ? x.nameEn : x.nameZh}</h4>${x.nameEn !== x.nameZh ? `<p>${en ? x.nameZh : x.nameEn}</p>` : ''}${chairProfiles[x.key] ? `<a class="chair-affiliation" href="${chairProfiles[x.key].url}">${en ? chairProfiles[x.key].en : chairProfiles[x.key].zh}</a>` : ''}</div></article>`).join('')}</div></section>`;
        }).join('')}
      </section>
    </main>

    <footer><div class="footer-top"><a class="footer-brand" href="./">OmniDentBench</a><div><a href="${repo}">GitHub</a><a href="${repo}/issues">${t('反馈与交流', 'Feedback & issues')}</a></div></div><div class="footer-bottom"><p>${t('评测代码：MIT · 原创基准内容：CC BY 4.0', 'Evaluation code: MIT · Original benchmark content: CC BY 4.0')}</p><a href="${repo}/blob/main/data/figures.csv">${t('第三方图像来源与许可', 'Third-party figure credits & licences')}</a></div></footer>
  `;

  window.ODBNetwork.init({ en, data, groups });

  document.getElementById('language').onclick = () => {
    en = !en;
    const url = new URL(location);
    url.searchParams.set('lang', en ? 'en' : 'zh');
    history.replaceState(null, '', url);
    render();
    document.getElementById('language').focus({ preventScroll: true });
  };

  document.querySelectorAll('.institution').forEach(button => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') showInstitution(button);
    });
    button.addEventListener('pointerleave', () => {
      if (activeInstitution === button && document.activeElement !== button && pinnedInstitution !== button) closeInstitution();
    });
    button.addEventListener('focus', () => showInstitution(button));
    button.addEventListener('blur', () => {
      if (activeInstitution === button && pinnedInstitution !== button) closeInstitution();
    });
    button.addEventListener('click', () => {
      if (pinnedInstitution === button) {
        pinnedInstitution = null;
        closeInstitution();
      } else {
        showInstitution(button);
        pinnedInstitution = button;
      }
    });
  });
}

document.addEventListener('pointerdown', event => {
  if (activeInstitution && !activeInstitution.contains(event.target)) {
    pinnedInstitution = null;
    closeInstitution();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && activeInstitution) {
    pinnedInstitution = null;
    closeInstitution();
    event.preventDefault();
  }
});

render();
document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
