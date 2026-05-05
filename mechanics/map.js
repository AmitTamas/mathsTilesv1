import { fadeInBG,fadeOutBG,initBGMusic,playBGMusic } from "./audio.js";
initBGMusic();
playBGMusic();
fadeInBG();

import {
  worldLevels,
  refreshProgress,
  getTotalStars,
  getTotalScore
} from "./progression.js";
import { playSound } from "./audio.js";

refreshProgress();

if (localStorage.getItem("tutorialDone") !== "true") {
  window.location.href = "index.html";
}

/* ═══════════════════════════════════════════════
   LEVEL META
═══════════════════════════════════════════════ */
const LEVEL_META = [
  { icon: "+", label: "Addition" },
  { icon: "−", label: "Subtraction" },
  { icon: "×", label: "Multiplication" },
  { icon: "÷", label: "Division" },
  { icon: "½", label: "Fractions" },
  { icon: "²", label: "Squares" },
  { icon: "√", label: "Roots" },
  { icon: "%", label: "Percentage" },
  { icon: "∑", label: "Series Trap" },
  { icon: "∞", label: "Infinity Gate Boss" }
];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function getDiff(n) {
  if (n <= 3) return "Easy";
  if (n <= 7) return "Medium";
  return "Hard";
}

function getLevelData(n) {
  return worldLevels.find(l => l.id === n);
}

function getState(n) {
  const l = getLevelData(n);
  return l ? l.status : "locked";
}

function getStars(n) {
  const s = getLevelData(n)?.stars || 0;
  return "★".repeat(s) + "☆".repeat(3 - s);
}

function getCurrentLevel() {
  const c = worldLevels.find(l => l.status === "current");
  return c ? c.id : 1;
}

/* ═══════════════════════════════════════════════
   MAP GEOMETRY
═══════════════════════════════════════════════ */
const LW = 1000;
const LH = 2400;

const waypoints = [
  {x:280,y:2200},
  {x:400,y:2180},
  {x:580,y:2100},
  {x:680,y:1980},
  {x:660,y:1840},
  {x:540,y:1750},
  {x:380,y:1720},
  {x:260,y:1640},
  {x:240,y:1500},
  {x:340,y:1390},
  {x:500,y:1340},
  {x:660,y:1300},
  {x:760,y:1200},
  {x:740,y:1060},
  {x:600,y:980},
  {x:420,y:960},
  {x:280,y:880},
  {x:240,y:740},
  {x:340,y:620},
  {x:500,y:560},
  {x:660,y:520},
  {x:760,y:400},
  {x:720,y:260},
  {x:580,y:160},
  {x:440,y:120}
];

const levelT    = [0.04,0.13,0.22,0.31,0.40,0.50,0.59,0.68,0.78,0.90];
const levelSide = [ 1,  -1,   1,  -1,   1,  -1,   1,  -1,   1,  -1 ];

/* ═══════════════════════════════════════════════
   DOM
═══════════════════════════════════════════════ */
const totalStarsEl = document.getElementById("starCount");
const totalScoreEl = document.getElementById("scoreCount");
const mapWrap      = document.getElementById("mapWrap");
const roadSvgLayer = document.getElementById("roadSvgLayer");
const canvas       = document.getElementById("roadCanvas");
const ctx          = canvas.getContext("2d");
const bgLayer      = document.getElementById("bgLayer");
const decorLayer   = document.getElementById("decorLayer");
const scaleWrap    = document.getElementById("scaleWrap");
let endDriftPlayed = false;

/* ═══════════════════════════════════════════════
   CAR IMAGE
═══════════════════════════════════════════════ */
const carImg = new Image();
carImg.src   = "../assets/level/car-red.png";
carImg.onload = () => redraw();

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let currentCarIdx = 0;
let scale         = 1;
let cW            = 0;
let cH            = 0;
let nodeDivs      = [];

