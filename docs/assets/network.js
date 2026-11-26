(() => {
  const { regions, profiles, profileUrls } = window.ODB_NETWORK_DATA;
  const state = { region: 'all', partner: null };
  const mapRegions = [...regions,
    { key: 'japan', code: 'JP', en: 'Japan', zh: '日本', anchor: [140.87, 38.27], label: [90, 37.5], cardAlign: 'right' },
    { key: 'czechia', code: 'CZ', en: 'Czechia', zh: '捷克', anchor: [14.42, 50.08], label: [73, 15.5], cardAlign: 'above' },
    { key: 'spain', code: 'ES', en: 'Spain', zh: '西班牙', anchor: [2.17, 41.39], label: [43, 15.5], cardAlign: 'above' },
    { key: 'united-kingdom', code: 'UK', en: 'United Kingdom', zh: '英国', anchor: [.12, 52.2], label: [28, 15.5], cardAlign: 'above' }
  ];
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const project = ([longitude, latitude]) => [(longitude + 180) / 360 * 1000, (85 - latitude) / 145 * 500];
  const findRegion = key => regions.find(region => region.key === key);
  const partnerRegion = key => regions.find(region => region.partners.includes(key));

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
    return regionKey === 'all' ? data.partners : data.partners.filter(partner => region?.partners.includes(partner.key));
  }

  function getAffiliations(data, person) {
    return person.affiliationIds.map(id => data.affiliations[id]);
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
    const institutionCount = count => t(`${count} 家机构`, `${count} ${count === 1 ? 'institution' : 'institutions'}`);
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
              const authorControl = 'aria-controls="map-author-popover" aria-expanded="false"';
              const photos = authors.slice(0, 3).map(person => `<img src="${person.photo}" alt="" width="24" height="25" draggable="false">`).join('');
              const width = partnerKeys.length > 2 ? 30 : region.key === 'hong-kong' ? 27 : region.key === 'united-states' ? 23 : partnerKeys.length ? 18 : region.key === 'japan' ? 8.5 : 12;
              return `<div class="network-cluster${partnerKeys.length ? '' : ' network-cluster--authors'}" data-card-align="${region.cardAlign ?? 'center'}" style="left:${region.label[0]}%;--pin-top:${region.label[1]}%;--portrait-pin-top:${portraitLabelY(region)}%;--cluster-width:${width}%;--mark-columns:${Math.min(partnerKeys.length, 3)}">
                ${partnerKeys.length
                  ? `<button class="network-pin" type="button" data-region="${region.key}" aria-pressed="${state.region === region.key}" aria-controls="network-panel map-author-popover" aria-expanded="false" aria-label="${label}: ${institutionCount(partnerKeys.length)}, ${authorCount}">${regionHeading}</button>
                    <div class="network-map-marks">${partnerKeys.map(key => {
                      const partner = data.partners.find(item => item.key === key);
                      const partnerLabel = escape(en ? partner.nameEn : partner.nameZh);
                      return `<button type="button" data-partner="${key}" aria-label="${partnerLabel}" title="${partnerLabel}"><img src="${partner.logo}" alt="" draggable="false"></button>`;
                    }).join('')}</div>
                    <button class="network-map-portraits" type="button" data-map-author="${region.key}" ${authorControl} aria-label="${label}: ${authorCount}">${photos}<small>${authorCount}</small></button>`
                  : `<button class="network-pin network-author-pin" type="button" data-map-author="${region.key}" ${authorControl} aria-label="${label}: ${authorCount}">${regionHeading}<span class="network-map-portraits">${photos}</span></button>`}
              </div>`;
            }).join('')}
          </div>
        </div>
        <section class="network-map-author-popover" id="map-author-popover" aria-labelledby="map-author-title" hidden>
          <header><h2 id="map-author-title"></h2><button class="network-map-author-close" type="button" aria-label="${t('收起当地作者', 'Collapse local authors')}">×</button></header>
          <div class="network-map-author-list"></div>
        </section>
      </section>
      <section id="institutions" class="section institutions-section" aria-labelledby="collaboration-directory-title" tabindex="-1">
        <h2 class="visually-hidden" id="collaboration-directory-title">${t('合作机构与成员', 'Institutions and people')}</h2>
        <div id="network-panel" class="network-panel">
          <p id="network-panel-count"></p>
          <div class="network-panel-content" id="network-results" role="region" aria-label="${t('机构与成员列表', 'Institutions and people')}"></div>
          <span id="network-status" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></span>
        </div>
        <div class="network-roster" role="group" aria-label="${t('项目团队头像', 'Project team portraits')}">
          <a class="network-roster-skip network-roster-shortcut visually-hidden" href="#team">${rosterLink}</a>
          <div class="network-roster-grid">${sortedPeople.map(person => portrait(person)).join('')}</div>
          <a class="network-roster-skip" href="#team">${rosterLink}</a>
          <span class="network-roster-tooltip" aria-hidden="true" hidden></span>
        </div>
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
    const institutionCount = count => t(`${count} 家机构`, `${count} ${count === 1 ? 'institution' : 'institutions'}`);
    const peopleCount = count => t(`${count} 位成员`, `${count} ${count === 1 ? 'person' : 'people'}`);
    const role = person => {
      const group = groups.find(([category]) => category === person.category);
      return group ? group[en ? 2 : 1] : '';
    };
    const content = root.querySelector('#network-results');
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
    const authorPopover = root.querySelector('#map-author-popover');
    const authorList = authorPopover.querySelector('.network-map-author-list');
    const closeAuthors = authorPopover.querySelector('.network-map-author-close');
    let activeAuthorRegion = null;
    let authorTrigger = null;

    function setAuthorExpanded(region, expanded) {
      map.querySelectorAll(`[data-region="${region}"], [data-map-author="${region}"]`).forEach(button => {
        button.setAttribute('aria-expanded', String(expanded));
      });
      canvas.querySelector(`[data-map-line="${region}"]`).classList.toggle('is-author-open', expanded);
    }

    function hideMapAuthors(restoreFocus = false) {
      if (!activeAuthorRegion) return;
      setAuthorExpanded(activeAuthorRegion, false);
      authorPopover.hidden = true;
      activeAuthorRegion = null;
      if (restoreFocus) authorTrigger.focus({ preventScroll: true });
      authorTrigger = null;
    }

    function toggleMapAuthors(regionKey, trigger) {
      if (regionKey === activeAuthorRegion) {
        hideMapAuthors();
        return;
      }
      hideMapAuthors();
      const region = mapRegions.find(item => item.key === regionKey);
      const people = getPeople(data, { region: regionKey });
      authorPopover.querySelector('h2').textContent = name(region);
      authorList.innerHTML = people.map(person => {
        const label = escape(personName(person));
        return `<button class="network-portrait" type="button" data-person="${person.key}" aria-label="${label}" aria-haspopup="dialog" title="${label}"><img src="${person.photo}" alt="" width="28" height="30"></button>`;
      }).join('');
      authorList.scrollTop = 0;
      authorPopover.hidden = false;
      activeAuthorRegion = regionKey;
      authorTrigger = trigger;
      setAuthorExpanded(regionKey, true);

      const bounds = map.getBoundingClientRect();
      const point = trigger.getBoundingClientRect();
      const width = authorPopover.offsetWidth;
      const height = authorPopover.offsetHeight;
      const left = Math.max(8, Math.min(point.left - bounds.left + (point.width - width) / 2, bounds.width - width - 8));
      const below = point.bottom - bounds.top + 8;
      const above = point.top - bounds.top - height - 8;
      const top = below + height > bounds.height - 8 && above >= 8 ? above : below;
      authorPopover.style.setProperty('--author-left', `${left}px`);
      authorPopover.style.setProperty('--author-top', `${Math.max(8, Math.min(top, bounds.height - height - 8))}px`);
    }

    map.addEventListener('pointerdown', event => {
      if (!event.target.closest('#map-author-popover, [data-region], [data-map-author]')) hideMapAuthors();
    });
    map.addEventListener('keydown', event => {
      if (!activeAuthorRegion) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        hideMapAuthors(true);
      } else if (event.key === 'Tab' && !event.shiftKey && event.target === authorTrigger) {
        event.preventDefault();
        closeAuthors.focus({ preventScroll: true });
      } else if (event.key === 'Tab' && event.shiftKey && event.target === closeAuthors) {
        event.preventDefault();
        authorTrigger.focus({ preventScroll: true });
      }
    });
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

    const personCard = person => `<button class="network-person-row" type="button" data-person="${person.key}" aria-haspopup="dialog"><img src="${person.photo}" alt="" width="64" height="70" loading="lazy"><span><strong>${escape(personName(person))}</strong><small>${escape(role(person))}</small></span></button>`;
    function renderLinkedPeople(people) {
      return `<h3 class="network-subheading">${t('关联成员', 'Linked people')} <span>${people.length}</span></h3><div class="network-person-list">${people.map(personCard).join('')}</div>`;
    }

    function update() {
      const region = findRegion(state.region);
      const partners = getPartners(data, state.region);
      const partner = partners.find(item => item.key === state.partner);
      const people = region ? data.team.filter(person => profiles[person.key]?.region === region.key) : data.team;
      const regionLabel = region ? name(region) : '';
      panelCount.textContent = `${regionLabel ? `${regionLabel} · ` : ''}${institutionCount(partners.length)} · ${region
        ? t(`${people.length} 位已关联成员`, `${people.length} linked ${people.length === 1 ? 'person' : 'people'}`)
        : peopleCount(people.length)}`;
      root.querySelectorAll('[data-region]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === state.region)));
      root.querySelectorAll('[data-map-line]').forEach(line => line.classList.toggle('is-selected', line.dataset.mapLine === state.region));
      root.querySelectorAll('.network-map-marks [data-partner]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.partner === state.partner)));
      if (partner) {
        const linkedProfiles = people.filter(person => profiles[person.key].partners.includes(partner.key));
        const linkedPeople = linkedProfiles.length ? linkedProfiles : getPeople(data, { region: state.region, partner: partner.key });
        content.innerHTML = `<button class="network-back" type="button" data-back>${t('查看本地区全部机构', 'All institutions in this location')}</button><div class="network-institution-detail"><img src="${partner.logo}" alt=""><h3>${escape(partnerName(partner))}</h3><p>${name(partnerRegion(partner.key))}</p></div>${linkedPeople.length ? renderLinkedPeople(linkedPeople) : `<p class="network-empty-copy">${t('尚未补充该机构与项目成员的关联资料。可在完整团队中浏览全部成员。', 'Member affiliations for this institution have not yet been linked. Explore all members in the full team.')}</p>`}`;
      } else {
        content.innerHTML = `<div class="network-institution-list">${partners.map(partner => `<button class="network-institution-row" type="button" data-partner="${partner.key}"><img src="${partner.logo}" alt="" loading="lazy"><span><strong>${escape(partnerName(partner))}</strong><small>${name(partnerRegion(partner.key))}</small></span></button>`).join('')}</div>${region && people.length ? renderLinkedPeople(people) : ''}`;
      }
      status.textContent = partner ? partnerName(partner) : panelCount.textContent;
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
        const selected = state.region === button.dataset.region && !state.partner;
        state.region = selected ? 'all' : button.dataset.region;
        state.partner = null;
        update();
        toggleMapAuthors(button.dataset.region, button);
      } else if (button?.hasAttribute('data-map-author')) {
        toggleMapAuthors(button.dataset.mapAuthor, button);
      } else if (button === closeAuthors) {
        hideMapAuthors(true);
      } else if (button?.hasAttribute('data-partner')) {
        state.partner = button.dataset.partner;
        state.region = partnerRegion(state.partner).key;
        update();
        if (!button.closest('.network-map-marks')) content.querySelector('[data-back]').focus();
      } else if (button?.hasAttribute('data-back')) {
        const key = state.partner;
        state.partner = null;
        update();
        content.querySelector(`[data-partner="${key}"]`)?.focus({ preventScroll: true });
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

  window.ODBNetwork = { render, init, getPartners, getPeople, project };
})();
