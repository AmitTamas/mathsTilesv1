import { fadeInBG,fadeOutBG,initBGMusic,playBGMusic } from "./audio.js";
initBGMusic();
playBGMusic();
fadeInBG();

/* =====================================================
   TILE LOGIC — script.js
   Warm Pastel Tutorial with Canvas Car Progress
   ===================================================== */

/* ─────────────────────────────────────────────────────
   CAR REPLACEMENT CONFIG
   ─────────────────────────────────────────────────────
   Set USE_CUSTOM_CAR = true  and point CAR_IMAGE_SRC
   to your GIF / PNG / WebP file to replace the
   canvas-drawn car with your own animated sprite.

   Recommended image size: ~80 × 48 px
   The image is automatically driven along the road.
   ───────────────────────────────────────────────────── */
import { playSound } from "./audio.js";
import { levels } from "./levels.js"
const USE_CUSTOM_CAR = true;           // ← flip to true when you have your image
const CAR_IMAGE_SRC  = "../assets/level/car-red2.png"; // ← set your image path here

/* ─────────────────────────────────────────────────────
   DOM REFS
   ───────────────────────────────────────────────────── */
const board          = document.getElementById("board");
const tilesBox       = document.getElementById("tiles");
const checkBtn       = document.getElementById("checkBtn");
const messageEl      = document.getElementById("message");
const levelTitle     = document.getElementById("levelTitle");
const completeScreen = document.getElementById("completeScreen");
const startRealGameBtn = document.getElementById("startRealGameBtn");
const gameWrap       = document.getElementById("gameWrap");
const skipBtn        = document.getElementById("skipBtn");
const carImage       = document.getElementById("carImage");

/* ─────────────────────────────────────────────────────
   PROGRESS ROAD CANVAS
   ───────────────────────────────────────────────────── */
const roadCanvas  = document.getElementById("roadProgress");
const roadCtx     = roadCanvas.getContext("2d");

const TOTAL_LEVELS = 5;

/* Car state — shared between canvas-draw and img-sprite modes */
const car = {
  x: 0, y: 0,        // current pixel position (centre of car)
  targetX: 0, targetY: 0,
  animating: false,
  wheelAngle: 0,
  bobOffset: 0,
  bobDir: 1,
  smokeParticles: []
};

/* Checkpoint positions — calculated in drawRoad(), used everywhere */
let checkpoints = [];

/* ── Build road & place car at start ── */
function initRoad() {
  const W = roadCanvas.parentElement.clientWidth;
  roadCanvas.width  = W;
  roadCanvas.height = 110;

  checkpoints = buildCheckpoints(W, 110, TOTAL_LEVELS);

  drawRoadScene(0); // draw with 0 levels complete

  // Position car at checkpoint 0
  car.x = checkpoints[0].x;
  car.y = checkpoints[0].y;
  car.targetX = car.x;
  car.targetY = car.y;

  if (USE_CUSTOM_CAR) {
    carImage.src = CAR_IMAGE_SRC;
    carImage.classList.remove("hidden");
    syncCarImage();
  }
}

/* Build evenly-spaced checkpoints on a gentle sine-wave path */
function buildCheckpoints(W, H, n) {
  const pts = [];
  const margin = 40;
  const usableW = W - margin * 2;
  const midY = H / 2 + 10;
  const amp  = 22; // vertical wave amplitude

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = margin + t * usableW;
    const y = midY + Math.sin(t * Math.PI * 1.8) * amp;
    pts.push({ x, y });
  }
  return pts;
}

