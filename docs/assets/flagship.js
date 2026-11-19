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
  ['specialty_member', '专科委员会', 'Specialty committee']
];

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
      <section class="hero atlas-hero" aria-labelledby="hero-title">
        <div class="atlas-intro">
          <div><h1 id="hero-title">OmniDentBench</h1><p class="atlas-deck">${t('口腔医学 AI 的多语言、多模态评测基准', 'A multilingual benchmark for dental AI reasoning')}</p></div>
          <p class="atlas-explainer">${t('让不同模型回答同一组牙科问题，再按同一套规则比较表现。1,178 道题覆盖 12 个专科，其中 1,099 道附有图像。客观题按参考答案判分，开放题按逐题量表评分。', 'Give models the same dental questions and compare their answers under the same scoring rules. Of 1,178 questions across 12 specialties, 1,099 include images. A judge checks objective answers against references and grades open-ended responses against item-specific rubrics.')}</p>
        </div>
        <figure class="research-atlas" id="collaboration-map">
          <div class="atlas-heading"><h2>${t('连接全球牙科研究团队', 'Connecting dental research worldwide')}</h2><span>${t('16 家合作机构 · 74 位项目成员', '16 partner institutions · 74 team members')}</span></div>
          ${window.ODBNetwork.render({ en, data, groups })}
        <div class="case-example">
          <img src="./images/atlas/odb-0777.jpg" alt="${t('题目 ODB-0777 的牙根 X 光片','Dental radiograph supplied with item ODB-0777')}" width="86" height="146">
          <div><p class="case-label">${t('牙体牙髓病学 · 精确答案题', 'Endodontics · Exact answer')} · ODB-0777</p>
            <h2>${t('这张牙片中的根管形态，有什么经典影像学名称？', 'What classic radiographic term describes this canal configuration?')}</h2>
            <p>${t('模型读片并给出术语。评判模型对照参考答案，判为正确计 100 分，错误计 0 分。','The model reads the radiograph and names the finding. The judge compares its response with the reference answer and awards 100 or 0.')}</p>
            <small>${t('图像','Image')} · <a href="https://doi.org/10.7759/cureus.86471">Doumari et al. (2025), Fig. 2</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></small>
          </div>
        </div>
          <figcaption>${t('中国大陆与香港分开统计。点击地区查看机构，点选头像查看成员资料。底图', 'Chinese mainland and Hong Kong are reported separately. Select a location to explore institutions, or a portrait to meet a team member. Base map')} · <a href="https://www.naturalearthdata.com/">Natural Earth</a></figcaption>
        </figure>
        <div class="actions atlas-actions"><a class="button primary" href="${repo}/tree/main/data">${t('探索数据集', 'Explore the dataset')}</a><a class="button secondary" href="#method">${t('查看评分方法', 'How scoring works')}</a></div>
      </section>

      <div class="metrics" aria-label="${t('基准概览', 'Benchmark at a glance')}">
        ${[['12', '口腔医学专科', 'Dental specialties'], ['8', '评测语言', 'Evaluation languages'], ['1,099', '含图题目', 'Image-supported items'], ['74', '项目成员', 'Team members'], ['16', '参与机构', 'Institutions']].map(([n, z, e]) => `<div><strong>${n}</strong><span>${t(z, e)}</span></div>`).join('')}
      </div>

      <section id="institutions" class="section institutions-section" aria-labelledby="institutions-title">
        <div class="section-heading"><p class="eyebrow">INTERNATIONAL COLLABORATION</p><div class="heading-row"><h2 id="institutions-title">${t('合作机构', 'Partner institutions')}</h2><p>${t('汇聚大学、牙科学院、医院与人工智能研究团队，共同推进口腔医学 AI 评测。', 'Bringing together universities, dental schools, hospitals and AI researchers around a shared benchmark.')}</p></div></div>
        <div class="institution-grid">${data.partners.map((x, i) => `<button class="institution" type="button" aria-labelledby="institution-name-${i}" aria-controls="institution-name-${i}" aria-expanded="false"><span class="institution-mark"><img src="${x.logo}" alt="" loading="lazy"></span><span class="institution-tooltip" id="institution-name-${i}" role="tooltip">${en ? x.nameEn : x.nameZh}</span></button>`).join('')}</div>
      </section>

      <section id="benchmark" class="section scope-section" aria-labelledby="scope-title">
        <div class="section-heading"><p class="eyebrow">THE BENCHMARK</p><div class="heading-row"><h2 id="scope-title">${t('一个基准。<br><em>十二个专科。</em>', 'One benchmark.<br><em>Twelve specialties.</em>')}</h2><p>${t('覆盖口腔医学的专科问题、视觉证据与临床推理，公开每个专科的实际题量。', 'From visual evidence to clinical reasoning, evaluate dental AI across a broad spectrum of specialist knowledge.')}</p></div></div>
        <div class="scope-content"><div class="evidence-panel"><div class="evidence-number">93.3<span>%</span></div><h3>${t('让推理立足于<br>图像证据。', 'Reasoning grounded<br>in visual evidence.')}</h3><p>${t('1,099 / 1,178 道题包含图像。各题可追溯到对应的图像与来源资料。', '1,099 of 1,178 items include images, with figure references and source attribution available in the release.')}</p><a class="text-link" href="${repo}/blob/main/data/figures.csv">${t('图像来源与许可', 'Figure sources & licences')}</a></div>
          <div class="scope-grid">${specialties.map(({ nameEn, nameZh, items }) => `<div class="specialty">${window.ODBSpecialtyIcon(nameEn)}<div class="specialty-label"><h3>${en ? nameEn : nameZh}</h3><strong>${items}</strong></div><div class="bar"><i style="width:${items / largestSpecialty * 100}%"></i></div></div>`).join('')}</div>
        </div>
        <div class="language-panel"><div><h3>${t('同一套题目。八种语言。', 'One shared benchmark. Eight languages.')}</h3><p>${t('语言版本共享同一套 1,178 题；翻译专家审核覆盖共同抽样的 118 题。', 'Eight versions of the same 1,178 items. Expert translation review covers a shared sample of 118 items.')}</p></div><div class="languages">${['English', '简体中文', '繁體中文', 'Español', 'Français', 'Deutsch', '日本語', 'العربية'].map(x => `<span>${x}</span>`).join('')}</div></div>
      </section>

      <section id="team" class="section people-section" aria-labelledby="team-title">
        <div class="section-heading"><p class="eyebrow">THE RESEARCH COLLECTIVE</p><div class="heading-row"><h2 id="team-title">${t('项目团队', 'Project team')}</h2><p>${t('74 位项目成员，将临床经验与人工智能研究汇聚为共同的评测实践。', '74 team members connecting clinical expertise with AI research, across steering and specialty committees.')}</p></div></div>
        ${groups.map(([key, z, e], i) => {
          const members = data.team.filter(x => x.category === key);
          return `<section class="team-group ${i === 0 ? 'leadership' : ''}" id="${key}"><h3 class="group-title">${t(z, e)} <small>${members.length}</small></h3><div class="team-grid ${i === 0 ? 'chairs' : ''}">${members.map(x => `<article class="person" id="member-${x.key}" tabindex="-1"><div class="portrait"><img loading="lazy" src="${x.photo}" alt="${en ? x.nameEn : x.nameZh}" width="400" height="400"></div><div class="person-caption"><h3>${en ? x.nameEn : x.nameZh}</h3>${x.nameEn !== x.nameZh ? `<p>${en ? x.nameZh : x.nameEn}</p>` : ''}${chairProfiles[x.key] ? `<a class="chair-affiliation" href="${chairProfiles[x.key].url}">${en ? chairProfiles[x.key].en : chairProfiles[x.key].zh}</a>` : ''}</div></article>`).join('')}</div></section>`;
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

      <section class="section release" aria-labelledby="release-title"><p class="eyebrow">OPEN SCIENCE. SHARED PROGRESS.</p><div class="release-layout"><div><h2 id="release-title">${t('用公开基准<br><em>开展模型评测</em>', 'Put your model<br><em>to the test.</em>')}</h2><p>${t('从公开数据、参考答案与评分标准开始。', 'Start with open data, reference answers and transparent evaluation.')}</p></div><div class="release-actions"><a class="button primary" href="${repo}">${t('访问 GitHub 仓库', 'Explore on GitHub')}</a><a class="button secondary" href="${repo}#quick-start">${t('开始评测', 'Get started')}</a></div></div></section>
    </main>

    <footer><div class="footer-top"><a class="footer-brand" href="./">OmniDentBench</a><p>${t('面向口腔医学 AI 的<br>多模态、多语言评测基准。', 'A multimodal, multilingual<br>benchmark for dental AI.')}</p><div><a href="${repo}#institutions-and-team">${t('项目团队', 'Project team')}</a><a href="${repo}/issues">${t('反馈与交流', 'Feedback & issues')}</a></div></div><div class="footer-bottom"><p>${t('评测代码：MIT · 原创基准内容：CC BY 4.0', 'Evaluation code: MIT · Original benchmark content: CC BY 4.0')}</p><a href="${repo}/blob/main/data/figures.csv">${t('第三方图像来源与许可', 'Third-party figure credits & licences')}</a></div></footer>
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
