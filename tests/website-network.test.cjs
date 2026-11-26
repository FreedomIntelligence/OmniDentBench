const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');

const context = { window: {} };
for (const file of ['showcase-data.js', 'network-data.js', 'network.js', 'specialty-icons.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../docs/assets', file), 'utf8'), context);
}
const data = context.window.ODB_DATA;
const { regions, profiles } = context.window.ODB_NETWORK_DATA;
const { getPartners, getPeople, render } = context.window.ODBNetwork;

test('every partner is counted once; mainland and Hong Kong remain separate', () => {
  const assignments = regions.flatMap(region => region.partners);
  assert.equal(regions.length, 7);
  assert.equal(assignments.length, data.partners.length);
  assert.equal(new Set(assignments).size, data.partners.length);
  assert.deepEqual([...assignments].sort(), Array.from(data.partners, partner => partner.key).sort());
  assert.equal(getPartners(data, 'mainland').length, 6);
  assert.equal(getPartners(data, 'hong-kong').length, 2);
  assert.equal(getPartners(data, 'nigeria').length, 5);
  assert.equal(getPartners(data, 'japan').length, 0);
  assert.equal(getPartners(data).length, 17);
  assert.equal(getPartners(data, 'missing').length, 0);
  assert.equal(getPartners(data, 'mainland').some(partner => partner.key === 'cuhk'), true);
  assert.equal(getPartners(data, 'hong-kong').some(partner => partner.key === 'cuhk'), false);
});

