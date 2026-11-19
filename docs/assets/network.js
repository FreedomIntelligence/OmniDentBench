(() => {
  const { regions, profiles } = window.ODB_NETWORK_DATA;
  const state = { region: 'all', mode: 'institutions', partner: null, query: '' };
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const project = ([longitude, latitude]) => [(longitude + 180) / 360 * 1000, (85 - latitude) / 145 * 500];
  const findRegion = key => regions.find(region => region.key === key);
  const partnerRegion = key => regions.find(region => region.partners.includes(key));

  function getPartners(data, regionKey = 'all') {
    const region = findRegion(regionKey);
    return regionKey === 'all' ? data.partners : data.partners.filter(partner => region?.partners.includes(partner.key));
  }

  function getPeople(data, { region = 'all', partner = null, query = '' } = {}) {
    const search = query.trim().toLocaleLowerCase();
    return data.team.filter(person => {
      const profile = profiles[person.key];
      return (region === 'all' || profile?.region === region)
        && (!partner || profile?.partners.includes(partner))
        && (!search || `${person.nameEn} ${person.nameZh}`.toLocaleLowerCase().includes(search));
    });
  }

  function render({ en, data, groups }) {
    const t = (zh, english) => en ? english : zh;
    const name = item => en ? item.en : item.zh;
    const institutionCount = count => t(`${count} 家机构`, `${count} ${count === 1 ? 'institution' : 'institutions'}`);
    const sortedPeople = groups.flatMap(([category]) => data.team.filter(person => person.category === category));
    return `<section class="network" aria-label="${t('交互式合作地图', 'Interactive collaboration map')}">
      <div class="network-layout">
        <div class="network-map-column">
          <div class="network-map-controls"><label>${t('定位', 'Locate')}<select class="network-location"><option value="all">${t('全部国家及地区', 'All countries & regions')}</option>${regions.map(region => `<option value="${region.key}">${name(region)}</option>`).join('')}</select></label><div class="network-zoom"><button type="button" data-zoom="out" aria-label="${t('缩小地图', 'Zoom out')}">−</button><output class="network-scale" aria-label="${t('缩放比例', 'Zoom level')}">100%</output><button type="button" data-zoom="in" aria-label="${t('放大地图', 'Zoom in')}">+</button><button type="button" data-zoom="fit">${t('全图', 'Fit map')}</button></div></div>
          <div class="network-map-scroll" tabindex="0" role="region" aria-label="${t('全球机构分布；小屏幕可横向滚动，或使用下方地区按钮', 'Institution locations; scroll horizontally on small screens or use the location buttons below')}">
            <div class="network-map-canvas">
              <img class="network-land" src="./images/atlas/world-land.svg" alt="" width="1000" height="500">
              <svg class="network-leaders" viewBox="0 0 1000 500" aria-hidden="true">${regions.map(region => {
                const [x, y] = project(region.anchor);
                return `<g data-map-line="${region.key}"><path d="M${x.toFixed(1)} ${y.toFixed(1)} L${region.label[0] * 10} ${region.label[1] * 5}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/></g>`;
              }).join('')}</svg>
              ${regions.map(region => `<div class="network-cluster" style="left:${region.label[0]}%;top:${region.label[1]}%;--cluster-width:${region.partners.length > 2 ? 30 : region.key === 'hong-kong' ? 27 : region.key === 'united-states' ? 23 : 18}%;--mark-columns:${Math.min(region.partners.length, 3)}"><button class="network-pin" type="button" data-region="${region.key}" aria-pressed="${state.region === region.key}" aria-controls="network-panel" aria-label="${escape(name(region))}: ${institutionCount(region.partners.length)}"><span>${name(region)}</span><strong>${region.partners.length}</strong></button><div class="network-map-marks">${region.partners.map(key => {
                const partner = data.partners.find(item => item.key === key);
                const label = escape(en ? partner.nameEn : partner.nameZh);
                return `<button type="button" data-partner="${key}" aria-label="${label}" title="${label}"><img src="${partner.logo}" alt="" draggable="false"></button>`;
              }).join('')}</div></div>`).join('')}
            </div>
          </div>
          <p class="network-map-note">${t('点选地区或 Logo 查看机构。标记表示地区代表位置。', 'Select a location or logo. Markers represent regional locations.')}</p>
          <div class="network-regions" aria-label="${t('按国家或地区筛选', 'Filter by country or region')}">
            ${regions.map(region => `<button type="button" data-region="${region.key}" aria-pressed="${state.region === region.key}" aria-controls="network-panel">${name(region)} <strong>${region.partners.length}</strong></button>`).join('')}
          </div>
        </div>
        <aside id="network-panel" class="network-panel" aria-labelledby="network-panel-title">
          <div class="network-panel-heading"><h3 id="network-panel-title"></h3><p id="network-panel-count"></p></div>
          <div class="network-modes" role="group" aria-label="${t('查看内容', 'Browse content')}"><button type="button" data-mode="institutions" aria-pressed="true">${t('机构', 'Institutions')}</button><button type="button" data-mode="people" aria-pressed="false">${t('成员', 'People')}</button></div>
          <label class="network-search" hidden><span>${t('搜索成员', 'Search people')}</span><input type="search" placeholder="${t('姓名', 'Search by name')}" autocomplete="off"></label>
          <div class="network-panel-content" id="network-results" tabindex="0" aria-label="${t('机构与成员列表', 'Institutions and people')}"></div>
          <p class="network-profile-note">${t('地区成员按公开机构资料关联。完整名册包含 74 位成员。', 'Regional profiles use public affiliation sources. All 74 members are in the full roster.')}</p>
          <span id="network-status" class="visually-hidden" role="status" aria-live="polite"></span>
        </aside>
      </div>
      <details class="network-roster" open>
        <summary><span>${t('认识项目团队', 'Meet the project team')} <small>${data.team.length} ${t('位成员', 'people')}</small></span><span class="network-roster-toggle" aria-hidden="true"></span></summary>
        <div class="network-roster-grid">${sortedPeople.map(person => `<button class="network-portrait" type="button" data-person="${person.key}" aria-haspopup="dialog"><img src="${person.photo}" alt="" width="36" height="39" loading="lazy"><span>${escape(en ? person.nameEn : person.nameZh)}</span></button>`).join('')}</div>
      </details>
      <dialog class="network-dialog" aria-labelledby="network-person-title"><button class="network-dialog-close" type="button" aria-label="${t('关闭成员资料', 'Close profile')}">×</button><div class="network-dialog-content"></div></dialog>
    </section>`;
  }

  function init({ en, data, groups }) {
    const root = document.querySelector('.network');
    if (!root) return;
    const t = (zh, english) => en ? english : zh;
    const name = item => en ? item.en : item.zh;
    const personName = person => en ? person.nameEn : person.nameZh;
    const partnerName = partner => en ? partner.nameEn : partner.nameZh;
    const institutionCount = count => t(`${count} 家机构`, `${count} ${count === 1 ? 'institution' : 'institutions'}`);
    const role = person => {
      const group = groups.find(([category]) => category === person.category);
      return group ? group[en ? 2 : 1] : '';
    };
    const content = root.querySelector('#network-results');
    const search = root.querySelector('.network-search');
    const input = search.querySelector('input');
    const dialog = root.querySelector('dialog');
    const viewport = root.querySelector('.network-map-scroll');
    const canvas = root.querySelector('.network-map-canvas');
    const location = root.querySelector('.network-location');
    let dialogTrigger = null;
    let zoom = 1;

    function setZoom(next, center) {
      const x = center ? center[0] : (viewport.scrollLeft + viewport.clientWidth / 2) / canvas.offsetWidth;
      const y = center ? center[1] : (viewport.scrollTop + viewport.clientHeight / 2) / canvas.offsetHeight;
      zoom = Math.max(1, Math.min(4, next));
      canvas.style.width = `${zoom * 100}%`;
      viewport.dataset.zoomed = String(zoom > 1);
      root.querySelector('.network-scale').textContent = `${Math.round(zoom * 100)}%`;
      root.querySelector('[data-zoom="out"]').disabled = zoom <= 1;
      root.querySelector('[data-zoom="in"]').disabled = zoom >= 4;
      viewport.scrollTo(x * canvas.offsetWidth - viewport.clientWidth / 2, y * canvas.offsetHeight - viewport.clientHeight / 2);
    }

    function revealLocation() {
      const region = findRegion(state.region);
      const readableZoom = viewport.clientWidth < 680 ? Math.min(3, 800 / viewport.clientWidth) : 1;
      if (region) setZoom(Math.max(zoom, readableZoom), [region.label[0] / 100, region.label[1] / 100]);
    }

    const personCard = person => `<button class="network-person-row" type="button" data-person="${person.key}" aria-haspopup="dialog"><img src="${person.photo}" alt="" width="64" height="70" loading="lazy"><span><strong>${escape(personName(person))}</strong><small>${escape(role(person))}</small></span></button>`;
    const emptyPeople = () => `<div class="network-empty"><p>${state.query ? t('没有找到匹配的成员。', 'No people match your search.') : t('此处暂无已关联的成员资料。', 'No profiles are linked to this location yet.')}</p><button type="button" data-all-people>${t('浏览完整团队', 'Browse the full team')}</button></div>`;

    function update({ resetScroll = true } = {}) {
      const region = findRegion(state.region);
      const partners = getPartners(data, state.region);
      const people = getPeople(data, state);
      root.querySelector('#network-panel-title').textContent = region ? name(region) : t('全球协作', 'A global collaboration');
      root.querySelector('#network-panel-count').textContent = region
        ? `${institutionCount(partners.length)} · ${t(`${getPeople(data, { region: state.region }).length} 位已关联成员`, `${getPeople(data, { region: state.region }).length} linked people`)}`
        : t(`${data.partners.length} 家机构 · ${data.team.length} 位成员 · 7 个国家及地区`, `${data.partners.length} institutions · ${data.team.length} people · 7 countries & regions`);
      root.querySelectorAll('[data-region]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === state.region)));
      root.querySelectorAll('[data-map-line]').forEach(line => line.classList.toggle('is-selected', line.dataset.mapLine === state.region));
      location.value = state.region;
      root.querySelectorAll('.network-map-marks [data-partner]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.partner === state.partner)));
      root.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
      search.hidden = state.mode !== 'people';
      input.value = state.query;

      if (state.mode === 'people') {
        content.innerHTML = `<div class="network-person-list">${people.length ? people.map(personCard).join('') : emptyPeople()}</div>`;
      } else if (state.partner) {
        const partner = data.partners.find(item => item.key === state.partner);
        const linkedPeople = getPeople(data, { partner: state.partner });
        content.innerHTML = `<button class="network-back" type="button" data-back>${t('查看本地区全部机构', 'All institutions in this location')}</button><div class="network-institution-detail"><img src="${partner.logo}" alt=""><h4>${escape(partnerName(partner))}</h4><p>${name(partnerRegion(partner.key))}</p></div><h4 class="network-subheading">${t('关联成员', 'Linked people')} <span>${linkedPeople.length}</span></h4>${linkedPeople.length ? linkedPeople.map(personCard).join('') : `<p class="network-empty-copy">${t('尚未补充该机构与项目成员的关联资料。可在完整团队中浏览全部成员。', 'Member affiliations for this institution have not yet been linked. Explore all members in the full team.')}</p>`}`;
      } else {
        content.innerHTML = `<div class="network-institution-list">${partners.map(partner => `<button class="network-institution-row" type="button" data-partner="${partner.key}"><img src="${partner.logo}" alt="" loading="lazy"><span><strong>${escape(partnerName(partner))}</strong><small>${name(partnerRegion(partner.key))}</small></span></button>`).join('')}</div>${region && people.length ? `<h4 class="network-subheading">${t('关联成员', 'Linked people')} <span>${people.length}</span></h4>${people.map(personCard).join('')}` : ''}`;
      }
      if (resetScroll) content.scrollTop = 0;
      root.querySelector('#network-status').textContent = `${root.querySelector('#network-panel-title').textContent}. ${state.mode === 'people' ? t(`${people.length} 位成员`, `${people.length} people`) : institutionCount(partners.length)}`;
    }

    function openPerson(key, trigger) {
      const person = data.team.find(item => item.key === key);
      if (!person) return;
      const profile = profiles[key];
      dialogTrigger = trigger;
      dialog.querySelector('.network-dialog-content').innerHTML = `<img class="network-profile-photo" src="${person.photo}" alt="${escape(personName(person))}" width="160" height="176"><p class="network-kicker">${escape(role(person))}</p><h3 id="network-person-title">${escape(personName(person))}</h3>${person.nameEn !== person.nameZh ? `<p class="network-profile-other-name">${escape(en ? person.nameZh : person.nameEn)}</p>` : ''}${profile ? `<p class="network-profile-affiliation">${escape(name(profile))}</p><p class="network-profile-region">${name(findRegion(profile.region))}</p><a class="network-profile-source" href="${profile.url}" target="_blank" rel="noopener noreferrer">${t('机构公开资料', 'Institutional profile')}</a>` : ''}<a class="network-profile-team" href="#member-${person.key}">${t('在团队名册中查看', 'View in the team roster')}</a>`;
      dialog.showModal();
    }

    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button?.hasAttribute('data-region')) {
        state.region = button.dataset.region;
        state.partner = null;
        state.query = '';
        update();
        if (button.closest('.network-regions')) revealLocation();
      } else if (button?.hasAttribute('data-mode')) {
        state.mode = button.dataset.mode;
        state.partner = null;
        state.query = '';
        update();
      } else if (button?.hasAttribute('data-partner')) {
        state.partner = button.dataset.partner;
        state.region = partnerRegion(state.partner).key;
        state.mode = 'institutions';
        state.query = '';
        update();
        content.querySelector('[data-back]').focus({ preventScroll: true });
        if (window.matchMedia('(max-width: 1199px)').matches) root.querySelector('#network-panel').scrollIntoView({ block: 'start' });
      } else if (button?.hasAttribute('data-back')) {
        const key = state.partner;
        state.partner = null;
        update();
        content.querySelector(`[data-partner="${key}"]`)?.focus({ preventScroll: true });
      } else if (button?.hasAttribute('data-all-people')) {
        state.region = 'all';
        state.partner = null;
        state.mode = 'people';
        state.query = '';
        update();
        input.focus({ preventScroll: true });
      } else if (button?.hasAttribute('data-person')) {
        openPerson(button.dataset.person, button);
      } else if (button?.classList.contains('network-dialog-close')) {
        dialog.close();
      } else if (button?.hasAttribute('data-zoom')) {
        setZoom(button.dataset.zoom === 'fit' ? 1 : zoom * (button.dataset.zoom === 'in' ? 1.5 : 1 / 1.5), button.dataset.zoom === 'fit' ? [.5, .5] : undefined);
      }
      const teamLink = event.target.closest('.network-profile-team');
      if (teamLink) {
        event.preventDefault();
        const destination = document.querySelector(teamLink.getAttribute('href'));
        dialogTrigger = null;
        dialog.close();
        destination?.scrollIntoView({ block: 'center' });
        destination?.focus({ preventScroll: true });
      }
    });
    input.addEventListener('input', () => {
      state.query = input.value;
      update({ resetScroll: false });
    });
    location.addEventListener('change', () => {
      state.region = location.value;
      state.partner = null;
      state.query = '';
      update();
      if (state.region === 'all') setZoom(1, [.5, .5]);
      else revealLocation();
    });
    let drag = null;
    viewport.addEventListener('pointerdown', event => {
      if (zoom <= 1 || event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
      drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-panning');
    });
    viewport.addEventListener('pointermove', event => {
      if (drag) viewport.scrollTo(drag.left + drag.x - event.clientX, drag.top + drag.y - event.clientY);
    });
    viewport.addEventListener('lostpointercapture', () => {
      drag = null;
      viewport.classList.remove('is-panning');
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => dialogTrigger?.focus({ preventScroll: true }));
    update();
    setZoom(1, [.5, .5]);
  }

  window.ODBNetwork = { render, init, getPartners, getPeople, project };
})();
