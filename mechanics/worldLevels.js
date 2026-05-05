import { fadeInBG, fadeOutBG, initBGMusic, playBGMusic } from "./audio.js";
import { completeLevel }  from "./progression.js";
import { LEVELS }         from "./gridLevelData.js";
import { renderGrid }     from "./gridRenderer.js";
import { playSound }      from "./audio.js";
import { launchConfetti, burstStars } from "./effects.js";

// ── one-time audio boot (never re-runs on level change) ──────────────────────
initBGMusic();
playBGMusic();
fadeInBG();

// ── static DOM refs (never change between levels) ────────────────────────────
const progressFill  = document.getElementById("progressFill");
const progressCar   = document.getElementById("progressCar");
const boardArea     = document.getElementById("boardArea");
const levelTitle    = document.getElementById("levelTitle");
const trayArea      = document.getElementById("trayArea");
const checkBtn      = document.getElementById("checkBtn");
const resetBtn      = document.getElementById("resetBtn");
const nextBtn       = document.getElementById("nextBtn");
const heartEls      = [
  document.getElementById("heart1"),
  document.getElementById("heart2"),
  document.getElementById("heart3"),
];
const feedback      = document.getElementById("feedback");
const timerEl       = document.getElementById("timer");
const pauseBtn      = document.getElementById("pauseBtn");
const hintBtn       = document.getElementById("hintBtn");
const backBtn       = document.getElementById("backBtn");
const pauseOverlay  = document.getElementById("pauseOverlay");
const hintOverlay   = document.getElementById("hintOverlay");
const successOverlay= document.getElementById("successOverlay");
const resumeBtn     = document.getElementById("resumeBtn");
const restartBtn    = document.getElementById("restartBtn");
const mapBtn        = document.getElementById("mapBtn");
const hintCloseBtn  = document.getElementById("hintCloseBtn");
const hintText      = document.getElementById("hintText");
const successNextBtn    = document.getElementById("successNextBtn");
const successRestartBtn = document.getElementById("successRestartBtn");
const successMapBtn     = document.getElementById("successMapBtn");
const starRow       = document.getElementById("starRow");
const successTime   = document.getElementById("successTime");
const previewStrip  = document.getElementById("previewStrip");

/* ============================================================
   TIMER  (module-level so loadLevel can reset it cleanly)
============================================================ */
let seconds   = 0;
let timerLoop = null;
let paused    = false;

function startTimer() {
  stopTimer();
  seconds = 0;
  timerEl.textContent = "0:00";
  timerLoop = setInterval(() => {
    if (!paused) {
      seconds++;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerLoop);
  timerLoop = null;
}

/* ============================================================
   HELPERS
============================================================ */
function calcStars(secs, levelId) {
  const starTimes = {
    1:[25,45], 2:[30,55], 3:[35,60], 4:[40,70], 5:[45,80],
    6:[55,95], 7:[60,110],8:[70,125],9:[80,145],10:[95,170],
  };
  const [three, two] = starTimes[levelId] || [45, 80];
  if (secs <= three) return 3;
  if (secs <= two)   return 2;
  return 1;
}

function calcScore(stars) {
  return 500 + Math.max(0, 300 - seconds * 5) + stars * 100;
}

function updateWorldProgress(levelId) {
  const total   = LEVELS.length;
  const percent = ((levelId - 1) / (total - 1)) * 100;
  if (progressFill) progressFill.style.width  = percent + "%";
  if (progressCar)  progressCar.style.left    = percent + "%";
}

function showFeedback(msg, type) {
  if (!feedback) return;
  feedback.textContent = msg;
  feedback.className   = "feedback" + (type ? " " + type : "");
}

function evalTokens(tokens, vals) {
  let expr = "";
  for (const t of tokens) {
    if (t.type === "op") {
      if (t.value === "=") break;
      expr += t.value === "×" ? "*" : t.value === "÷" ? "/" : t.value;
    } else if (t.type === "slot") {
      if (vals[t.key] === undefined) return null;
      expr += vals[t.key];
    } else if (t.type === "answer") {
      expr += t.value;
    }
  }
  try {
    return Math.round(Function("return " + expr)() * 1e9) / 1e9;
  } catch { return null; }
}

/* ============================================================
   TRANSITION ANIMATION
   Slides the board out left, swaps data, slides new board in
============================================================ */
function transitionToLevel(newLevelId) {
  // 1. slide current board out to the left
  boardArea.style.transition  = "transform 0.32s ease-in, opacity 0.32s ease-in";
  trayArea.style.transition   = "transform 0.32s ease-in, opacity 0.32s ease-in";
  previewStrip.style.transition = "opacity 0.22s ease-in";

  boardArea.style.transform   = "translateX(-110%)";
  boardArea.style.opacity     = "0";
  trayArea.style.transform    = "translateX(-110%)";
  trayArea.style.opacity      = "0";
  previewStrip.style.opacity  = "0";

  setTimeout(() => {
    // 2. snap to right (off-screen right) before sliding in
    boardArea.style.transition  = "none";
    trayArea.style.transition   = "none";
    boardArea.style.transform   = "translateX(110%)";
    trayArea.style.transform    = "translateX(110%)";

    // 3. load next level data
    loadLevel(newLevelId);

    // 4. force reflow then animate in from right
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        boardArea.style.transition  = "transform 0.35s ease-out, opacity 0.35s ease-out";
        trayArea.style.transition   = "transform 0.35s ease-out, opacity 0.35s ease-out";
        previewStrip.style.transition = "opacity 0.35s ease-out";

        boardArea.style.transform   = "translateX(0)";
        boardArea.style.opacity     = "1";
        trayArea.style.transform    = "translateX(0)";
        trayArea.style.opacity      = "1";
        previewStrip.style.opacity  = "1";
      });
    });
  }, 340);
}

