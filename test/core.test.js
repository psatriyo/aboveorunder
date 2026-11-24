// Runs the DOM-free core script from index.html in Node: `node --test`.
// Fix the time zone before anything reads the clock, so the DST cases are deterministic.
process.env.TZ = 'America/New_York';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const match = html.match(/<script id="core">([\s\S]*?)<\/script>/);
assert.ok(match, 'index.html must contain <script id="core">');
const core = vm.runInNewContext(
    match[1] + '\n;({ I18N, WEEK_MS, DAY_MS, HOUR_MS, rollToCurrentCycle, weeklyOccurrence, computePace, migrateV1 })'
);
const { I18N, WEEK_MS, DAY_MS, HOUR_MS, rollToCurrentCycle, weeklyOccurrence, computePace, migrateV1 } = core;

const NOW = new Date('2026-11-24T12:00:00-05:00').getTime(); // a Tuesday

test('rollToCurrentCycle maps past and future anchors onto the current week', () => {
    const start = NOW - 2 * DAY_MS;
    assert.equal(rollToCurrentCycle(start, NOW), start);
    assert.equal(rollToCurrentCycle(start - 3 * WEEK_MS, NOW), start);
    assert.equal(rollToCurrentCycle(start + 2 * WEEK_MS, NOW), start);
});

test('a reset exactly now starts a new cycle', () => {
    const r = computePace({ start: NOW - WEEK_MS, used: 0, now: NOW });
    assert.equal(r.cycleStart, NOW);
    assert.equal(r.elapsedMs, 0);
    assert.equal(r.remainingMs, WEEK_MS);
});

test('weeklyOccurrence returns the latest matching weekday and time at or before now', () => {
    for (let weekday = 0; weekday < 7; weekday++) {
        const t = weeklyOccurrence(weekday, 21 * 60 + 15, NOW);
        const d = new Date(t);
        assert.equal(d.getDay(), weekday);
        assert.equal(d.getHours(), 21);
        assert.equal(d.getMinutes(), 15);
        assert.ok(t <= NOW && NOW - t < WEEK_MS);
    }
    // Today, earlier than now -> today; later than now -> a week ago.
    assert.equal(new Date(weeklyOccurrence(2, 9 * 60, NOW)).getDate(), 24);
    assert.equal(new Date(weeklyOccurrence(2, 15 * 60, NOW)).getDate(), 17);
});

test('weeklyOccurrence keeps local wall time across a DST change', () => {
    // US clocks fell back on Sunday 1 Nov 2026.
    const now = new Date('2026-11-03T12:00:00-05:00').getTime();
    const d = new Date(weeklyOccurrence(6, 21 * 60, now)); // Saturday 31 Oct, still EDT
    assert.equal(d.getDate(), 31);
    assert.equal(d.getHours(), 21);
});

test('rolling across DST keeps exact 7-day steps (provider resets are fixed in UTC)', () => {
    const start = new Date('2026-10-25T21:00:00-04:00').getTime();
    const now = new Date('2026-11-03T12:00:00-05:00').getTime();
    assert.equal(rollToCurrentCycle(start, now) - start, WEEK_MS);
    assert.equal(new Date(rollToCurrentCycle(start, now)).getHours(), 20);
});

test('status: on pace within 1%, under, over, and over at the limit', () => {
    const start = NOW - 3.5 * DAY_MS; // 50% of the week elapsed
    assert.equal(computePace({ start: NOW, used: 0, now: NOW }).status, 'even');
    assert.equal(computePace({ start, used: 50, now: NOW }).status, 'even');
    assert.equal(computePace({ start, used: 50.9, now: NOW }).status, 'even');
    assert.equal(computePace({ start, used: 40, now: NOW }).status, 'under');
    assert.equal(computePace({ start, used: 60, now: NOW }).status, 'over');
    assert.equal(computePace({ start: NOW - 6.995 * DAY_MS, used: 100, now: NOW }).status, 'over');
});

test('difference, daily budget, projection and time to limit', () => {
    const start = NOW - 3.5 * DAY_MS;
    const r = computePace({ start, used: 60, now: NOW });
    assert.equal(r.timeElapsed, 50);
    assert.equal(r.difference, 10);
    assert.equal(r.differenceMs, 0.1 * WEEK_MS);
    assert.ok(Math.abs(r.dailyBudget - 40 / 3.5) < 1e-9);
    assert.equal(r.projected, 120);
    assert.ok(Math.abs(r.msToLimit - (40 / 60) * 3.5 * DAY_MS) < 1);

    const under = computePace({ start, used: 30, now: NOW });
    assert.equal(under.projected, 60);
    assert.equal(under.msToLimit, null);
});

test('edge cases: too early to project, limit reached, last day', () => {
    assert.equal(computePace({ start: NOW - HOUR_MS, used: 5, now: NOW }).projected, null);

    const full = computePace({ start: NOW - 3.5 * DAY_MS, used: 100, now: NOW });
    assert.equal(full.dailyBudget, 0);
    assert.equal(full.msToLimit, null);

    // Under a day left: the whole remainder is today's budget.
    const lastDay = computePace({ start: NOW - 6.5 * DAY_MS, used: 70, now: NOW });
    assert.equal(lastDay.dailyBudget, 30);
});

test('migrateV1 converts end dates and remaining usage', () => {
    const local = '2026-11-20T21:00';
    const parsed = new Date(local).getTime();
    assert.deepEqual(
        { ...migrateV1({ resetTime: local, dateMode: 'end', mode: 'remaining', usage: '70.4' }) },
        { start: parsed - WEEK_MS, dateMode: 'day', usageMode: 'remaining', used: 30 }
    );
    assert.deepEqual(
        { ...migrateV1({ resetTime: local, dateMode: 'start', mode: 'current', usage: '12' }) },
        { start: parsed, dateMode: 'day', usageMode: 'current', used: 12 }
    );
    assert.deepEqual(
        { ...migrateV1({ resetTime: '', usage: '' }) },
        { start: null, dateMode: 'day', usageMode: 'current', used: null }
    );
});

test('every language has the same translation keys and placeholders', () => {
    const placeholders = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
    const en = I18N.en;
    for (const [lang, strings] of Object.entries(I18N)) {
        assert.deepEqual(Object.keys(strings).sort(), Object.keys(en).sort(), `keys differ in "${lang}"`);
        for (const key of Object.keys(en)) {
            assert.equal(placeholders(strings[key]), placeholders(en[key]), `placeholders differ in ${lang}.${key}`);
        }
    }
});

test('every translation key used in the markup exists', () => {
    const used = new Set();
    for (const m of html.matchAll(/data-i18n(?:-html)?="(\w+)"/g)) used.add(m[1]);
    for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
        m[1].split(';').forEach(pair => used.add(pair.split(':')[1]));
    }
    for (const key of used) assert.ok(key in I18N.en, `missing key "${key}"`);
});
