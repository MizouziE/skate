export const trickModalTemplate = `
  <!-- Per-trick selection modal -->
  <div id="trickModal" hidden>
    <div id="modalBackdrop"></div>
    <div id="modalSheet">
      <button id="modalClose" aria-label="Close">×</button>
      <div id="modalHeader">
        <span id="modalTitle"></span>
        <span id="modalPage"></span>
      </div>
      <div id="modalList"></div>
      <p id="modalError" hidden>Select at least 1 trick before saving.</p>
      <div id="modalSelectRow">
        <button id="selectAll">Select All</button>
        <button id="selectNone">None</button>
      </div>
      <div id="modalNav">
        <button id="modalPrev">← Prev</button>
        <button id="modalNext">Next →</button>
      </div>
    </div>
  </div>
`;