/* ============================================================
   CORE — loadLevel(id)
   Everything that was previously inside the big `if (boardArea)`
   block now lives here and is fully re-entrant.
============================================================ */
function loadLevel(levelId) {
  // ── guard ──────────────────────────────────────────────────
  if (!boardArea || !levelTitle) return;

  const level = LEVELS[levelId - 1];
  if (!level) {
    levelTitle.textContent = "Level not found";
    return;
  }

  // ── update URL silently (back button still works) ──────────
  history.pushState({ levelId }, "", `?level=${levelId}`);

  // ── update meta ────────────────────────────────────────────
  levelTitle.textContent = level.name;
  updateWorldProgress(levelId);

  // ── per-level state ────────────────────────────────────────
  let tileData          = JSON.parse(JSON.stringify(level.tiles));
  let selectedTileIndex = null;
  let slots             = [];
  let livesLeft         = 3;
  let inputLocked       = false;
  let failLock          = false;

  // reset hearts
  heartEls.forEach(h => {
    h.classList.remove("lost", "shaking");
    h.textContent = "❤️";
  });

  // reset UI state
  showFeedback("", "");
  nextBtn.disabled = true;
  successOverlay.classList.remove("open");

  // ── render grid ────────────────────────────────────────────
  boardArea.innerHTML = "";
  slots = renderGrid(level, boardArea);

  // ── start timer ────────────────────────────────────────────
  startTimer();

  /* ── slot clicks ──────────────────────────────────────────── */
  slots.forEach(slot => {
    slot.addEventListener("click", () => {
      playSound("click", 1);
      if (slot.dataset.filled !== undefined) { returnTile(slot); return; }
      if (selectedTileIndex === null) return;
      placeTile(slot);
    });
  });

  /* ── tray ─────────────────────────────────────────────────── */
  function renderTray() {
    trayArea.innerHTML = "";
    tileData.forEach((tile, i) => {
      const el = document.createElement("div");
      el.className = "wTile" +
        (tile.count <= 0         ? " used"     : "") +
        (selectedTileIndex === i ? " selected" : "");
      el.innerHTML = `<span class="wNum">${tile.value}</span>
                      <div class="wBadge">${tile.count}</div>`;
      el.addEventListener("click", () => {
        playSound("click", 1);
        if (tile.count <= 0) return;
        selectedTileIndex = (selectedTileIndex === i) ? null : i;
        renderTray();
      });
      trayArea.appendChild(el);
    });
  }

  /* ── preview strip ────────────────────────────────────────── */
  function renderPreview() {
    if (!previewStrip || !level.preview) {
      if (previewStrip) previewStrip.style.display = "none";
      return;
    }
    previewStrip.style.display = "";

    const live = {};
    slots.forEach(slot => {
      if (slot.dataset.filled !== undefined) {
        live[slot.dataset.key] = slot.textContent;
      }
    });

    previewStrip.innerHTML = "";

    level.preview.forEach(row => {
      const line = document.createElement("div");
      line.className = "previewLine";

      const lbl = document.createElement("span");
      lbl.className   = "previewLabel";
      lbl.textContent = row.label;
      line.appendChild(lbl);

      row.tokens.forEach(token => {
        const el = document.createElement("span");
        if (typeof token === "number") {
          el.className   = "previewAnswer";
          el.textContent = token;
        } else if (["+", "-", "×", "÷", "="].includes(token)) {
          el.className   = "previewOp";
          el.textContent = token;
        } else {
          el.className   = live[token] ? "previewSlot filled" : "previewSlot empty";
          el.textContent = live[token] || token;
        }
        line.appendChild(el);
      });

      previewStrip.appendChild(line);
    });
  }

  /* ── place / return tile ──────────────────────────────────── */
  function placeTile(slot) {
    playSound("tile", 1);
    const tile = tileData[selectedTileIndex];
    tile.count--;
    const label = slot.querySelector(".slotLabel");
    slot.textContent   = tile.value;
    slot.dataset.value = tile.value;
    if (label) slot.appendChild(label);
    slot.dataset.filled = selectedTileIndex;
    slot.classList.add("slot--locked");
    selectedTileIndex   = null;
    renderTray();
    renderPreview();
  }

  function returnTile(slot) {
    if (slot.dataset.placeholder === "true") return;
    const i = parseInt(slot.dataset.filled);
    tileData[i].count++;
    const label = slot.querySelector(".slotLabel");
    slot.textContent = "";
    if (label) slot.appendChild(label);
    delete slot.dataset.filled;
    slot.classList.remove("slot--locked");
    delete slot.dataset.value;
    renderTray();
    renderPreview();
  }

  /* ── full reset (within same level) ──────────────────────── */
  function fullReset() {
    playSound("click", 1);
    tileData = JSON.parse(JSON.stringify(level.tiles));
    slots.forEach(slot => {
      if (slot.dataset.placeholder === "true") return;
      slot.textContent = "";
      delete slot.dataset.filled;
      delete slot.dataset.value;
      slot.classList.remove("slot--locked", "slot--correct", "slot--wrong");
    });
    selectedTileIndex = null;
    nextBtn.disabled  = true;
    showFeedback("", "");
    inputLocked = false;
    livesLeft   = 3;
    heartEls.forEach(h => {
      h.classList.remove("lost", "shaking");
      h.textContent = "❤️";
    });
    startTimer();
    renderTray();
    renderPreview();
  }

  /* ── highlight ────────────────────────────────────────────── */
  function evalEq(eq, vals) {
    if (eq.tokens) {
      return Math.round(evalTokens(eq.tokens, vals) * 1e9) / 1e9 === eq.answer;
    }
    const answerVal  = eq[eq.length - 1];
    const tokenSlice = eq.slice(0, eq.length - 2);
    let expr = "";
    for (const t of tokenSlice) {
      if (typeof t === "number") expr += t;
      else if (["+","-","×","÷"].includes(t)) expr += t === "×" ? "*" : t === "÷" ? "/" : t;
      else if (/^\[\d+(\.\d+)?\]$/.test(t))  expr += t.slice(1, -1);
      else expr += vals[t] ?? 0;
    }
    try {
      return Math.round(Function("return " + expr)() * 1e9) / 1e9 === answerVal;
    } catch { return false; }
  }

  function getKeysInEq(eq) {
    if (eq.tokens) return eq.tokens.filter(t => t.type === "slot").map(t => t.key);
    return eq.filter(t => typeof t === "string" && /^[A-Z]$/.test(t));
  }

  function highlightSlots(vals) {
    slots.forEach(slot => {
      if (slot.dataset.filled === undefined) return;
      const key         = slot.dataset.key;
      const relevantEqs = level.equations.filter(eq => getKeysInEq(eq).includes(key));
      const allPass     = relevantEqs.every(eq => evalEq(eq, vals));
      slot.classList.remove("slot--correct", "slot--wrong");
      slot.classList.add(allPass ? "slot--correct" : "slot--wrong");
    });
  }

  /* ── fail shake ───────────────────────────────────────────── */
  function triggerFail() {
    if (failLock) return;
    failLock = true;

    const overlay = document.getElementById("failOverlay");
    if (!overlay) return;

    document.body.classList.remove("fail-active");
    document.body.style.transform = "translateX(0px)";
    overlay.style.transition  = "background 0.2s ease";
    overlay.style.background  = "rgba(255,0,0,0.15)";
    setTimeout(() => { overlay.style.background = "transparent"; }, 100);

    document.body.classList.add("fail-active");
    const start = performance.now();

    function shake(t) {
      const e = t - start;
      let x = 0;
      if      (e < 125) x = -14 * (e / 125);
      else if (e < 250) x =  10 * ((e - 125) / 125);
      else if (e < 375) x =  -6 * ((e - 250) / 125);
      else if (e < 500) x =   3 * ((e - 375) / 125);
      document.body.style.transform = `translateX(${x}px)`;
      if (e < 500) {
        requestAnimationFrame(shake);
      } else {
        document.body.style.transform = "translateX(0px)";
        document.body.classList.remove("fail-active");
        failLock = false;
      }
    }
    requestAnimationFrame(shake);
  }

  /* ── lose heart ───────────────────────────────────────────── */
  function loseHeart() {
    livesLeft--;
    const heartEl = heartEls[livesLeft];
    heartEl.classList.add("shaking");
    heartEl.addEventListener("animationend", () => {
      heartEl.classList.remove("shaking");
      heartEl.classList.add("lost");
      heartEl.textContent = "🤍";
    }, { once: true });

    if (livesLeft <= 0) {
      showFeedback("❌ Out of tries! Resetting...", "error");
      playSound("error", 1);
    } else {
      showFeedback(`❌ Not quite! ${livesLeft} ${livesLeft === 1 ? "try" : "tries"} left`, "error");
      playSound("error", 1);
    }
    triggerFail();
  }

  /* ── success overlay ──────────────────────────────────────── */
  function showSuccess(earned) {
    // fadeOutBG();
    playSound("wow", 1);
    launchConfetti();
    burstStars(document.activeElement);
    stopTimer();

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    starRow.textContent   = "★".repeat(earned) + "☆".repeat(3 - earned);
    successTime.textContent = `Time: ${m}:${s.toString().padStart(2, "0")}`;
    successOverlay.classList.add("open");

    completeLevel(levelId, earned, calcScore(earned), seconds);
  }

  /* ── check button ─────────────────────────────────────────── */
  // Remove previous level's handler so it doesn't fire with stale closure
  if (checkBtn._checkHandler) checkBtn.removeEventListener("click", checkBtn._checkHandler);

  checkBtn._checkHandler = () => {
    playSound("click", 1);
    if (inputLocked) return;
    inputLocked = true;

    const vals = {};
    slots.forEach(slot => {
      if (slot.dataset.filled !== undefined) {
        vals[slot.dataset.key] = Number(slot.dataset.value);
      } else if (slot.dataset.placeholder === "true") {
        vals[slot.dataset.key] = Number(slot.dataset.value);
      }
    });

    const uniqueKeys = new Set(slots.map(s => s.dataset.key)).size;
    if (Object.keys(vals).length < uniqueKeys) {
      showFeedback("Fill all slots first!", "error");
      inputLocked = false;
      return;
    }

    const allCorrect = level.equations.every(eq => {
      if (eq.tokens) return evalTokens(eq.tokens, vals) === eq.answer;
      const answerVal  = eq[eq.length - 1];
      const tokenSlice = eq.slice(0, eq.length - 2);
      let expr = "";
      for (const t of tokenSlice) {
        if (typeof t === "number") expr += t;
        else if (["+","-","×","÷"].includes(t)) expr += t === "×" ? "*" : t === "÷" ? "/" : t;
        else if (/^\[\d+(\.\d+)?\]$/.test(t))  expr += t.slice(1, -1);
        else {
          if (vals[t] === undefined) return false;
          expr += vals[t];
        }
      }
      try {
        return Math.round(Function("return " + expr)() * 1e9) / 1e9 === answerVal;
      } catch { return false; }
    });

    if (allCorrect) {
      showSuccess(calcStars(seconds, levelId));
      inputLocked = false;
      return;
    }

    highlightSlots(vals);
    loseHeart();

    if (livesLeft <= 0) {
      setTimeout(() => {
        livesLeft = 3;
        heartEls.forEach(h => h.classList.remove("lost"));
        fullReset();
        inputLocked = false;
      }, 1800);
    } else {
      setTimeout(() => {
        slots.forEach(s => s.classList.remove("slot--correct", "slot--wrong"));
        inputLocked = false;
      }, 4800);
    }
  };
  checkBtn.addEventListener("click", checkBtn._checkHandler);

  /* ── reset button ─────────────────────────────────────────── */
  // Safe: reassign listener each loadLevel call
  resetBtn.onclick = () => fullReset();

  /* ── success overlay buttons ──────────────────────────────── */
  successNextBtn.onclick = () => {
    playSound("tile", 1);
    const next = levelId + 1;
    if (next <= LEVELS.length) {
      successOverlay.classList.remove("open");
      fadeInBG();
      transitionToLevel(next);
    } else {
      window.location.href = "map.html";
    }
  };

  successRestartBtn.onclick = () => {
    playSound("click", 1);
    successOverlay.classList.remove("open");
    fadeInBG();
    fullReset();
  };

  successMapBtn.onclick = () => {
    playSound("tile", 1);
    window.location.href = "map.html";
  };

  /* ── next button (footer) ─────────────────────────────────── */
  nextBtn.onclick = () => {
    playSound("click", 1);
    const next = levelId + 1;
    if (next <= LEVELS.length) {
      transitionToLevel(next);
    } else {
      window.location.href = "map.html";
    }
  };

  /* ── init render ──────────────────────────────────────────── */
  renderTray();
  renderPreview();
}

