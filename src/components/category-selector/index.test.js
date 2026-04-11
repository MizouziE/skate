import { expect } from '@esm-bundle/chai';
import { initCategorySelector } from './index.js';
import { categorySelectorTemplate } from './template.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState({ tot = 1 } = {}) {
  return {
    tot,
    lastLanded: 'some-trick',
    excluded: new Set(['existing-exclusion']),
    rebuildSectors: () => { makeState._calls.rebuildSectors++; },
    drawWheel: () => { makeState._calls.drawWheel++; },
    rotate: () => { makeState._calls.rotate++; },
  };
}
makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };

function mountTemplate() {
  const host = document.createElement('div');
  host.innerHTML = categorySelectorTemplate;
  document.body.appendChild(host);
  return host;
}

function unmount(host) {
  document.body.removeChild(host);
}

function triggerChange(name) {
  const input = document.querySelector(`#listSelector input[name="${name}"]`);
  input.dispatchEvent(new Event('change'));
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

describe('categorySelectorTemplate', () => {
  it('contains a checkbox for groove-grinds', () => {
    const host = mountTemplate();
    expect(host.querySelector('input[name="groove-grinds"]')).to.exist;
    unmount(host);
  });

  it('contains a checkbox for soul-grinds', () => {
    const host = mountTemplate();
    expect(host.querySelector('input[name="soul-grinds"]')).to.exist;
    unmount(host);
  });

  it('contains a checkbox for special-name-grinds', () => {
    const host = mountTemplate();
    expect(host.querySelector('input[name="special-name-grinds"]')).to.exist;
    unmount(host);
  });

  it('contains a checkbox for variations-toggle', () => {
    const host = mountTemplate();
    expect(host.querySelector('input[name="variations-toggle"]')).to.exist;
    unmount(host);
  });

  it('contains the customize button', () => {
    const host = mountTemplate();
    expect(host.querySelector('#customizeBtn')).to.exist;
    unmount(host);
  });
});

// ---------------------------------------------------------------------------
// State side-effects on category change
// ---------------------------------------------------------------------------

describe('initCategorySelector — category checkbox change', () => {
  let host, state;

  const listMap = {
    'groove-grinds': [],
    'soul-grinds': [],
    'special-name-grinds': [],
    // 'variations-toggle' intentionally absent
  };

  beforeEach(() => {
    makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };
    host = mountTemplate();
    state = makeState({ tot: 1 });
    initCategorySelector(state, listMap);
  });

  afterEach(() => unmount(host));

  it('clears excluded on category change', () => {
    triggerChange('groove-grinds');
    expect(state.excluded.size).to.equal(0);
  });

  it('resets lastLanded to null on category change', () => {
    triggerChange('groove-grinds');
    expect(state.lastLanded).to.equal(null);
  });

  it('calls rebuildSectors on category change', () => {
    triggerChange('groove-grinds');
    expect(makeState._calls.rebuildSectors).to.equal(1);
  });

  it('calls drawWheel when state.tot is truthy', () => {
    triggerChange('groove-grinds');
    expect(makeState._calls.drawWheel).to.equal(1);
  });

  it('does NOT call drawWheel when state.tot is falsy', () => {
    unmount(host);
    host = mountTemplate();
    state = makeState({ tot: 0 });
    initCategorySelector(state, listMap);
    triggerChange('groove-grinds');
    expect(makeState._calls.drawWheel).to.equal(0);
  });

  it('calls rotate on category change', () => {
    triggerChange('groove-grinds');
    expect(makeState._calls.rotate).to.equal(1);
  });
});

// ---------------------------------------------------------------------------
// variations-toggle skip (guard branch)
// ---------------------------------------------------------------------------

describe('initCategorySelector — variations-toggle skip', () => {
  let host, state;

  const listMap = {
    'groove-grinds': [],
    'soul-grinds': [],
    'special-name-grinds': [],
  };

  beforeEach(() => {
    makeState._calls = { rebuildSectors: 0, drawWheel: 0, rotate: 0 };
    host = mountTemplate();
    state = makeState({ tot: 1 });
    initCategorySelector(state, listMap);
  });

  afterEach(() => unmount(host));

  it('does NOT call rebuildSectors when variations-toggle changes', () => {
    triggerChange('variations-toggle');
    expect(makeState._calls.rebuildSectors).to.equal(0);
  });

  it('does NOT call rotate when variations-toggle changes', () => {
    triggerChange('variations-toggle');
    expect(makeState._calls.rotate).to.equal(0);
  });

  it('does NOT clear excluded when variations-toggle changes', () => {
    triggerChange('variations-toggle');
    expect(state.excluded.size).to.equal(1);
  });
});
