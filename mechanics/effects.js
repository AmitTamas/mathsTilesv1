/* ===============================================================
                          Celebration
==================================================================== */
const confettiCanvas = document.getElementById("confettiCanvas");
const confCtx = confettiCanvas.getContext("2d");

let confettiParticles = [];
let confAnimId = null;

const CONF_COLORS = [
  "#ffb347","#f9c74f","#b5d5c5",
  "#ffc8c8","#d9c8f0","#c9e8f5",
  "#ff6b6b","#7fb5a0"
];

export function launchConfetti() {
  if (!confettiCanvas) return;

  cancelAnimationFrame(confAnimId);

  confettiCanvas.width = window.innerWidth;
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

    for (const p of confettiParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      p.vy *= 1.01;
      p.life -= 0.008;

      if (p.life > 0) alive = true;

      confCtx.save();
      confCtx.globalAlpha = Math.max(0, p.life);
      confCtx.translate(p.x, p.y);
      confCtx.rotate((p.rot * Math.PI) / 180);
      confCtx.fillStyle = p.color;
      confCtx.beginPath();
      confCtx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      confCtx.fill();
      confCtx.restore();
    }

    if (alive) {
      confAnimId = requestAnimationFrame(animConf);
    } else {
      confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  animConf();
}

export function burstStars(targetEl) {
  if (!targetEl) return;

  const emojis = ["⭐","✨","🌟","💛"];

  const rect = targetEl.getBoundingClientRect();

  for (let i = 0; i < 6; i++) {
    const el = document.createElement("div");
    el.className = "star-burst";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = (i / 6) * 360;
    const dist  = 70 + Math.random() * 50;
    const rad   = (angle * Math.PI) / 180;

    el.style.setProperty("--dx", Math.cos(rad) * dist + "px");
    el.style.setProperty("--dy", Math.sin(rad) * dist + "px");

    el.style.left = rect.left + rect.width / 2 + "px";
    el.style.top  = rect.top + rect.height / 2 + "px";

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
  }
}
