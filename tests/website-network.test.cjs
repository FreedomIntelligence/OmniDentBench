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
  assert.equal(getPartners(data, 'mainland').length, 5);
  assert.equal(getPartners(data, 'hong-kong').length, 2);
  assert.equal(getPartners(data, 'nigeria').length, 5);
  assert.equal(getPartners(data).length, 16);
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
  assert.equal(getPeople(data).length, 105);
  assert.equal(getPeople(data, { region: 'hong-kong' }).length, 4);
  assert.equal(getPeople(data, { region: 'mainland' }).length, 2);
  assert.equal(getPeople(data, { region: 'nigeria' }).length, 0);
  assert.equal(getPeople(data, { partner: 'hku' }).length, 4);
  assert.equal(getPeople(data, { partner: 'frd' }).length, 0);
  assert.equal(getPeople(data, { partner: 'cuhk' })[0].key, '061-benyou-wang');
  assert.equal(getPeople(data, { region: 'mainland', partner: 'hku' }).length, 0);
});

test('the complete roster can be searched in either language without assigning missing affiliations', () => {
  assert.equal(getPeople(data, { query: ' BENYOU ' })[0].key, '061-benyou-wang');
  assert.equal(getPeople(data, { query: '王本友' })[0].key, '061-benyou-wang');
  assert.equal(getPeople(data, { region: 'hong-kong', query: 'Benyou' }).length, 0);
  assert.equal(getPeople(data, { query: 'no-such-person' }).length, 0);
});

test('both languages render all seven interactive locations and all author portraits', () => {
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
    assert.equal((html.match(/class="network-pin"/g) || []).length, 7);
    assert.equal((html.match(/data-partner="/g) || []).length, 16);
    assert.equal((html.match(/class="network-portrait"/g) || []).length, data.team.length);
    assert.match(html, en ? /Chinese mainland/ : /中国大陆/);
    assert.match(html, en ? /Hong Kong, China/ : /中国香港/);
    assert.match(html, /aria-haspopup="dialog"/);
    assert.match(html, /<details class="network-roster" open>/);
    assert.match(html, /class="network-roster-skip" href="#team".*\s+<div class="network-roster-grid">/);
    assert.doesNotMatch(html, /<select\b/);
    const portraits = [...html.matchAll(/class="network-portrait" type="button" data-person="([^"]+)"/g)];
    assert.deepEqual(portraits.slice(0, 3).map(([, key]) => key), ['059-junwen-wang', '060-zuolin-jin', '061-benyou-wang']);
  }
});

test('the website sample exposes the unchanged public ODB-0264 records and figures', () => {
  const root = path.join(__dirname, '..');
  const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  for (const language of ['en', 'zh-CN']) {
    const item = readJson(`docs/assets/items/odb-0264.${language}.json`);
    const release = readJson(`data/${language}/items.json`);
    assert.deepEqual(item, release.items.find(record => record.id === 'ODB-0264'));
    assert.equal(item.question_type, 'subjective');
    assert.equal(item.attachments.length, 3);
    item.attachments.forEach(({ sha256 }, index) => {
      const file = path.join(root, `docs/images/atlas/odb-0264-fig-${index + 1}.jpg`);
      assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), sha256);
    });
  }
});

test('all 12 specialties have distinct accessible decorative icons', () => {
  const icons = data.specialties.map(specialty => context.window.ODBSpecialtyIcon(specialty.nameEn));
  assert.equal(new Set(icons).size, 12);
  icons.forEach(icon => assert.match(icon, /aria-hidden="true"/));
});