/* ============================================================
   ONE-TIME BUTTON LISTENERS  (never re-bound on level change)
============================================================ */

// Pause
pauseBtn.addEventListener("click", () => {
  playSound("tile", 1);
  paused = true;
  pauseOverlay.classList.add("open");
});

resumeBtn.addEventListener("click", () => {
  playSound("tile", 1);
  paused = false;
  pauseOverlay.classList.remove("open");
});

restartBtn.addEventListener("click", () => {
  playSound("tile", 1);
  pauseOverlay.classList.remove("open");
  paused = false;
  // fullReset lives inside loadLevel closure — trigger via resetBtn click
  resetBtn.click();
});

mapBtn.addEventListener("click", () => {
  playSound("tile", 1);
  window.location.href = "map.html";
});

// Hint
hintBtn.addEventListener("click", () => {
  playSound("bell", 1);
  // hintText content is set freshly inside loadLevel via level.hint
  // but we can read it from the current level via the DOM trick below
  hintOverlay.classList.add("open");
});

hintCloseBtn.addEventListener("click", () => {
  playSound("click", 1);
  hintOverlay.classList.remove("open");
});

backBtn.addEventListener("click", () => {
  playSound("tile", 1);
  window.location.href = "map.html";
});

// Browser back/forward — honour pushState history
window.addEventListener("popstate", e => {
  const id = e.state?.levelId ||
    parseInt(new URLSearchParams(window.location.search).get("level")) || 1;
  loadLevel(id);
});

/* ============================================================
   BOOT — read level from URL and start
============================================================ */
const initialId = parseInt(new URLSearchParams(window.location.search).get("level")) || 1;
loadLevel(initialId);

// Hint text needs to be updated per-level — patch hintBtn to use current level
// We do this by reading from the board title's sibling data (simplest approach:
// just update hintText inside loadLevel after the overlay opens)
hintBtn.addEventListener("click", () => {
  // The hint overlay is already opened above; update text here using current level
  const currentId = parseInt(new URLSearchParams(window.location.search).get("level")) || 1;
  const currentLevel = LEVELS[currentId - 1];
  if (hintText && currentLevel) {
    hintText.innerHTML = `<p>${currentLevel.hint || "No hint available."}</p>`;
  }
}, { capture: true }); // runs before the plain listener above