test('regional people require source-backed, valid affiliations', () => {
  for (const [key, profile] of Object.entries(profiles)) {
    assert.ok(data.team.some(person => person.key === key));
    const region = regions.find(item => item.key === profile.region);
    assert.ok(region);
    assert.match(profile.url, /^https:\/\//);
    assert.ok(profile.partners.every(partner => region.partners.includes(partner)));
  }
  assert.equal(getPeople(data).length, 107);
  assert.equal(Object.keys(data.affiliations).length, 45);
  assert.equal(data.affiliations[5].name,
    'Shenzhen Stomatology Hospital (Pingshan) of Southern Medical University, Shenzhen, China.');
  for (const person of data.team) {
    assert.ok(person.affiliationIds.length > 0, person.nameEn);
    assert.ok(person.affiliationIds.every(id => data.affiliations[id]?.name), person.nameEn);
  }
  for (const affiliation of Object.values(data.affiliations)) {
    const region = regions.find(item => item.key === affiliation.region);
    assert.ok(!affiliation.partners || affiliation.partners.every(partner => region?.partners.includes(partner)));
    if (affiliation.region === 'mainland' || affiliation.region === 'hong-kong') {
      assert.match(affiliation.nameZh, /\p{Script=Han}/u, affiliation.name);
    }
  }
  assert.ok(getPeople(data, { region: 'hong-kong' }).some(person => person.key === '059-junwen-wang'));
  assert.ok(getPeople(data, { region: 'mainland' }).some(person => person.key === '059-junwen-wang'));
  assert.equal(getPeople(data, { region: 'nigeria' }).length, 7);
  assert.deepEqual(Array.from(getPeople(data, { partner: 'segi' }), person => person.key), ['103-suresh-kandagal-veerabhadrappa']);
  assert.deepEqual(Array.from(getPeople(data, { partner: 'chongqing-medical-university' }), person => person.key),
    ['002-dayong-liu', '042-shuwei-huang', '016-fangjie-zhou']);
  assert.match(data.affiliations[25].name, /SEGi University.*Malaysia/);
  assert.equal(getPeople(data, { partner: 'cuhk' })[0].key, '061-benyou-wang');
  assert.equal(getPeople(data, { region: 'mainland', partner: 'hku' }).length, 0);
  assert.equal(getPeople(data, { region: 'japan', query: 'Yuta Chiba' })[0].key, '106-yuta-chiba');
  assert.equal(getPeople(data, { region: 'spain', query: 'Lluís Giner Tarrida' })[0].key, '107-lluis-giner-tarrida');
});

test('the complete roster can be searched in either language without assigning missing affiliations', () => {
  assert.equal(getPeople(data, { query: ' BENYOU ' })[0].key, '061-benyou-wang');
  assert.equal(getPeople(data, { query: '王本友' })[0].key, '061-benyou-wang');
  assert.equal(getPeople(data, { region: 'hong-kong', query: 'Benyou' }).length, 0);
  assert.equal(getPeople(data, { query: 'no-such-person' }).length, 0);
});

test('both languages render institution and author locations on the map and the full roster below', () => {
  const groups = [...new Set(data.team.map(person => person.category))].map(category => [category, category, category]);
  for (const en of [true, false]) {
    const html = render({ en, data, groups });
    const directoryStart = html.indexOf('id="institutions"');
    const hero = html.slice(0, directoryStart);
    assert.ok(directoryStart > 0);
    assert.match(hero, /id="collaboration-map"/);
    assert.match(hero, /<h1 id="hero-title">OmniDentBench<\/h1>/);
    assert.match(hero, en ? /A multilingual, multimodal benchmark/ : /多语言、多模态评测基准/);
    assert.equal((hero.match(/class="network-map-canvas"/g) || []).length, 1);
    assert.ok(html.indexOf('id="network-panel"') > directoryStart);
    assert.ok(html.indexOf('class="network-roster"') > directoryStart);
    assert.equal((hero.match(/class="network-pin"/g) || []).length, 7);
    assert.equal((hero.match(/class="network-pin network-author-pin"/g) || []).length, 4);
    const regionCodes = [...hero.matchAll(/class="network-pin-code" aria-hidden="true">([A-Z]{2})<\/span>/g)].map(([, code]) => code);
    assert.equal(regionCodes.length, 11);
    assert.equal(new Set(regionCodes).size, 11);
    assert.doesNotMatch(hero, /<strong>\d+<\/strong>/);
    assert.equal((hero.match(/class="network-map-mark"/g) || []).length, 17);
    assert.doesNotMatch(html, /data-partner=|map-author-popover/);
    assert.match(hero, en ? /title="Chongqing Medical University"/ : /title="重庆医科大学"/);
    const directory = html.slice(directoryStart);
    assert.equal((directory.match(/class="network-portrait"/g) || []).length, data.team.length);
    assert.match(html, en ? /Chinese mainland/ : /中国大陆/);
    assert.match(html, en ? /Hong Kong, China/ : /中国香港/);
    assert.match(html, /aria-haspopup="dialog"/);
    assert.match(html, /<div class="network-roster" id="network-roster" role="group"/);
    assert.match(html, /class="network-roster-skip network-roster-shortcut visually-hidden" href="#team"/);
    assert.ok(html.lastIndexOf('class="network-portrait"') < html.indexOf('class="network-roster-skip" href="#team"'));
    assert.doesNotMatch(html, /<select\b|network-map-directory|data-mode=/);
    assert.doesNotMatch(html, /institutions-title|network-panel-title|network-profile-note|network-attribution|institution-grid/);
    const portraits = [...html.matchAll(/class="network-portrait" type="button" data-person="([^"]+)"/g)];
    assert.equal(new Set(portraits.map(([, key]) => key)).size, data.team.length);
    assert.equal((hero.match(/aria-controls="network-panel network-roster"/g) || []).length, 18);
    assert.doesNotMatch(hero, /data-zoom=|network-map-controls/);
    assert.doesNotMatch(hero, /class="network-map-authors"|class="network-map-controls"[^]*data-map-author=/);
    assert.equal((directory.match(/class="network-roster-grid"/g) || []).length, 1);
    for (const region of ['japan', 'czechia', 'spain', 'united-kingdom', ...regions.map(item => item.key)]) {
      assert.ok(hero.includes(`data-region="${region}"`));
      assert.ok(hero.includes(`data-map-line="${region}"`));
    }
    assert.deepEqual(Array.from(data.team.filter(person => person.category === 'steering_chair'), person => person.key), ['059-junwen-wang', '060-zuolin-jin', '061-benyou-wang', '105-jianquan-li']);
  }
});

test('all three website samples preserve their bilingual public records and figures', () => {
  const root = path.join(__dirname, '..');
  const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  for (const language of ['en', 'zh-CN']) {
    const release = readJson(`data/${language}/items.json`);
    for (const [id, type, figures] of [
      ['ODB-0264', 'subjective', 3],
      ['ODB-1164', 'objective_exact', 2],
      ['ODB-1161', 'objective_multiple', 1]
    ]) {
      const key = id.toLowerCase();
      const item = readJson(`docs/assets/items/${key}.${language}.json`);
      assert.deepEqual(item, release.items.find(record => record.id === id));
      assert.equal(item.question_type, type);
      assert.equal(item.attachments.length, figures);
      item.attachments.forEach(({ sha256 }, index) => {
        const file = path.join(root, `docs/images/atlas/${key}-fig-${index + 1}.jpg`);
        assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), sha256);
      });
    }
  }
});

test('all 12 specialties have distinct accessible decorative icons', () => {
  const icons = data.specialties.map(specialty => context.window.ODBSpecialtyIcon(specialty.nameEn));
  assert.equal(new Set(icons).size, 12);
  icons.forEach(icon => assert.match(icon, /aria-hidden="true"/));
});
