import { expect } from '@esm-bundle/chai';
import { grooveGrinds } from './data/groove-grinds.js';
import { soulGrinds } from './data/soul-grinds.js';
import { variations } from './data/variations.js';

// ---------------------------------------------------------------------------
// Minimal DOM — must exist before skate.js initialises
// ---------------------------------------------------------------------------

const host = document.createElement('div');
host.innerHTML = `
  <header></header>
  <canvas id="wheel"></canvas>
  <div id="spin">SPIN</div>
  <div id="result">
    <span id="result-text"></span>
    <button id="result-skip"></button>
  </div>
  <button id="reshuffle"></button>
  <div id="history"></div>
`;
document.body.appendChild(host);

// ---------------------------------------------------------------------------
// Dynamic import — deferred so DOM is ready first
// ---------------------------------------------------------------------------

let getTextColor, getIndex, rebuildSectors, getVariation, handleReshuffle, handleSkip, state;
const TAU = 2 * Math.PI;

before(async () => {
	const mod = await import('./skate.js');
	({ getTextColor, getIndex, rebuildSectors, getVariation, handleReshuffle, handleSkip, state } = mod);
	// Allow loadCustomSelections() to settle
	await new Promise((r) => setTimeout(r, 50));
});

// ---------------------------------------------------------------------------
// getTextColor
// ---------------------------------------------------------------------------

describe('getTextColor', () => {
	it('white returns #111', () => {
		expect(getTextColor('#ffffff')).to.equal('#111');
	});

	it('black returns #fff', () => {
		expect(getTextColor('#000000')).to.equal('#fff');
	});

	it('#888888 (luminance 0.533) returns #fff', () => {
		// 136/255 ≈ 0.533 < 0.55 → dark text not triggered
		expect(getTextColor('#888888')).to.equal('#fff');
	});

	it('#999999 (luminance 0.6) returns #111', () => {
		// 153/255 ≈ 0.6 > 0.55 → light background
		expect(getTextColor('#999999')).to.equal('#111');
	});
});

// ---------------------------------------------------------------------------
// getIndex
// ---------------------------------------------------------------------------

describe('getIndex', () => {
	it('zero angle returns 0', () => {
		expect(getIndex(0, 12)).to.equal(0);
	});

	it('quarter turn (TAU*0.25) with 12 sectors returns 9', () => {
		// Math.floor(12 - 0.25*12) % 12 = 9
		expect(getIndex(TAU * 0.25, 12)).to.equal(9);
	});

	it('full turn (TAU) wraps to 0', () => {
		// Math.floor(12 - 1*12) % 12 = 0
		expect(getIndex(TAU, 12)).to.equal(0);
	});
});

// ---------------------------------------------------------------------------
// rebuildSectors
// ---------------------------------------------------------------------------

describe('rebuildSectors — standard mode', () => {
	beforeEach(() => {
		state.excluded.clear();
		state.customMode = false;
		['groove-grinds', 'soul-grinds', 'special-name-grinds'].forEach((name) => {
			const cb = document.querySelector(`input[name="${name}"]`);
			if (cb) cb.checked = true;
		});
	});

	it('all categories → tot equals TARGET_COUNT (12)', () => {
		rebuildSectors();
		expect(state.tot).to.equal(12);
	});

	it('result length ≤ 12', () => {
		rebuildSectors();
		expect(state.sectors.length).to.be.at.most(12);
	});

	it('one category unchecked → no tricks from that pool in sectors', () => {
		document.querySelector('input[name="groove-grinds"]').checked = false;
		rebuildSectors();
		const grooveLabels = new Set(grooveGrinds.map((t) => t.label));
		expect(state.sectors.every((s) => !grooveLabels.has(s.label))).to.equal(true);
	});

	it('excluded label absent from sectors', () => {
		const label = grooveGrinds[0].label;
		state.excluded.add(label);
		rebuildSectors();
		expect(state.sectors.every((s) => s.label !== label)).to.equal(true);
	});

	it('tempExclude absent from sectors without growing excluded', () => {
		const label = grooveGrinds[0].label;
		const sizeBefore = state.excluded.size;
		rebuildSectors(label);
		expect(state.sectors.every((s) => s.label !== label)).to.equal(true);
		expect(state.excluded.size).to.equal(sizeBefore);
	});
});

