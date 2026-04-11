export const categorySelectorTemplate = `
  <!-- Category selector -->
  <details id="listSelector">
    <summary>Choose your list</summary>
    <ul>
      <li>
        <label for="groove-grinds">
          <input type="checkbox" name="groove-grinds" id="groove-grinds" checked>
          Groove Grinds
        </label>
      </li>
      <li>
        <label for="soul-grinds">
          <input type="checkbox" name="soul-grinds" id="soul-grinds" checked>
          Soul Grinds
        </label>
      </li>
      <li>
        <label for="special-name-grinds">
          <input type="checkbox" name="special-name-grinds" id="special-name-grinds" checked>
          Special Name Grinds
        </label>
      </li>
      <li>
        <label for="variations-toggle">
          <input type="checkbox" name="variations-toggle" id="variations-toggle">
          Add Variation
        </label>
      </li>
    </ul>
  </details>
  <button id="customizeBtn">Customize tricks</button>
  <div id="customModeBar" hidden>
    Custom selection active
    <button id="clearCustom">Clear</button>
  </div>
`;