/* Draw the full road scene: road strip, markers, flags, car */
function drawRoadScene(completedCount) {
  const W = roadCanvas.width;
  const H = roadCanvas.height;
  roadCtx.clearRect(0, 0, W, H);

  if (checkpoints.length === 0) return;

  /* ── Road shadow ── */
  roadCtx.save();
  roadCtx.translate(0, 6);
  roadCtx.globalAlpha = 0.18;
  drawRoadStrip("#5c3d2e");
  roadCtx.restore();

  /* ── Road base (tan) ── */
  roadCtx.globalAlpha = 1;
  drawRoadStrip("#e8c99a");

  /* ── Road surface (lighter centre) ── */
  roadCtx.save();
  drawRoadPath();
  roadCtx.lineWidth = 22;
  roadCtx.strokeStyle = "#f4deb3";
  roadCtx.stroke();
  roadCtx.restore();

  /* ── Dashed centre line ── */
  roadCtx.save();
  drawRoadPath();
  roadCtx.lineWidth = 2.5;
  roadCtx.strokeStyle = "rgba(255,255,255,0.7)";
  roadCtx.setLineDash([10, 12]);
  roadCtx.lineDashOffset = 0;
  roadCtx.stroke();
  roadCtx.restore();

  /* ── Checkpoint markers ── */
  checkpoints.forEach((cp, i) => {
    const done    = i < completedCount;
    const current = i === completedCount;
    drawCheckpointMarker(cp, i + 1, done, current);
  });

  /* ── Canvas car (only if not using custom image) ── */
  if (!USE_CUSTOM_CAR) {
    drawCanvasCar(car.x, car.y);
  }
}

/* Draw road as a thick stroked path following checkpoints */
function drawRoadStrip(color) {
  roadCtx.save();
  drawRoadPath();
  roadCtx.lineWidth = 36;
  roadCtx.lineCap   = "round";
  roadCtx.lineJoin  = "round";
  roadCtx.strokeStyle = color;
  roadCtx.stroke();
  roadCtx.restore();
}

function drawRoadPath() {
  roadCtx.beginPath();
  roadCtx.moveTo(checkpoints[0].x, checkpoints[0].y);
  for (let i = 1; i < checkpoints.length; i++) {
    // Smooth curve through control point
    const prev = checkpoints[i - 1];
    const curr = checkpoints[i];
    const cpx  = (prev.x + curr.x) / 2;
    roadCtx.quadraticCurveTo(cpx, prev.y, curr.x, curr.y);
  }
}

/* Draw a single checkpoint circle + number */
function drawCheckpointMarker(cp, num, done, current) {
  const r = 14;

  /* Outer glow for current */
  if (current) {
    roadCtx.save();
    roadCtx.beginPath();
    roadCtx.arc(cp.x, cp.y, r + 7, 0, Math.PI * 2);
    const grd = roadCtx.createRadialGradient(cp.x, cp.y, r, cp.x, cp.y, r + 8);
    grd.addColorStop(0, "rgba(249,199,79,0.55)");
    grd.addColorStop(1, "rgba(249,199,79,0)");
    roadCtx.fillStyle = grd;
    roadCtx.fill();
    roadCtx.restore();
  }

  /* Circle */
  roadCtx.beginPath();
  roadCtx.arc(cp.x, cp.y, r, 0, Math.PI * 2);
  roadCtx.fillStyle   = done ? "#f9c74f" : current ? "#fff8f0" : "rgba(255,255,255,0.5)";
  roadCtx.strokeStyle = done ? "#e8a820" : current ? "#ffb347" : "#c9a87a";
  roadCtx.lineWidth   = 2.5;
  roadCtx.fill();
  roadCtx.stroke();

  /* Icon or number */
  roadCtx.fillStyle = done ? "#5c3d2e" : current ? "#ffb347" : "#9b6a4a";
  roadCtx.font      = done ? "bold 13px Nunito, Arial" : "bold 12px Nunito, Arial";
  roadCtx.textAlign = "center";
  roadCtx.textBaseline = "middle";
  roadCtx.fillText(done ? "✓" : String(num), cp.x, cp.y);
}