// Pre-cached — rebuilt in init(), never per-frame
let cachedPath   = null;
let cachedMapTop = 0;

/* ═══════════════════════════════════════════════
   HUD
═══════════════════════════════════════════════ */
function updateHudTotals() {
  if (totalStarsEl) totalStarsEl.textContent = getTotalStars();
  if (totalScoreEl) totalScoreEl.textContent = getTotalScore();
}

/* ═══════════════════════════════════════════════
   PATH HELPERS
═══════════════════════════════════════════════ */
function buildSegs(pts) {
  const segs = [];
  let total  = 0;

  for (let i = 0; i < pts.length - 1; i++) {
    const dx  = pts[i + 1].x - pts[i].x;
    const dy  = pts[i + 1].y - pts[i].y;
    const len = Math.hypot(dx, dy);

    segs.push({
      x0: pts[i].x, y0: pts[i].y,
      x1: pts[i + 1].x, y1: pts[i + 1].y,
      len
    });

    total += len;
  }

  return { segs, total };
}

function samplePath(data, t) {
  let d = t * data.total;

  for (const s of data.segs) {
    if (d <= s.len) {
      const f = d / s.len;
      return {
        x: s.x0 + (s.x1 - s.x0) * f,
        y: s.y0 + (s.y1 - s.y0) * f
      };
    }
    d -= s.len;
  }

  const last = data.segs[data.segs.length - 1];
  return { x: last.x1, y: last.y1 };
}

function angleBetween(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

function buildCatmullSegs(pts, divisions = 20) {
  const result = [];
  let total = 0;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    let prevX = p1.x, prevY = p1.y;

    for (let d = 1; d <= divisions; d++) {
      const t  = d / divisions;
      const t2 = t * t, t3 = t2 * t;
      const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt;

      const x = mt3 * p1.x + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * p2.x;
      const y = mt3 * p1.y + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * p2.y;

      const len = Math.hypot(x - prevX, y - prevY);
      result.push({ x0: prevX, y0: prevY, x1: x, y1: y, len });
      total += len;

      prevX = x;
      prevY = y;
    }
  }

  return { segs: result, total };
}

/* ═══════════════════════════════════════════════
   SVG ROAD
═══════════════════════════════════════════════ */
function buildRoadPath(pts) {
  if (pts.length < 2) return "";

  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }

  return d;
}

function drawRoad() {
  const d = buildRoadPath(waypoints);

  roadSvgLayer.innerHTML = `
    <svg
      viewBox="0 0 ${LW} ${LH}"
      preserveAspectRatio="xMidYMin meet"
      style="position:absolute;top:0;left:0;width:100%;height:100%;">

      <path d="${d}" fill="none"
        stroke="rgba(0,0,0,.15)" stroke-width="92"
        stroke-linecap="round" stroke-linejoin="round"
        transform="translate(0,8)" />

      <path d="${d}" fill="none"
        stroke="#8B5E3C" stroke-width="84"
        stroke-linecap="round" stroke-linejoin="round" />

      <path d="${d}" fill="none"
        stroke="#f4a94e" stroke-width="68"
        stroke-linecap="round" stroke-linejoin="round" />

      <path d="${d}" fill="none"
        stroke="rgba(255,255,255,.18)" stroke-width="28"
        stroke-linecap="round" stroke-linejoin="round" />

      <path d="${d}" fill="none"
        stroke="rgba(255,255,255,.55)" stroke-width="4"
        stroke-dasharray="18 14" stroke-linecap="round" />

    </svg>
  `;
}

/* ═══════════════════════════════════════════════
   CAR
═══════════════════════════════════════════════ */
const carState = { x: 0, y: 0, angle: 0 };
let carAnimId  = null;

