(() => {
  const { regions, profiles, profileUrls } = window.ODB_NETWORK_DATA;
  let selectedRegion = 'all';
  const mapRegions = [...regions,
    { key: 'japan', code: 'JP', en: 'Japan', zh: '日本', anchor: [140.87, 38.27], label: [90, 37.5], cardAlign: 'right' },
    { key: 'czechia', code: 'CZ', en: 'Czechia', zh: '捷克', anchor: [14.42, 50.08], label: [73, 15.5], cardAlign: 'above' },
    { key: 'spain', code: 'ES', en: 'Spain', zh: '西班牙', anchor: [2.17, 41.39], label: [43, 15.5], cardAlign: 'above' },
    { key: 'united-kingdom', code: 'UK', en: 'United Kingdom', zh: '英国', anchor: [.12, 52.2], label: [28, 15.5], cardAlign: 'above' }
  ];
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const project = ([longitude, latitude]) => [(longitude + 180) / 360 * 1000, (85 - latitude) / 145 * 500];
  const findRegion = key => mapRegions.find(region => region.key === key);
  const partnerRegion = key => regions.find(region => region.partners.includes(key));
  const partnerCount = (count, en) => en
    ? `${count} partner ${count === 1 ? 'institution' : 'institutions'}`
    : `${count} 家合作机构`;

  function portraitLabelY(region) {
    if (region.key === 'mainland') return 22;
    if (region.cardAlign === 'below') return 72;
    if (region.cardAlign === 'left' || region.cardAlign === 'right') return 30;
    return region.label[1];
  }

  function leaderPath(region, x, y, portrait) {
    const endX = region.label[0] * 10;
    const endY = (portrait ? portraitLabelY(region) : region.label[1]) * 5;
    // The European and southern callouts fan out in longitude order.
    const corridor = region.cardAlign === 'below' ? (portrait ? 310 : 289)
      : region.cardAlign === 'above' && region.key !== 'mainland' ? (portrait ? 112 : 104)
      : null;
    if (corridor !== null) {
      const bend = (corridor + endY) / 2;
      return `M${x} ${y} V${corridor} C${x} ${bend} ${endX} ${bend} ${endX} ${endY}`;
    }
    if (region.cardAlign === 'left') {
      const bendX = endX + 12;
      return `M${x} ${y} H${bendX} C${endX + 7} ${y} ${bendX} ${endY} ${endX} ${endY}`;
    }
    return `M${x} ${y} L${endX} ${endY}`;
  }

  function renderLeader(region) {
    const [x, y] = project(region.anchor).map(value => value.toFixed(1));
    return `<g data-map-line="${region.key}"><path d="${leaderPath(region, x, y, false)}"/><circle cx="${x}" cy="${y}" r="3.5"/></g>`;
  }

  let atlasObserver;

  function getPartners(data, regionKey = 'all') {
    const region = findRegion(regionKey);
    return regionKey === 'all' ? data.partners : data.partners.filter(partner => region?.partners?.includes(partner.key));
  }

  function getAffiliations(data, person) {
    return person.affiliationIds.map(id => data.affiliations[id]);
  }

  function getParticipantInstitutions(data, region = 'all') {
    const affiliationIds = new Set(data.team.flatMap(person => person.affiliationIds));
    const institutionIds = new Set();
    for (const id of affiliationIds) {
      const affiliation = data.affiliations[id];
      if (region === 'all' || affiliation.region === region) {
        institutionIds.add(affiliation.institutionId ?? id);
      }
    }
    return [...institutionIds].map(id => data.affiliations[id]);
  }

  function getPeople(data, { region = 'all', partner = null, query = '' } = {}) {
    const search = query.trim().toLocaleLowerCase();
    return data.team.filter(person => {
      const hasAffiliation = region === 'all' && !partner || getAffiliations(data, person).some(affiliation =>
        (region === 'all' || affiliation.region === region) && (!partner || affiliation.partners?.includes(partner))
      );
      return hasAffiliation && (!search || `${person.nameEn} ${person.nameZh}`.toLocaleLowerCase().includes(search));
    });
  }

  function render({ en, data, groups }) {
    const t = (zh, english) => en ? english : zh;
    const name = item => en ? item.en : item.zh;
    const sortedPeople = groups.flatMap(([category]) => data.team.filter(person => person.category === category));
    const rosterLink = t('跳到完整团队名册', 'Skip to the full team roster');
    const portrait = person => {
      const label = escape(en ? person.nameEn : person.nameZh);
      return `<button class="network-portrait" type="button" data-person="${person.key}" aria-label="${label}" aria-haspopup="dialog"><img src="${person.photo}" alt="" width="28" height="30" loading="lazy"></button>`;
    };
    return `<div class="network">
      <section class="network-map-column" id="collaboration-map" aria-labelledby="hero-title">
        <div class="network-hero-copy">
          <h1 id="hero-title">OmniDentBench</h1>
          <p>${t('口腔医学 AI 的多语言、多模态评测基准', 'A multilingual, multimodal benchmark for dental AI')}</p>
        </div>
        <div class="network-map-frame" role="region" aria-label="${t('全球机构与作者分布', 'Institution and author locations worldwide')}">
          <div class="network-map-canvas">
            <img class="network-land" src="./images/atlas/world-land.svg?v=natural-aspect" alt="" width="1000" height="500">
            <svg class="network-leaders" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <mask id="map-leader-mask" maskUnits="userSpaceOnUse">
                  <rect width="1000" height="500" fill="white"/>
                  <rect data-title-clearance width="0" height="0" fill="black" rx="3"/>
                  <rect data-title-clearance width="0" height="0" fill="black" rx="3"/>
                </mask>
              </defs>
              <g mask="url(#map-leader-mask)">${mapRegions.map(renderLeader).join('')}</g>
            </svg>
            ${mapRegions.map(region => {
              const partnerKeys = region.partners ?? [];
              const authors = getPeople(data, { region: region.key });
              const label = escape(name(region));
              const regionHeading = `<span class="network-pin-name">${label}</span><span class="network-pin-code" aria-hidden="true">${region.code}</span>`;
              const authorCount = t(`${authors.length} 位作者`, `${authors.length} ${authors.length === 1 ? 'author' : 'authors'}`);
              const regionControl = `type="button" data-region="${region.key}" aria-pressed="${selectedRegion === region.key}" aria-controls="network-panel network-roster participant-institutions"`;
              const photos = authors.slice(0, 3).map(person => `<img src="${person.photo}" alt="" width="24" height="25" draggable="false">`).join('');
              const width = partnerKeys.length > 2 ? 30 : region.key === 'hong-kong' ? 27 : region.key === 'united-states' ? 23 : partnerKeys.length ? 18 : region.key === 'japan' ? 8.5 : 12;
              return `<div class="network-cluster${partnerKeys.length ? '' : ' network-cluster--authors'}" data-card-align="${region.cardAlign ?? 'center'}" style="left:${region.label[0]}%;--pin-top:${region.label[1]}%;--portrait-pin-top:${portraitLabelY(region)}%;--cluster-width:${width}%;--mark-columns:${Math.min(partnerKeys.length, 3)}">
                ${partnerKeys.length
                  ? `<button class="network-pin" ${regionControl} aria-label="${label}: ${partnerCount(partnerKeys.length, en)}, ${authorCount}">${regionHeading}</button>
                    <div class="network-map-marks">${partnerKeys.map(key => {
                      const partner = data.partners.find(item => item.key === key);
                      const partnerLabel = escape(en ? partner.nameEn : partner.nameZh);
                      return `<span class="network-map-mark" title="${partnerLabel}"><img src="${partner.logo}" alt="${partnerLabel}" draggable="false"></span>`;
                    }).join('')}</div>
                    <button class="network-map-portraits" ${regionControl} aria-label="${label}: ${authorCount}">${photos}<small>${authorCount}</small></button>`
                  : `<button class="network-pin network-author-pin" ${regionControl} aria-label="${label}: ${authorCount}">${regionHeading}<span class="network-map-portraits">${photos}</span></button>`}
              </div>`;
            }).join('')}
          </div>
        </div>
      </section>
      <section id="institutions" class="section institutions-section" aria-labelledby="collaboration-directory-title" tabindex="-1">
        <h2 class="visually-hidden" id="collaboration-directory-title">${t('机构与成员', 'Institutions and people')}</h2>
        <div id="network-panel" class="network-panel">
          <div class="network-directory-heading">
            <h3 id="partner-institutions-title">${t('合作机构', 'Partner institutions')}</h3>
            <p id="network-panel-count"></p>
          </div>
          <div class="network-panel-content" id="network-results" role="region" aria-labelledby="partner-institutions-title"></div>
          <span id="network-status" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></span>
        </div>
        <div class="network-roster" id="network-roster" role="group" aria-label="${t('项目团队头像', 'Project team portraits')}">
          <a class="network-roster-skip network-roster-shortcut visually-hidden" href="#team">${rosterLink}</a>
          <div class="network-roster-grid">${sortedPeople.map(person => portrait(person)).join('')}</div>
          <span class="network-roster-tooltip" aria-hidden="true" hidden></span>
        </div>
        <section id="participant-institutions" aria-labelledby="participant-institutions-title">
          <div class="network-directory-heading">
            <h3 id="participant-institutions-title">${t('参与者所在机构', 'Participant affiliations')}</h3>
            <a class="network-roster-skip" href="#team">${rosterLink}</a>
          </div>
          <ul class="network-affiliation-list" role="list"></ul>
        </section>
      </section>
      <dialog class="network-dialog" aria-labelledby="network-person-title"><button class="network-dialog-close" type="button" aria-label="${t('关闭成员资料', 'Close profile')}">×</button><div class="network-dialog-content"></div></dialog>
    </div>`;
  }

  function init({ en, data, groups }) {
    const root = document.querySelector('.network');
    if (!root) return;
    const t = (zh, english) => en ? english : zh;
    const name = item => en ? item.en : item.zh;
    const personName = person => en ? person.nameEn : person.nameZh;
    const partnerName = partner => en ? partner.nameEn : partner.nameZh;
    const peopleCount = count => t(`${count} 位成员`, `${count} ${count === 1 ? 'person' : 'people'}`);
    const role = person => {
      const group = groups.find(([category]) => category === person.category);
      return group ? group[en ? 2 : 1] : '';
    };
    const content = root.querySelector('#network-results');
    const affiliationList = root.querySelector('.network-affiliation-list');
    const panelCount = root.querySelector('#network-panel-count');
    const status = root.querySelector('#network-status');
    const dialog = root.querySelector('dialog');
    const map = root.querySelector('#collaboration-map');
    const header = document.querySelector('.site-header');
    const canvas = root.querySelector('.network-map-canvas');
    const copy = root.querySelector('.network-hero-copy');
    const land = canvas.querySelector('.network-land');
    const leaders = mapRegions.map(region => {
      const group = canvas.querySelector(`[data-map-line="${region.key}"]`);
      return { region, path: group.querySelector('path'), point: group.querySelector('circle') };
    });
    const cards = [...canvas.querySelectorAll('.network-cluster')];
    const titleClearances = canvas.querySelectorAll('[data-title-clearance]');
    let atlasOffset = 0;

    function layoutAtlas() {
      const mapBounds = canvas.getBoundingClientRect();
      if (!mapBounds.width || !mapBounds.height) return;
      const scaleX = 1000 / mapBounds.width;
      const scaleY = 500 / mapBounds.height;
      const landBounds = land.getBoundingClientRect();
      const portrait = getComputedStyle(map).getPropertyValue('--portrait-atlas').trim() === '1';

      for (const { region, path, point } of leaders) {
        const [mapX, mapY] = project(region.anchor);
        const x = ((landBounds.left - mapBounds.left + mapX / 1000 * landBounds.width) * scaleX).toFixed(1);
        const y = ((landBounds.top - mapBounds.top + mapY / 500 * landBounds.height) * scaleY).toFixed(1);
        path.setAttribute('d', leaderPath(region, x, y, portrait));
        point.setAttribute('cx', x);
        point.setAttribute('cy', y);
      }
      const titleBounds = Array.from(copy.children, element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getBoundingClientRect();
      });
      const occupied = [...titleBounds, ...cards.map(card => card.getBoundingClientRect())];
      const top = Math.min(...occupied.map(bounds => bounds.top));
      const bottom = Math.max(...occupied.map(bounds => bounds.bottom));
      const hero = map.getBoundingClientRect();
      const headerBottom = hero.top + header.getBoundingClientRect().height;
      const occupiedHeight = bottom - top;
      const centeredTop = (hero.top + hero.bottom - occupiedHeight) / 2 - (portrait ? hero.height * .09 : 0);
      const clearance = Math.max(0, Math.min(32, (hero.bottom - headerBottom - occupiedHeight) / 2));
      const adjustment = Math.max(headerBottom + clearance, centeredTop) - top;

      if (Math.abs(adjustment) > .1) {
        atlasOffset += adjustment;
        map.style.setProperty('--atlas-offset', `${atlasOffset}px`);
      }

      titleBounds.forEach((bounds, index) => {
        const clearance = titleClearances[index];
        const horizontalPadding = 8;
        const verticalPadding = 2;
        clearance.setAttribute('x', (bounds.left - mapBounds.left - horizontalPadding) * scaleX);
        clearance.setAttribute('y', (bounds.top - mapBounds.top - verticalPadding) * scaleY);
        clearance.setAttribute('width', (bounds.width + 2 * horizontalPadding) * scaleX);
        clearance.setAttribute('height', (bounds.height + 2 * verticalPadding) * scaleY);
      });
    }

    atlasObserver?.disconnect();
    atlasObserver = new ResizeObserver(layoutAtlas);
    [map, header, canvas, copy, land, ...cards].forEach(element => atlasObserver.observe(element));
    document.fonts.ready.then(() => {
      if (canvas.isConnected) layoutAtlas();
    });
    const roster = root.querySelector('.network-roster');
    const rosterTooltip = root.querySelector('.network-roster-tooltip');
    const portraits = roster.querySelectorAll('.network-portrait');
    const regionControls = map.querySelectorAll('[data-region]');
    let dialogTrigger = null;

    function hideRosterName() {
      rosterTooltip.hidden = true;
    }

    function showRosterName(button) {
      rosterTooltip.textContent = button.getAttribute('aria-label');
      rosterTooltip.hidden = false;
      const item = button.getBoundingClientRect();
      const area = roster.getBoundingClientRect();
      const left = item.left - area.left + (item.width - rosterTooltip.offsetWidth) / 2;
      rosterTooltip.style.left = `${Math.max(8, Math.min(area.width - rosterTooltip.offsetWidth - 8, left))}px`;
      rosterTooltip.style.top = `${item.top - area.top - rosterTooltip.offsetHeight - 6}px`;
    }

    roster.addEventListener('pointerover', event => {
      const button = event.target.closest('.network-portrait');
      if (button && event.pointerType !== 'touch') showRosterName(button);
    });
    roster.addEventListener('pointerout', event => {
      const button = event.target.closest('.network-portrait');
      if (button && !button.contains(event.relatedTarget)) hideRosterName();
    });
    roster.addEventListener('focusin', event => {
      const button = event.target.closest('.network-portrait');
      if (button) showRosterName(button);
    });
    roster.addEventListener('focusout', hideRosterName);
    roster.addEventListener('keydown', event => {
      if (event.key === 'Escape') hideRosterName();
    });

    function update() {
      const region = findRegion(selectedRegion);
      const partners = getPartners(data, selectedRegion);
      const people = getPeople(data, { region: selectedRegion });
      const institutions = getParticipantInstitutions(data, selectedRegion);
      const institutionNames = institutions.map(institution => {
        const english = institution.institutionName ?? institution.name;
        const label = t(institution.institutionNameZh ?? institution.nameZh ?? english, english);
        return label.replace(/[.。]$/, '');
      }).sort((first, second) => first.localeCompare(second, t('zh-CN', 'en')));
      const visiblePeople = new Set(people.map(person => person.key));
      panelCount.textContent = `${region ? `${name(region)} · ` : ''}${partnerCount(partners.length, en)} · ${peopleCount(people.length)}`;
      regionControls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === selectedRegion)));
      leaders.forEach(({ region, path }) => path.parentElement.classList.toggle('is-selected', region.key === selectedRegion));
      content.innerHTML = `<div class="network-institution-list">${partners.map(partner => `<div class="network-institution-row"><img src="${partner.logo}" alt="" loading="lazy"><span><strong>${escape(partnerName(partner))}</strong><small>${name(partnerRegion(partner.key))}</small></span></div>`).join('')}</div>`;
      affiliationList.innerHTML = institutionNames.map(label => `<li>${escape(label)}</li>`).join('');
      hideRosterName();
      portraits.forEach(button => { button.hidden = !visiblePeople.has(button.dataset.person); });
      status.textContent = `${panelCount.textContent} · ${t(`${institutions.length} 家参与者所在机构`, `${institutions.length} participant ${institutions.length === 1 ? 'affiliation' : 'affiliations'}`)}`;
    }

    function openPerson(key, trigger) {
      const person = data.team.find(item => item.key === key);
      if (!person) return;
      hideRosterName();
      const profileUrl = profileUrls?.[key] ?? profiles[key]?.url;
      const affiliations = getAffiliations(data, person)
        .map(affiliation => `<li>${escape(en ? affiliation.name : affiliation.nameZh ?? affiliation.name)}</li>`)
        .join('');
      const inTeamRoster = Boolean(trigger.closest('#team'));
      dialogTrigger = trigger;
      dialog.querySelector('.network-dialog-content').innerHTML = `<img class="network-profile-photo" src="${person.photo}" alt="${escape(personName(person))}" width="160" height="176"><p class="network-kicker">${escape(role(person))}</p><h3 id="network-person-title">${escape(personName(person))}</h3>${person.nameEn !== person.nameZh ? `<p class="network-profile-other-name">${escape(en ? person.nameZh : person.nameEn)}</p>` : ''}<div class="network-profile-affiliations"><h4>${t('机构', 'Affiliations')}</h4><ul>${affiliations}</ul></div>${profileUrl ? `<a class="network-profile-source" href="${escape(profileUrl)}" target="_blank" rel="noopener noreferrer">${t('机构公开资料', 'Institutional profile')}</a>` : ''}${inTeamRoster ? '' : `<a class="network-profile-team" href="#member-${person.key}">${t('在团队名册中查看', 'View in the team roster')}</a>`}`;
      dialog.showModal();
    }

    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button?.hasAttribute('data-region')) {
        const region = button.dataset.region;
        selectedRegion = selectedRegion === region ? 'all' : region;
        update();
      } else if (button?.hasAttribute('data-person')) {
        openPerson(button.dataset.person, button);
      } else if (button?.classList.contains('network-dialog-close')) {
        dialog.close();
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
    document.getElementById('team').addEventListener('click', event => {
      const button = event.target.closest('button[data-person]');
      if (button) openPerson(button.dataset.person, button);
    });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => dialogTrigger?.focus({ preventScroll: true }));
    update();
    layoutAtlas();
  }

  window.ODBNetwork = { render, init, getPartners, getPeople, getParticipantInstitutions, project };
})();
