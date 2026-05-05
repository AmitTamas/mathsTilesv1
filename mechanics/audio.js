const sounds = {
  click: new Audio("../assets/sounds/mouse-click-1.mp3"),
  levelComplete: new Audio("../assets/sounds/mouse-click-1.mp3"),
  unlock: new Audio("../assets/sounds/mouse-click-1.mp3"),
  tile: new Audio("../assets/sounds/button-click-1.mp3"),
  bell: new Audio("../assets/sounds/cam-bell-notification.mp3"),
  celebration1: new Audio("../assets/sounds/medieval-fanfare.mp3"),
  wow: new Audio("../assets/sounds/wow.mp3"),
  error: new Audio("../assets/sounds/error-pop.mp3"),
  carEngine: new Audio("../assets/sounds/car-engine-2.mp3"),
};

export function playSound(name, volume = 1) {
  const s = sounds[name];
  if (!s) return;

  s.volume = volume;
  s.currentTime = 0;
  s.play();
}

// audioManager.js
let bgMusic = null;

export function initBGMusic() {
  if (!bgMusic) {
    bgMusic = new Audio("../assets/sounds/fassounds-good-night-lofi-cozy-chill-music.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0;
  }
}

export function playBGMusic() {
  if (!bgMusic) initBGMusic();
  bgMusic.play().catch(() => {});
}

export function fadeInBG(duration = 4000) {
  if (!bgMusic) return;

  let vol = 0;
  const step = 0.05;
  const interval = duration * step;

  const fade = setInterval(() => {
    vol += step;
    if (vol >= 0.4) {
      bgMusic.volume = 0.4;
      clearInterval(fade);
    } else {
      bgMusic.volume = vol;
    }
  }, interval);
}

export function fadeOutBG(duration = 2000) {
  if (!bgMusic) return;

  let vol = bgMusic.volume;
  const step = 0.05;
  const interval = duration * step;

  const fade = setInterval(() => {
    vol -= step;
    if (vol <= 0) {
      bgMusic.volume = 0;
      bgMusic.pause();
      clearInterval(fade);
    } else {
      bgMusic.volume = vol;
    }
  }, interval);
}