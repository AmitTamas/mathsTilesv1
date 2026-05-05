const KEY = "mathTowerSave";
const TOTAL_LEVELS = 10;

function makeDefault() {
  const arr = [];

  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    arr.push({
      id: i,
      status: i === 1 ? "current" : "locked",
      stars: 0,
      score: 0,
      bestTime: null
    });
  }

  return arr;
}

function load() {
  const raw = localStorage.getItem(KEY);

  if (!raw) {
    const fresh = makeDefault();
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }

  return JSON.parse(raw);
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export let worldLevels = load();

export function refreshProgress() {
  worldLevels = load();
}

export function completeLevel(levelId, stars, score = 0, bestTime = null) {
  const data = load();

  const level = data.find(l => l.id === levelId);
  if (!level) return;

  level.status = "done";
  level.stars = Math.max(level.stars, stars);
  level.score = Math.max(level.score, score);

  if (bestTime !== null) {
    level.bestTime =
      level.bestTime === null
        ? bestTime
        : Math.min(level.bestTime, bestTime);
  }

  const next = data.find(l => l.id === levelId + 1);

  if (next && next.status === "locked") {
    next.status = "current";
  }

  save(data);
  worldLevels = data;
}

export function getTotalStars() {
  return load().reduce((sum, lvl) => sum + lvl.stars, 0);
}

export function getTotalScore() {
  return load().reduce((sum, lvl) => sum + lvl.score, 0);
}

export function getCompletedLevels() {
  return load().filter(l => l.status === "done").length;
}

export function resetProgress() {
  const fresh = makeDefault();
  save(fresh);
  worldLevels = fresh;
}