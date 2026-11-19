/* Positions use a 1200 × 560 Natural Earth land map. Each pin represents
   one partner site. Logos are grouped by country to keep nearby sites legible. */
const atlasCountries = [
  { id: 'us', en: 'United States', zh: '美国', site: [-92.47, 44.02], panel: [115, 158, 125, 1], partners: ['mayo'] },
  { id: 'de', en: 'Germany', zh: '德国', site: [11.58, 48.14], panel: [442, 38, 149, 1], partners: ['lmu'] },
  { id: 'ng', en: 'Nigeria', zh: '尼日利亚', site: [7.49, 9.06], panel: [300, 315, 239, 3], partners: ['nha', 'cmul', 'buk', 'udus', 'maiduguri'] },
  { id: 'et', en: 'Ethiopia', zh: '埃塞俄比亚', site: [40, 7.12], panel: [611, 394, 151, 1], partners: ['mwu'] },
  { id: 'cn', en: 'China', zh: '中国', site: [116.4, 39.9], panel: [829, 12, 337, 4], partners: ['cuhk', 'hku', 'frd', 'peking-university', 'ptcls', 'pku-biomedical-imaging', 'prince-philip-dental-hospital'] },
  { id: 'my', en: 'Malaysia', zh: '马来西亚', site: [101.58, 3.15], panel: [953, 351, 148, 1], partners: ['segi'] },
];

function atlasPoint([longitude, latitude]) {
  return [600 + 3.2 * longitude * Math.cos(latitude * .48 * Math.PI / 180), 305 - 3.56 * latitude];
}

function renderInstitutionMap(partners, t, atlasImage) {
  const byKey = new Map(partners.map(partner => [partner.key, partner]));
  const pins = atlasCountries.map(country => {
    const [x, y] = atlasPoint(country.site);
    const [left, top, width] = country.panel;
    return `<path d="M ${x} ${y} L ${left + width / 2} ${top + 34}"/>
      <circle cx="${x}" cy="${y}" r="5"/>`;
  }).join('');
  const [chairX, chairY] = atlasPoint([114.1, 22.4]);
  const panels = atlasCountries.map(country => {
    const [left, top, width, columns] = country.panel;
    const countryName = t(country.zh, country.en);
    const buttons = country.partners.map(key => {
      const partner = byKey.get(key);
      const name = t(partner.nameZh, partner.nameEn);
      return `<button type="button" class="atlas-mark" data-partner="${key}" aria-label="${name}" aria-pressed="false" title="${name}">
        <img src="${partner.logo}" alt="" draggable="false">
      </button>`;
    }).join('');
    return `<section class="atlas-cluster" data-country="${country.id}" aria-label="${countryName}" style="left:${left / 12}%;top:${top / 5.6}%;width:${width / 12}%;--columns:${columns}">
      <h3>${countryName}<span>${country.partners.length}</span></h3>
      <div class="atlas-marks">${buttons}</div></section>`;
  }).join('');
  const options = atlasCountries.map(c => `<option value="${c.id}">${t(c.zh, c.en)}</option>`).join('');
  return `<section class="atlas-geography" aria-label="${t('合作机构互动地图', 'Interactive partner map')}">
    <div class="atlas-controls">
      <label>${t('定位国家', 'Locate country')} <select class="atlas-country"><option value="">${t('选择国家', 'Select a country')}</option>${options}</select></label>
      <div class="atlas-zoom">
        <button type="button" data-zoom="out" aria-label="${t('缩小', 'Zoom out')}">−</button>
        <output class="atlas-scale" aria-label="${t('缩放比例', 'Zoom level')}"></output>
        <button type="button" data-zoom="in" aria-label="${t('放大', 'Zoom in')}">+</button>
        <button type="button" data-zoom="fit">${t('全图', 'Fit map')}</button>
      </div>
    </div>
    <div class="atlas-viewport" tabindex="0" role="region" aria-label="${t('可滚动的世界地图', 'Scrollable world map')}">
      <div class="atlas-stage">
        <svg class="atlas-leaders" viewBox="0 0 1200 560" aria-hidden="true">${pins}
          <g transform="translate(${chairX} ${chairY})"><path class="atlas-chair-star" d="M0 -8 2.4 -2.5 8.2 -2.5 3.7 1.3 5.2 7.2 0 4 -5.2 7.2 -3.7 1.3 -8.2 -2.5 -2.4 -2.5 Z"/></g>
        </svg>${panels}
      </div>
    </div>
    <div class="atlas-readout"><p class="atlas-result" role="status">${t('选择国家可放大地图，点选 Logo 可查看机构全称。','Choose a country to zoom in, or select a logo to see the institution’s full name.')}</p>
      <a href="${atlasImage}">${t('高清图', 'Full-size figure')}</a></div>
    <p class="atlas-key"><span>●</span> ${t('圆点标示各国的一处合作地点，方框内展示该国全部合作机构。','Each dot marks one partner site. The logos show all partner institutions in that country.')} <b>★</b> ${t('项目主席：王俊文（香港），金作林、王本友（深圳）。','Steering chairs: Junwen Wang in Hong Kong, Zuolin Jin and Benyou Wang in Shenzhen.')}</p>
  </section>`;
}