function drawCar(x, y, aDeg) {
  const a = aDeg * Math.PI / 180;
  const w = 52;
  const h = 78;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  if (!carImg.complete || !carImg.naturalWidth) return;

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.drawImage(carImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// No camera call here — camera runs its own independent loop
function redraw() {
  drawCar(carState.x, carState.y, carState.angle);
}

/* ═══════════════════════════════════════════════
   CAMERA FOLLOW — independent rAF loop
═══════════════════════════════════════════════ */
let camY = null;

function startCameraLoop() {
  function cameraLoop() {
    if (carAnimId !== null) {
      const carScreenY   = carState.y * scale;
      const targetScroll = cachedMapTop + carScreenY - window.innerHeight * 0.55;

      if (camY === null) camY = window.scrollY;
      camY += (targetScroll - camY) * 0.18;
      window.scrollTo({ top: Math.max(0, camY), behavior: "instant" });
    }
    requestAnimationFrame(cameraLoop);
  }
  requestAnimationFrame(cameraLoop);
}

/* ═══════════════════════════════════════════════
   AUDIO HELPERS
═══════════════════════════════════════════════ */
function fadeAudio(audio, fromVol, toVol, duration, onDone) {
  const steps    = 30;
  const interval = duration / steps;
  const delta    = (toVol - fromVol) / steps;
  let   current  = fromVol;
  let   count    = 0;

  const id = setInterval(() => {
    count++;
    current += delta;
    audio.volume = Math.min(1, Math.max(0, current));
    if (count >= steps) {
      clearInterval(id);
      onDone && onDone();
    }
  }, interval);
}

let engineSound = null;
let engineLoop  = null;
let driftSound  = null;

function playEngineSegment(startAt = 2, endAt = 7, vol = 0.6) {
  stopEngineLoop();

  engineSound = new Audio("../assets/sounds/car-engune-2.mp3");
  engineSound.volume = vol;
  engineSound.currentTime = startAt;
  engineSound.play().catch(() => {});

  engineLoop = setInterval(() => {
    if (!engineSound) return;
    if (engineSound.currentTime >= endAt - 0.1) {
      engineSound.currentTime = startAt;
    }
  }, 100);
}

function stopEngineLoop(fadeDur = 600) {
  if (!engineSound) return;
  const e = engineSound;
  engineSound = null;
  if (engineLoop) { clearInterval(engineLoop); engineLoop = null; }
  fadeAudio(e, e.volume, 0, fadeDur, () => e.pause());
}

function playDriftAtTurn(holdMs = 600) {
  if (driftSound) {
    driftSound.pause();
    driftSound = null;
  }

  driftSound = new Audio("../assets/sounds/car-drifting-1.mp3");
  driftSound.volume = 0.7;
  driftSound.play().catch(() => {});

  setTimeout(() => {
    if (driftSound) {
      fadeAudio(driftSound, 0.7, 0, 200, () => {
        if (driftSound) { driftSound.pause(); driftSound = null; }
      });
    }
  }, holdMs);
}

/* ═══════════════════════════════════════════════
   CAR PLACEMENT & DRIVING
═══════════════════════════════════════════════ */
const CAR_KEY = "mapCarLevel";

function saveCarLevel(n) {
  localStorage.setItem(CAR_KEY, String(n));
}

function loadCarLevel() {
  const v = parseInt(localStorage.getItem(CAR_KEY));
  return isNaN(v) ? 1 : v;
}

function placeCarAtLevel(i) {
  const t   = levelT[i];
  const pos = samplePath(cachedPath, t);
  const p1  = samplePath(cachedPath, Math.max(0, t - 0.015));
  const p2  = samplePath(cachedPath, Math.min(1, t + 0.015));

  carState.x     = pos.x;
  carState.y     = pos.y;
  carState.angle = angleBetween(p1, p2);

  redraw();
}

function driveCarToLevel(targetIdx, onDone) {
  if (carAnimId) cancelAnimationFrame(carAnimId);

  const path     = cachedPath;  // use cache — no rebuild
  const fromT    = levelT[currentCarIdx];
  const toT      = levelT[targetIdx];
  const distance = Math.abs(toT - fromT);
  const duration = 800 + distance * 6500;

  const startDelay = 400;
  const startPos   = { x: carState.x, y: carState.y };
  let start        = null;
  let shaking      = true;
  endDriftPlayed   = false;
  let spinTarget   = null;

  function getRoadAngleAt(t) {
    const p1 = samplePath(path, Math.max(0, t - 0.015));
    const p2 = samplePath(path, Math.min(1, t + 0.015));
    return angleBetween(p1, p2);
  }

  function driveEase(t) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.15) {
      const t2 = t / 0.15;
      return 0.08 * t2 * t2;
    } else if (t < 0.85) {
      const t2 = (t - 0.15) / 0.70;
      return 0.08 + 0.84 * t2;
    } else {
      const t2 = (t - 0.85) / 0.15;
      return 0.92 + 0.08 * (1 - Math.pow(1 - t2, 2));
    }
  }

  function getTurnSharpness(t) {
    const a1 = getRoadAngleAt(Math.max(0, t - 0.04));
    const a2 = getRoadAngleAt(Math.min(1, t + 0.04));
    let diff = Math.abs(a2 - a1);
    if (diff > 180) diff = 360 - diff;
    return Math.min(diff / 90, 1);
  }

  playEngineSegment(2, 7, 0.4);
  playDriftAtTurn();

  function tick(now) {
    // ── SHAKE PHASE ──────────────────────────────────────────────────
    if (shaking) {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(elapsed / startDelay, 1);

      const intensity = (1 - t) * 4;
      carState.x     = startPos.x + Math.sin(t * 40) * intensity;
      carState.y     = startPos.y + Math.cos(t * 35) * intensity;
      carState.angle += Math.sin(t * 30) * 2;

      redraw();

      if (t < 1) {
        carAnimId = requestAnimationFrame(tick);
      } else {
        shaking = false;
        start   = performance.now();
        carAnimId = requestAnimationFrame(tick);
      }
      return;
    }

    // ── DRIVE PHASE ───────────────────────────────────────────────────
    const raw      = Math.min((now - start) / duration, 1);
    const progress = driveEase(raw);
    const t        = fromT + (toT - fromT) * progress;
    const tClamped = Math.min(Math.max(t, 0), 1);

    const pos       = samplePath(path, tClamped);
    const roadAngle = getRoadAngleAt(tClamped);
    const rad       = roadAngle * Math.PI / 180;

    // backward bounce on arrival
    if (raw > 0.88) {
      const bt         = (raw - 0.88) / 0.12;
      const ease       = Math.sin(bt * Math.PI);
      const backOffset = ease * 12;
      pos.x -= Math.cos(rad) * backOffset;
      pos.y -= Math.sin(rad) * backOffset;
    }

    carState.x = pos.x;
    carState.y = pos.y;

    // stop spin
    let spinAngle = 0;
    if (raw > 0.88) {
      if (spinTarget === null) {
        const finalRoadAngle = getRoadAngleAt(toT);
        const angleDelta = ((finalRoadAngle - carState.angle) + 540) % 360 - 180;
        spinTarget = 360 + angleDelta;
      }
      const spinT = (raw - 0.88) / 0.12;
      const eased = spinT < 0.5
        ? 2 * spinT * spinT
        : 1 - Math.pow(-2 * spinT + 2, 2) / 2;
      spinAngle = eased * spinTarget;
    }

    const targetAngle = roadAngle + spinAngle;
    const angleDiff   = ((targetAngle - carState.angle) + 540) % 360 - 180;
    const lag         = spinAngle > 0 ? 1.0 : 0.15;
    carState.angle   += angleDiff * lag;

    if (spinAngle === 0) {
      const deviation = ((carState.angle - roadAngle) + 540) % 360 - 180;
      if (Math.abs(deviation) > 35) {
        carState.angle = roadAngle + Math.sign(deviation) * 35;
      }
    }

    redraw();

    if (raw < 1) {
      if (!endDriftPlayed && Math.abs(tClamped - toT) < 0.05) {
        endDriftPlayed = true;
        const remaining = (1 - raw) * duration;
        playDriftAtTurn(Math.max(100, remaining - 100));
      }
      carAnimId = requestAnimationFrame(tick);
    } else {
      carAnimId = null;
      stopEngineLoop(200);
      setTimeout(() => { onDone && onDone(); }, 300);
    }
  }
  fadeOutBG();
  carAnimId = requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════
   NODES
═══════════════════════════════════════════════ */
function getNodeType(level) {
  if (level === 10) return "boss";
  if (level === 5)  return "chest";
  if (level === 7)  return "gold";
  if (level === 3 || level === 8) return "timed";
  return "normal";
}

function placeNodes() {
  scaleWrap.querySelectorAll(".road-marker, .node-link, .lnode").forEach(el => el.remove());
  nodeDivs = [];

  const path     = cachedPath;
  const nodeSize = 70;

  for (let i = 0; i < 10; i++) {
    const levelNum = i + 1;
    const pos      = samplePath(path, levelT[i]);
    const state    = getState(levelNum);
    const stars    = getLevelData(levelNum)?.stars || 0;
    const isLocked = state === "locked";

    const rp1  = samplePath(path, Math.max(0, levelT[i] - 0.02));
    const rp2  = samplePath(path, Math.min(1, levelT[i] + 0.02));
    const rdx  = rp2.x - rp1.x;
    const rdy  = rp2.y - rp1.y;
    const rlen = Math.hypot(rdx, rdy) || 1;
    const perpX = -rdy / rlen;
    const perpY =  rdx / rlen;
    const side  = levelSide[i];
    const offset = 110;

    let nx = Math.round(pos.x + perpX * side * offset);
    let ny = Math.round(pos.y + perpY * side * offset);
    nx = Math.min(Math.max(nx, nodeSize), LW - nodeSize);
    ny = Math.min(Math.max(ny, nodeSize), LH - nodeSize);

    const node = document.createElement("div");
    node.className = `lnode ${state} ${getNodeType(levelNum)}`;
    node.id        = `node-${levelNum}`;
    node.style.left = nx + "px";
    node.style.top  = ny + "px";

    node.innerHTML = `
      <div class="cube-scene">
        <div class="cube3d ${state}">
          <div class="cube-face front">${isLocked ? "?" : "Lv " + levelNum}</div>
          <div class="cube-face back">${isLocked ? "?" : "Lv " + levelNum}</div>
          <div class="cube-face right">${isLocked ? "?" : "Lv " + levelNum}</div>
          <div class="cube-face left">${isLocked ? "?" : "Lv " + levelNum}</div>
          <div class="cube-face top">${isLocked ? "?" : "Lv " + levelNum}</div>
          <div class="cube-face bottom">${isLocked ? "?" : "Lv " + levelNum}</div>
        </div>
      </div>
      ${!isLocked && stars > 0 ? `<div class="node-stars">${"⭐".repeat(stars)}</div>` : ""}
    `;

    const cube = node.querySelector(".cube3d");
    cube.style.setProperty("--lift", `${6 + Math.random() * 6}px`);
    cube.style.animationDelay    = `${Math.random() * 3}s`;
    cube.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;

    const palettes = [
      ["#ffdaa9ff","#F39B74","#FFE3D1","#ffa681ff"],
      ["#FFD67A","#fff461ff","#FFF0B8","#D7962F"],
      ["#BEE7B8","#7CCB84","#E2F9DE","#69c054ff"],
      ["#FFC0CB","#F294A8","#FFE2EA","#E07D95"],
      ["#BFE1FF","#78BFFF","#E4F3FF","#5CA7EA"],
      ["#E3C7FF","#C59AF2","#F3E8FF","#AF84E2"]
    ];

    if (state !== "locked" && state !== "current") {
      const p = palettes[Math.floor(Math.random() * palettes.length)];
      cube.style.setProperty("--front", p[1]);
      cube.style.setProperty("--side",  p[2]);
      cube.style.setProperty("--side2", p[3]);
      cube.style.setProperty("--top",   p[0]);
    }

    if (!isLocked) {
      node.addEventListener("click", () => {
        playSound("tile", 1);

        if (i === currentCarIdx) {
          saveCarLevel(levelNum);
          window.location.href = `worldLevels.html?level=${levelNum}`;
          return;
        }

        driveCarToLevel(i, () => {
          currentCarIdx = i;
          saveCarLevel(levelNum);
          setTimeout(() => {
            window.location.href = `worldLevels.html?level=${levelNum}`;
          }, 300);
        });
      });
    }

    // road dot
    const marker = document.createElement("div");
    marker.className  = "road-marker";
    marker.style.left = pos.x + "px";
    marker.style.top  = pos.y + "px";
    scaleWrap.appendChild(marker);

    // connector line
    const line   = document.createElement("div");
    line.className    = "node-link";
    const dist        = Math.hypot(nx - pos.x, ny - pos.y);
    const angle       = Math.atan2(ny - pos.y, nx - pos.x) * 180 / Math.PI;
    line.style.left      = pos.x + "px";
    line.style.top       = pos.y + "px";
    line.style.width     = dist + "px";
    line.style.transform = `rotate(${angle}deg)`;
    scaleWrap.appendChild(line);

    scaleWrap.appendChild(node);
    nodeDivs.push(node);
  }
}

/* ═══════════════════════════════════════════════
   DECOR
═══════════════════════════════════════════════ */
function placeDecorations() {
  decorLayer.innerHTML = "";
  const items = ["🌳","🌲","🪨","🌿","🍀","⭐"];
  const pts   = waypoints;

  for (let i = 1; i < pts.length - 1; i += 2) {
    const p  = pts[i];
    const el = document.createElement("div");
    el.className   = "decor mid";
    const side     = i % 4 < 2 ? 1 : -1;
    el.style.left  = (p.x + side * 80) + "px";
    el.style.top   = p.y + "px";
    el.textContent = items[Math.floor(Math.random() * items.length)];
    decorLayer.appendChild(el);
  }
}

/* ═══════════════════════════════════════════════
   BACKGROUND
═══════════════════════════════════════════════ */
let bgAnimId      = null;
const bgParticles = [];

function buildBg() {
  bgLayer.innerHTML = "";
  bgParticles.length = 0;
  cancelAnimationFrame(bgAnimId);

  const cvs = document.createElement("canvas");
  cvs.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
  cvs.width  = window.innerWidth;
  cvs.height = window.innerHeight;
  bgLayer.appendChild(cvs);
  const ctx2 = cvs.getContext("2d");

  const equations = [
    "2+3=5","8-4=4","3×4=12","9÷3=3",
    "5+7=12","6×7=42","4²=16","√9=3",
    "½×10=5","7+8=15","9×9=81","2³=8",
    "√16=4","5²=25","3³=27","√25=5",
    "18-9=9","4×6=24","7×3=21","20÷4=5",
  ];

  const colors = [
    "rgba(255,140,80,0.4)","rgba(255,100,100,0.35)",
    "rgba(180,140,220,0.4)","rgba(100,180,140,0.4)",
    "rgba(249,199,79,0.45)","rgba(120,191,255,0.4)",
    "rgba(255,180,120,0.4)","rgba(140,210,160,0.4)",
  ];

  const VW = cvs.width;
  const VH = cvs.height;

  // Reduced from 22 → 12 particles
  for (let i = 0; i < 12; i++) {
    const size  = 12 + Math.random() * 9;
    const text  = equations[Math.floor(Math.random() * equations.length)];
    ctx2.font   = `${size}px 'Fredoka One', cursive`;
    const w     = ctx2.measureText(text).width;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.12 + Math.random() * 0.1;

    bgParticles.push({
      text,
      color: colors[Math.floor(Math.random() * colors.length)],
      size, x: Math.random() * (VW - w),
      y: Math.random() * (VH - size),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w, h: size,
    });
  }

  function tick() {
    ctx2.clearRect(0, 0, VW, VH);

    for (const a of bgParticles) {
      a.x += a.vx;
      a.y += a.vy;

      // simple wall bounce — no O(n²) collision
      if (a.x < 0)        { a.x = 0;        a.vx =  Math.abs(a.vx); }
      if (a.x + a.w > VW) { a.x = VW - a.w; a.vx = -Math.abs(a.vx); }
      if (a.y < 0)        { a.y = 0;        a.vy =  Math.abs(a.vy); }
      if (a.y + a.h > VH) { a.y = VH - a.h; a.vy = -Math.abs(a.vy); }

      ctx2.font         = `${a.size}px 'Fredoka One', cursive`;
      ctx2.fillStyle    = a.color;
      ctx2.textBaseline = "top";
      ctx2.fillText(a.text, a.x, a.y);
    }

    bgAnimId = requestAnimationFrame(tick);
  }

  tick();
}

/* ═══════════════════════════════════════════════
   SCROLL TO PLAYER
═══════════════════════════════════════════════ */
function scrollToPlayer() {
  const level = getCurrentLevel();
  const node  = document.getElementById(`node-${level}`);
  if (!node) return;

  const nodeTopScaled = (parseFloat(node.style.top) || 0) * scale;
  const targetScroll  = cachedMapTop + nodeTopScaled - (window.innerHeight / 2);
  window.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
let cameraStarted = false;

function init() {
  nodeDivs.forEach(n => n.remove());
  nodeDivs = [];

  const dpr = window.devicePixelRatio || 1;

  cW    = Math.min(window.innerWidth, 900);
  scale = cW / LW;
  cH    = Math.max(LH * scale, window.innerHeight * 2.5);

  mapWrap.style.width  = cW + "px";
  mapWrap.style.height = cH + "px";

  scaleWrap.style.width           = LW + "px";
  scaleWrap.style.height          = LH + "px";
  scaleWrap.style.transform       = `scale(${scale})`;
  scaleWrap.style.transformOrigin = "top left";
  scaleWrap.style.position        = "absolute";
  scaleWrap.style.top             = "0";
  scaleWrap.style.left            = "0";

  canvas.width        = Math.round(cW * dpr);
  canvas.height       = Math.round(cH * dpr);
  canvas.style.width  = cW + "px";
  canvas.style.height = cH + "px";

  roadSvgLayer.style.height = cH + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Build cached path & mapTop once per init
  cachedPath   = buildCatmullSegs(waypoints);
  cachedMapTop = mapWrap.getBoundingClientRect().top + window.scrollY;

  drawRoad();

  const savedLevel = loadCarLevel();
  currentCarIdx    = Math.max(0, savedLevel - 1);
  placeCarAtLevel(currentCarIdx);

  // Start camera loop only once — it runs forever
  if (!cameraStarted) {
    cameraStarted = true;
    startCameraLoop();
  }

  placeDecorations();
  placeNodes();
}

/* ═══════════════════════════════════════════════
   START
═══════════════════════════════════════════════ */
const findBtn = document.getElementById("findLevelBtn");
if (findBtn) findBtn.addEventListener("click", scrollToPlayer);

window.addEventListener("resize", () => {
  cancelAnimationFrame(bgAnimId);
  buildBg();
  init();
  // Refresh mapTop after layout settles
  requestAnimationFrame(() => {
    cachedMapTop = mapWrap.getBoundingClientRect().top + window.scrollY;
  });
});

buildBg();
init();
updateHudTotals();