/* ── Canvas Car Drawing ── */
function drawCanvasCar(cx, cy) {
  const bob = Math.sin(Date.now() * 0.004) * 1.8; // idle bob
  const x = cx;
  const y = cy + bob;

  roadCtx.save();
  roadCtx.translate(x, y);

  /* Shadow */
  roadCtx.save();
  roadCtx.scale(1, 0.25);
  roadCtx.beginPath();
  roadCtx.ellipse(0, 28, 30, 10, 0, 0, Math.PI * 2);
  roadCtx.fillStyle = "rgba(92,61,46,0.2)";
  roadCtx.fill();
  roadCtx.restore();

  /* Body */
  roundRect(roadCtx, -34, -14, 68, 28, 10, "#ffb347");
  /* Body top sheen */
  roundRect(roadCtx, -28, -24, 52, 18, 8, "#ffd6a5");
  /* Windshield */
  roundRect(roadCtx, -20, -22, 22, 15, 5, "#c9e8f5");
  /* Rear window */
  roundRect(roadCtx, 6, -22, 16, 15, 5, "#c9e8f5");
  /* Door line */
  roadCtx.beginPath();
  roadCtx.moveTo(2, -14); roadCtx.lineTo(2, 14);
  roadCtx.strokeStyle = "rgba(92,61,46,0.25)";
  roadCtx.lineWidth = 1.5;
  roadCtx.stroke();
  /* Headlight */
  roadCtx.beginPath();
  roadCtx.ellipse(-32, -4, 5, 4, 0, 0, Math.PI * 2);
  roadCtx.fillStyle = "#fffde0";
  roadCtx.fill();
  /* Tail light */
  roadCtx.beginPath();
  roadCtx.ellipse(33, -4, 4, 3.5, 0, 0, Math.PI * 2);
  roadCtx.fillStyle = "#ff6b6b";
  roadCtx.fill();

  /* Wheels */
  drawWheel(roadCtx, -20, 14, car.wheelAngle);
  drawWheel(roadCtx,  20, 14, car.wheelAngle);

  roadCtx.restore();
}

function drawWheel(ctx, wx, wy, angle) {
  const r = 9;
  ctx.save();
  ctx.translate(wx, wy);
  /* Tyre */
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#5c3d2e";
  ctx.fill();
  /* Hubcap */
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#e8c99a";
  ctx.fill();
  /* Spoke */
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5); ctx.lineTo(0, r * 0.5);
  ctx.strokeStyle = "#5c3d2e";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/* ── Car Animation Loop (canvas car + image car) ── */
let roadAnimId = null;
let completedLevels = 0;

function startRoadLoop() {
  if (roadAnimId) return;

  function tick() {
    // Only animate if using canvas car
    if (!USE_CUSTOM_CAR) {
      const speed = 0.06;
      car.x += (car.targetX - car.x) * speed;
      car.y += (car.targetY - car.y) * speed;

      const dist = Math.hypot(car.targetX - car.x, car.targetY - car.y);
      if (dist > 1) {
        car.wheelAngle += 0.08;
      }
    }

    drawRoadScene(completedLevels);

    // Always sync PNG
    if (USE_CUSTOM_CAR) syncCarImage();

    roadAnimId = requestAnimationFrame(tick);
  }

  tick();
}

/* Sync the <img> car position to the canvas car coords */
function syncCarImage() {
  const wrap = roadCanvas.parentElement;
  const wrapRect = wrap.getBoundingClientRect();
  const canvasRect = roadCanvas.getBoundingClientRect();

  // Offset of canvas inside wrap
  const offX = canvasRect.left - wrapRect.left;
  const offY = canvasRect.top  - wrapRect.top;

  const scaleX = roadCanvas.clientWidth  / roadCanvas.width;
  const scaleY = roadCanvas.clientHeight / roadCanvas.height;

  const px = offX + car.x * scaleX;
  const py = offY + car.y * scaleY;

  carImage.style.left = px + "px";
  carImage.style.top  = py + "px";
}

