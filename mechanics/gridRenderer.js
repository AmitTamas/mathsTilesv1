export function renderGrid(level, mountNode) {
  mountNode.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display  = "inline-block";
  wrapper.style.overflow = "visible";

  const board = document.createElement("div");
  board.className = "gridBoard";

  // ── find used bounds ─────────────────────────────────────
  let minR = Infinity, maxR = -Infinity;
  let minC = Infinity, maxC = -Infinity;

  for (const key of Object.keys(level.cells)) {
    const [r, c] = key.split(",").map(Number);
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }

  if (minR === Infinity) { minR = 1; maxR = 1; minC = 1; maxC = 1; }

  const usedRows = maxR - minR + 1;
  const usedCols = maxC - minC + 1;
  const maxDim    = Math.max(usedRows, usedCols);
  const CELL      = maxDim <= 7  ? 68
                  : maxDim <= 9  ? 58
                  : maxDim <= 11 ? 50
                  : 44;
  const GAP       = maxDim <= 9 ? 5 : 4;

  // apply cell size as CSS variable so group boxes stay in sync
  board.style.setProperty("--cell", CELL + "px");
  board.style.setProperty("--gap",  GAP  + "px");
  board.style.gridTemplateColumns = `repeat(${usedCols}, ${CELL}px)`;
  board.style.gridTemplateRows    = `repeat(${usedRows}, ${CELL}px)`;

  const slots    = [];
  const cellEls  = {}; // key → dom element

  // ── render cells ─────────────────────────────────────────
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const key  = `${r},${c}`;
      const data = level.cells[key];
      const cell = document.createElement("div");
      cell.className    = "gridCell empty";
      cell.style.width     = CELL + "px";
      cell.style.height    = CELL + "px";
      cell.style.fontSize  = Math.round(CELL * 0.36) + "px";
      cell.style.borderRadius = Math.round(CELL * 0.22) + "px";
      cell.dataset.gRow = r;
      cell.dataset.gCol = c;

      if (data) {
        if (data.type === "slot") {
          if (data.placeholder !== undefined) {
            cell.className           = "gridCell slot slot--placeholder";
            cell.dataset.key         = data.key;
            cell.dataset.filled      = "placeholder";
            cell.dataset.placeholder = "true";
            cell.textContent         = data.placeholder;
            cell.dataset.value       = data.placeholder;
          } else {
            cell.className   = "gridCell slot";
            cell.dataset.key = data.key;

            // small key label in top-left corner
            const label = document.createElement("span");
            label.className   = "slotLabel";
            label.textContent = data.key;
            cell.appendChild(label);
          }
          slots.push(cell);
        }
        if (data.type === "op") {
          cell.className   = "gridCell op";
          cell.textContent = data.value;
        }
        if (data.type === "answer") {
          cell.className   = "gridCell answer";
          cell.textContent = data.value;
        }
      }

      board.appendChild(cell);
      cellEls[key] = cell;
    }
  }
  
  wrapper.appendChild(board);
  // ── build groups ─────────────────────────────────────────
  const groups = [];
  if (level.groups) {
    level.groups.forEach(g => {
      const cells = g.cells.map(k => {
        const [r, c] = k.split(",").map(Number);
        return { r, c };
      });
      groups.push(boundsFromCells(cells, minR, minC, CELL, GAP));
    });
  }

  // ── draw group boxes ──────────────────────────────────────
  const PAD = 4;
  groups.forEach((g, idx) => {
    const palette = [
      { bg: "rgba(255,180,60,0.12)",  border: "rgba(255,150,30,0.6)"  },
      { bg: "rgba(100,180,255,0.12)", border: "rgba(60,140,240,0.6)"  },
      { bg: "rgba(120,210,140,0.12)", border: "rgba(60,180,100,0.6)"  },
      { bg: "rgba(200,130,255,0.12)", border: "rgba(160,80,240,0.6)"  },
      { bg: "rgba(255,100,130,0.12)", border: "rgba(220,60,100,0.6)"  },
    ];
    const col = g.color
      ? { bg: "transparent", border: g.color.border }
      : { bg: "transparent", border: palette[idx % palette.length].border };

    const pad    = g.pad !== undefined ? g.pad : PAD;
    const offset = idx * 5; // each group shifts outward slightly
    const box = document.createElement("div");
    box.style.cssText = `
      position: absolute;
      pointer-events: none;
      border-radius: ${12 + offset}px;
      border: 2.5px solid ${col.border};
      background: transparent;
      z-index: ${2 + idx};
      left:   ${g.x - pad - offset}px;
      top:    ${g.y - pad - offset}px;
      width:  ${g.w + (pad + offset) * 2}px;
      height: ${g.h + (pad + offset) * 2}px;
    `;
    wrapper.appendChild(box);
  });

  mountNode.appendChild(wrapper);
  return slots;
}