function bindInstitutionMap(root, partners, t) {
  const viewport = root.querySelector('.atlas-viewport');
  const stage = root.querySelector('.atlas-stage');
  const select = root.querySelector('.atlas-country');
  const result = root.querySelector('.atlas-result');
  const initialMessage = result.textContent;
  let zoom = 1;

  function setZoom(next, center) {
    const x = center ? center[0] : (viewport.scrollLeft + viewport.clientWidth / 2) / stage.offsetWidth;
    const y = center ? center[1] : (viewport.scrollTop + viewport.clientHeight / 2) / stage.offsetHeight;
    zoom = Math.max(1, Math.min(5, next));
    root.dataset.zoomed = String(zoom > 1);
    stage.style.width = zoom * 100 + '%';
    root.querySelector('.atlas-scale').textContent = Math.round(zoom * 100) + '%';
    root.querySelector('[data-zoom="out"]').disabled = zoom <= 1;
    root.querySelector('[data-zoom="in"]').disabled = zoom >= 5;
    viewport.scrollTo(x * stage.offsetWidth - viewport.clientWidth / 2, y * stage.offsetHeight - viewport.clientHeight / 2);
  }

  function clearSelection() {
    const active = root.querySelector('.atlas-mark[aria-pressed="true"]');
    if (active) active.setAttribute('aria-pressed', 'false');
    result.textContent = initialMessage;
  }

  root.addEventListener('click', event => {
    const mark = event.target.closest('.atlas-mark');
    if (mark) {
      const partner = partners.find(p => p.key === mark.dataset.partner);
      const country = atlasCountries.find(c => c.id === mark.closest('.atlas-cluster').dataset.country);
      clearSelection();
      mark.setAttribute('aria-pressed', 'true');
      select.value = country.id;
      result.textContent = t(partner.nameZh, partner.nameEn) + ' · ' + t(country.zh, country.en);
      return;
    }
    const control = event.target.closest('[data-zoom]');
    if (!control) return;
    if (control.dataset.zoom === 'fit') {
      clearSelection();
      select.value = '';
      setZoom(1, [.5, .5]);
    } else {
      setZoom(zoom * (control.dataset.zoom === 'in' ? 1.5 : 1 / 1.5));
    }
  });

  select.addEventListener('change', () => {
    clearSelection();
    const country = atlasCountries.find(c => c.id === select.value);
    if (!country) { setZoom(1, [.5, .5]); return; }
    const panel = root.querySelector('[data-country="' + country.id + '"]');
    const center = [(panel.offsetLeft + panel.offsetWidth / 2) / stage.offsetWidth, (panel.offsetTop + panel.offsetHeight / 2) / stage.offsetHeight];
    setZoom(Math.max(1.5, Math.min(5, 1050 / viewport.clientWidth)), center);
    result.textContent = t(country.zh + ' · ' + country.partners.length + ' 家合作机构', country.en + ' · ' + country.partners.length + (country.partners.length === 1 ? ' partner institution' : ' partner institutions'));
  });

  // Touch and trackpad users can pan the native scrolling viewport.
  let drag = null;
  viewport.addEventListener('pointerdown', event => {
    if (zoom <= 1 || event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
    drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.setPointerCapture(event.pointerId);
    root.classList.add('is-panning');
  });
  viewport.addEventListener('pointermove', event => {
    if (drag) viewport.scrollTo(drag.left + drag.x - event.clientX, drag.top + drag.y - event.clientY);
  });
  viewport.addEventListener('lostpointercapture', () => {
    drag = null;
    root.classList.remove('is-panning');
  });
  setZoom(1, [.5, .5]);
}