/* Drive car to next checkpoint */
function driveCarToCheckpoint(index) {
  if (index >= checkpoints.length) return;
  const target = checkpoints[index];

  if (USE_CUSTOM_CAR) {
    const duration = 200; // ms
    const startX = car.x;
    const startY = car.y;
    const startTime = performance.now();

    function animate(now) {
      const t = Math.min((now - startTime) / duration, 1);

      // easeOut (fast start, smooth stop)
      const ease = 1 - Math.pow(1 - t, 3);

      car.x = startX + (target.x - startX) * ease;
      car.y = startY + (target.y - startY) * ease;

      syncCarImage();

      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

  } else {
    car.targetX = target.x;
    car.targetY = target.y;
  }
}

/* ─────────────────────────────────────────────────────
   CONFETTI
   ───────────────────────────────────────────────────── */
const confettiCanvas = document.getElementById("confettiCanvas");
const confCtx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confAnimId = null;

const CONF_COLORS = ["#ffb347","#f9c74f","#b5d5c5","#ffc8c8","#d9c8f0","#c9e8f5","#ff6b6b","#7fb5a0"];

function launchConfetti() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  confettiParticles = [];

  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 5,
      color: CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
      vx: (Math.random() - 0.5) * 3.5,
      vy: 3 + Math.random() * 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8,
      life: 1
    });
  }

  function animConf() {
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      p.vy  *= 1.01; // slight gravity increase
      p.life -= 0.008;

      if (p.y < confettiCanvas.height && p.life > 0) alive = true;

      confCtx.save();
      confCtx.globalAlpha = Math.max(0, p.life);
      confCtx.translate(p.x, p.y);
      confCtx.rotate((p.rot * Math.PI) / 180);
      confCtx.fillStyle = p.color;
      confCtx.beginPath();
      confCtx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      confCtx.fill();
      confCtx.restore();
    });

    if (alive) confAnimId = requestAnimationFrame(animConf);
    else confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  // fadeOutBG();
  animConf();
}

/* ─────────────────────────────────────────────────────
   STAR BURST (correct answer)
   ───────────────────────────────────────────────────── */
function burstStars() {
  playSound("wow",1);
  const emojis = ["⭐","✨","🌟","💛"];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement("div");
    el.className = "star-burst";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const angle = (i / 6) * 360;
    const dist  = 70 + Math.random() * 50;
    const rad   = (angle * Math.PI) / 180;
    el.style.setProperty("--dx", Math.cos(rad) * dist + "px");
    el.style.setProperty("--dy", Math.sin(rad) * dist + "px");
    // Centre on check button
    const btnRect = checkBtn.getBoundingClientRect();
    el.style.left = btnRect.left + btnRect.width / 2 + "px";
    el.style.top  = btnRect.top  + btnRect.height / 2 + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

/* ─────────────────────────────────────────────────────
   SKIP BUTTON
   ───────────────────────────────────────────────────── */
skipBtn.addEventListener("click", () => {
  playSound("tile",1);
  skipBtn.disabled = true;
  gameWrap.style.transition = "opacity 0.4s, transform 0.4s";
  gameWrap.style.opacity    = "0";
  gameWrap.style.transform  = "translateY(-20px)";
  setTimeout(() => {
    window.location.href = "map.html";
  }, 400);
});

/* ─────────────────────────────────────────────────────
   GAME STATE
   ───────────────────────────────────────────────────── */
let currentLevel = 0;
let selectedTile = null;
let tileData     = [];
let slots        = [];

/* Kick off */
window.addEventListener("load", () => {
  initRoad();
  startRoadLoop();
  loadLevel();
});

window.addEventListener("resize", () => {
  initRoad();
  driveCarToCheckpoint(currentLevel);
});

/* ─────────────────────────────────────────────────────
   LEVEL LOADING
   ───────────────────────────────────────────────────── */
function loadLevel(isFirst = true) {
  selectedTile        = null;
  slots               = [];
  messageEl.innerText = "";
  messageEl.className = "";

  const level = levels[currentLevel];
  levelTitle.innerText = "Level " + (currentLevel + 1);
  tileData = JSON.parse(JSON.stringify(level.tiles));

  board.innerHTML    = "";
  tilesBox.innerHTML = "";

  createBoard(level);
  renderTiles();
}

/* ─────────────────────────────────────────────────────
   BOARD CREATION
   ───────────────────────────────────────────────────── */
function createBoard(level) {
  const wrap = document.createElement("div");
  wrap.className = "group";

  if (level.type === "chain1") {
    const mathGroup = document.createElement("div");
    mathGroup.className = "mathGroup";

    const slot1  = createSlot();
    const plus   = makeSign("+");
    const slot2  = createSlot();

    mathGroup.append(slot1, plus, slot2);

    const divide = makeSign("/");
    const slot3  = createSlot();
    const equal  = makeSign("=");
    const answer = makeAnswer(level.answer);

    wrap.append(mathGroup, divide, slot3, equal, answer);
    slots.push(slot1, slot2, slot3);

  } else {
    const slot1  = createSlot();
    const sign   = makeSign(getSymbol(level.type));
    const slot2  = createSlot();
    const equal  = makeSign("=");
    const answer = makeAnswer(level.answer);

    wrap.append(slot1, sign, slot2, equal, answer);
    slots.push(slot1, slot2);
  }

  board.appendChild(wrap);
}

function createSlot() {
  const slot = document.createElement("div");
  slot.className = "slot";
  slot.addEventListener("click",   () => placeTile(slot));
  slot.addEventListener("dblclick",() => removeTile(slot));
  return slot;
}

function makeSign(text) {
  const el = document.createElement("div");
  el.className = "sign";
  el.innerText = text;
  return el;
}

function makeAnswer(val) {
  const el = document.createElement("div");
  el.className = "answer";
  el.innerText = val;
  return el;
}

function getSymbol(type) {
  if (type === "add") return "+";
  if (type === "sub") return "−";
  if (type === "mul") return "×";
  if (type === "div") return "/";
  return "?";
}

/* ─────────────────────────────────────────────────────
   TILES
   ───────────────────────────────────────────────────── */
function renderTiles() {
  tilesBox.innerHTML = "";

  tileData.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    if (item.count <= 0) tile.classList.add("used");

    tile.innerHTML = `
      <span class="num">${item.value}</span>
      <div class="badge">${item.count}</div>
    `;

    tile.style.animationDelay = (index * 0.07) + "s";

    tile.addEventListener("click", () => {
      playSound("click",1);
      if (item.count <= 0) return;

      selectedTile = index;

      document.querySelectorAll(".tile").forEach(t => t.classList.remove("selected"));
      tile.classList.add("selected");
    });

    tilesBox.appendChild(tile);
  });
}