// ── group detection ───────────────────────────────────────
// function collectGroups(level, minR, minC, CELL, GAP) {
//   const groups = [];
//   const STEP   = CELL + GAP;

//   // manual overrides from level data
//   if (level.groups) {
//     level.groups.forEach(g => {
//       const cells = g.cells.map(k => {
//         const [r, c] = k.split(",").map(Number);
//         return { r, c };
//       });
//       groups.push(boundsFromCells(cells, minR, minC, CELL, GAP));
//     });
//   }

//   // auto-detect: scan rows for × ÷ runs
//   const allKeys = Object.keys(level.cells);
//   const byRow   = {};
//   const byCol   = {};

//   allKeys.forEach(key => {
//     const [r, c] = key.split(",").map(Number);
//     if (!byRow[r]) byRow[r] = [];
//     if (!byCol[c]) byCol[c] = [];
//     byRow[r].push({ r, c, data: level.cells[key] });
//     byCol[c].push({ r, c, data: level.cells[key] });
//   });

//   // horizontal runs
//   Object.values(byRow).forEach(row => {
//     const sorted = row.sort((a, b) => a.c - b.c);
//     detectMulDivRuns(sorted, "c").forEach(run => {
//       // check not already covered by a manual group
//       if (!alreadyCovered(run, groups, minR, minC, CELL, GAP)) {
//         groups.push(boundsFromCells(run, minR, minC, CELL, GAP));
//       }
//     });
//   });

//   // vertical runs
//   Object.values(byCol).forEach(col => {
//     const sorted = col.sort((a, b) => a.r - b.r);
//     detectMulDivRuns(sorted, "r").forEach(run => {
//       if (!alreadyCovered(run, groups, minR, minC, CELL, GAP)) {
//         groups.push(boundsFromCells(run, minR, minC, CELL, GAP));
//       }
//     });
//   });

//   return groups;
// }

function detectMulDivRuns(sorted, axis) {
  const runs = [];
  let i = 0;

  while (i < sorted.length) {
    const cur = sorted[i];
    // look for slot → (× or ÷) → slot pattern
    if (
      cur.data.type === "slot" &&
      sorted[i + 1]?.data?.value === "×" || sorted[i + 1]?.data?.value === "÷"
    ) {
      const run = [cur];
      while (
        i + 1 < sorted.length &&
        (sorted[i + 1].data.value === "×" || sorted[i + 1].data.value === "÷") &&
        sorted[i + 2]?.data?.type === "slot"
      ) {
        run.push(sorted[i + 1]); // operator
        run.push(sorted[i + 2]); // next slot
        i += 2;
      }
      if (run.length >= 3) runs.push(run);
    }
    i++;
  }

  return runs;
}

function boundsFromCells(cells, minR, minC, CELL, GAP) {
  const STEP = CELL + GAP;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;

  cells.forEach(({ r, c }) => {
    const x = (c - minC) * STEP;
    const y = (r - minR) * STEP;
    if (x < x1) x1 = x;
    if (y < y1) y1 = y;
    if (x + CELL > x2) x2 = x + CELL;
    if (y + CELL > y2) y2 = y + CELL;
  });

  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function alreadyCovered(run, groups, minR, minC, CELL, GAP) {
  const b = boundsFromCells(run, minR, minC, CELL, GAP);
  return groups.some(g =>
    g.x === b.x && g.y === b.y && g.w === b.w && g.h === b.h
  );
}