describe('rebuildSectors — custom mode', () => {
	const customPool = [grooveGrinds[0], soulGrinds[0]];

	beforeEach(() => {
		state.excluded.clear();
		state.customMode = true;
		state.customTricks = customPool;
	});

	afterEach(() => {
		state.customMode = false;
		state.customTricks = [];
	});

	it('uses customTricks instead of category pools', () => {
		rebuildSectors();
		const customLabels = new Set(customPool.map((t) => t.label));
		expect(state.sectors.every((s) => customLabels.has(s.label))).to.equal(true);
	});

	it('tot equals customTricks length when below TARGET_COUNT', () => {
		rebuildSectors();
		expect(state.tot).to.equal(customPool.length);
	});
});

// ---------------------------------------------------------------------------
// getVariation
// ---------------------------------------------------------------------------

describe('getVariation', () => {
	afterEach(() => {
		state.customMode = false;
		state.customVariationsEnabled = false;
		state.customVariations = [];
		const toggle = document.querySelector('#variations-toggle');
		if (toggle) toggle.checked = false;
	});

	it('variations toggle off → returns null', () => {
		state.customMode = false;
		document.querySelector('#variations-toggle').checked = false;
		expect(getVariation()).to.equal(null);
	});

	it('variations toggle on → returns object with label from variations list', () => {
		state.customMode = false;
		document.querySelector('#variations-toggle').checked = true;
		const v = getVariation();
		expect(v).to.not.equal(null);
		const variationLabels = new Set(variations.map((x) => x.label));
		expect(variationLabels.has(v.label)).to.equal(true);
	});

	it('custom mode, customVariationsEnabled false → returns null', () => {
		state.customMode = true;
		state.customVariationsEnabled = false;
		state.customVariations = [{ label: 'Test Var', color: '#ff0000' }];
		expect(getVariation()).to.equal(null);
	});

	it('custom mode, customVariationsEnabled true → returns from customVariations', () => {
		state.customMode = true;
		state.customVariationsEnabled = true;
		state.customVariations = [{ label: 'Test Var', color: '#ff0000' }];
		const v = getVariation();
		expect(v.label).to.equal('Test Var');
	});

	it('custom mode, empty customVariations → returns null', () => {
		state.customMode = true;
		state.customVariationsEnabled = true;
		state.customVariations = [];
		expect(getVariation()).to.equal(null);
	});
});

// ---------------------------------------------------------------------------
// handleReshuffle
// ---------------------------------------------------------------------------

describe('handleReshuffle', () => {
	beforeEach(() => {
		state.customMode = false;
		['groove-grinds', 'soul-grinds', 'special-name-grinds'].forEach((name) => {
			const cb = document.querySelector(`input[name="${name}"]`);
			if (cb) cb.checked = true;
		});
	});

	it('clears excluded', () => {
		state.excluded.add(grooveGrinds[0].label);
		state.lastLanded = grooveGrinds[0].label;
		handleReshuffle();
		expect(state.excluded.size).to.equal(0);
	});

	it('resets lastLanded to null', () => {
		state.lastLanded = grooveGrinds[0].label;
		handleReshuffle();
		expect(state.lastLanded).to.equal(null);
	});

	it('rebuilds sectors (tot > 0)', () => {
		handleReshuffle();
		expect(state.tot).to.be.greaterThan(0);
	});
});

// ---------------------------------------------------------------------------
// handleSkip
// ---------------------------------------------------------------------------

describe('handleSkip', () => {
	beforeEach(() => {
		state.excluded.clear();
		state.customMode = false;
		state.lastLanded = null;
		['groove-grinds', 'soul-grinds', 'special-name-grinds'].forEach((name) => {
			const cb = document.querySelector(`input[name="${name}"]`);
			if (cb) cb.checked = true;
		});
		rebuildSectors();
	});

	it('adds lastLanded to excluded', () => {
		const label = grooveGrinds[0].label;
		state.lastLanded = label;
		handleSkip();
		expect(state.excluded.has(label)).to.equal(true);
	});

	it('does nothing when lastLanded is null', () => {
		state.lastLanded = null;
		handleSkip();
		expect(state.excluded.size).to.equal(0);
	});

	it('rebuilds sectors after skip', () => {
		state.lastLanded = grooveGrinds[0].label;
		handleSkip();
		expect(state.tot).to.be.greaterThan(0);
	});
});