function placeTile(slot) {
  if (selectedTile === null || slot.innerText !== "") {
    playSound("tile",1);
    return;
  }
  playSound("tile",1);

  const tile = tileData[selectedTile];
  if (tile.count <= 0) return;

  slot.innerText      = tile.value;
  slot.dataset.index  = selectedTile;
  tile.count--;

  selectedTile = null;
  document.querySelectorAll(".tile").forEach(t => t.classList.remove("selected"));

  /* Pop animation */
  slot.classList.add("pop");
  slot.addEventListener("animationend", () => slot.classList.remove("pop"), { once: true });

  renderTiles();
}

function removeTile(slot) {
  playSound("tile",1);
  if (slot.innerText === "") return;
  const i = slot.dataset.index;
  tileData[i].count++;
  slot.innerText      = "";
  slot.dataset.index  = "";
  renderTiles();
}

/* ─────────────────────────────────────────────────────
   CHECK ANSWER
   ───────────────────────────────────────────────────── */
checkBtn.addEventListener("click", () => {
  playSound("click",1);
  const level = levels[currentLevel];

  if (level.type === "chain1") {
    const a = Number(slots[0].innerText);
    const b = Number(slots[1].innerText);
    const c = Number(slots[2].innerText);

    if (!a || !b) {
      playSound("error",1);
      showMessage("Fill all slots!", "");
      return;
    }
    showResult(solve(level.type, a, b, c) === level.answer);

  } else {
    const a = Number(slots[0].innerText);
    const b = Number(slots[1].innerText);

    if (!a || !b) {
      playSound("error",1);
      showMessage("Fill all slots!", "");
      return;
    }
    showResult(solve(level.type, a, b) === level.answer);
  }
});

function solve(type, a, b, c) {
  if (type === "add")    return a + b;
  if (type === "sub")    return a - b;
  if (type === "mul")    return a * b;
  if (type === "div")    return a / b;
  if (type === "chain1") return (a + b) / c;
  return 0;
}

/* ─────────────────────────────────────────────────────
   RESULT FEEDBACK
   ───────────────────────────────────────────────────── */
// REPLACE showResult()
function resetBoard() {
  tileData = JSON.parse(JSON.stringify(levels[currentLevel].tiles));

  slots.forEach(slot => {
    slot.innerText = "";
    slot.dataset.index = "";
  });

  selectedTile = null;

  document.querySelectorAll(".tile").forEach(t => {
    t.classList.remove("selected");
  });

  renderTiles();
}
function showResult(correct) {
  if (correct) {
    showMessage("🎉 Correct!", "correct");
    burstStars();
    gameWrap.classList.add("correct-bounce");
    setTimeout(() => gameWrap.classList.remove("correct-bounce"), 500);
    launchMiniConfetti();
    setTimeout(nextLevel, 1800);
  }else {
    playSound("error",1);
    showMessage("❌ Try Again", "wrong");

    gameWrap.classList.add("shake");

    gameWrap.addEventListener("animationend", () => {
      gameWrap.classList.remove("shake");

      // reset tiles after shake
      resetBoard();

    }, { once: true });
  }
}

function showMessage(text, cls) {
  messageEl.innerText   = text;
  messageEl.className   = cls;
}

// fix launchMiniConfetti — use emoji shapes not color strings
function launchMiniConfetti() {
  const rect   = gameWrap.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const emojis = ["⭐","✨","🌟","💛","🧡","💚","💙","🎉"];

  for (let i = 0; i < 22; i++) {
    const el    = document.createElement("div");
    el.className = "star-burst";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = Math.random() * 360;
    const dist  = 60 + Math.random() * 100;
    const rad   = (angle * Math.PI) / 180;

    el.style.setProperty("--dx", Math.cos(rad) * dist + "px");
    el.style.setProperty("--dy", Math.sin(rad) * dist + "px");
    el.style.left              = cx + "px";
    el.style.top               = cy + "px";
    el.style.fontSize          = (14 + Math.random() * 10) + "px";
    el.style.animationDuration = (0.8 + Math.random() * 0.5) + "s";
    el.style.animationDelay    = (Math.random() * 0.25) + "s";

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
}

/* ─────────────────────────────────────────────────────
   NEXT LEVEL
   ───────────────────────────────────────────────────── */
// REPLACE nextLevel()
let transitioning = false; // guard flag — add this above nextLevel

function nextLevel() {
  if (transitioning) return;
  transitioning = true;

  // Step 1 — fade OUT current level
  gameWrap.style.transition = "opacity 0.25s ease, transform 0.25s ease";
  gameWrap.style.opacity    = "0";
  gameWrap.style.transform  = "translateY(-12px)";

  setTimeout(() => {
    // Step 2 — while invisible: increment, rebuild DOM
    currentLevel++;
    completedLevels = currentLevel;

    if (currentLevel >= levels.length) {
      localStorage.setItem("tutorialDone", "true");
      gameWrap.style.opacity = "1";
      completeScreen.classList.remove("hidden");
      launchConfetti();
      transitioning = false;
      return;
    }

    // Rebuild DOM while fully hidden — no flash
    selectedTile        = null;
    slots               = [];
    messageEl.innerText = "";
    messageEl.className = "";
    board.innerHTML     = "";
    tilesBox.innerHTML  = "";
    levelTitle.innerText = "Level " + (currentLevel + 1);
    tileData = JSON.parse(JSON.stringify(levels[currentLevel].tiles));
    createBoard(levels[currentLevel]);
    renderTiles();

    // Keep transform reset ready but still opacity 0
    gameWrap.style.transition = "none";
    gameWrap.style.transform  = "translateY(14px)";

    // Step 3 — one rAF to let browser paint the new DOM, THEN fade in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gameWrap.style.transition = "opacity 0.35s ease, transform 0.35s ease";
        gameWrap.style.opacity    = "1";
        gameWrap.style.transform  = "translateY(0)";

        setTimeout(() => {
          // Step 4 — car drives AFTER new level is fully visible
          gameWrap.style.transition = "";
          driveCarToCheckpoint(Math.min(currentLevel, checkpoints.length - 1));
          transitioning = false;
        }, 380);
      });
    });

  }, 280);
}

/* ─────────────────────────────────────────────────────
   COMPLETE SCREEN
   ───────────────────────────────────────────────────── */
startRealGameBtn.addEventListener("click", () => {
  playSound("unlock",1);
  window.location.href = "map.html";
});