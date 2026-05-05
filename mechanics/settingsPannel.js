const TEMPLATE = document.createElement("template");
TEMPLATE.innerHTML = `
<style>
  :host {
    display: flex;
    font-family: 'Nunito', sans-serif;
    align-items: center;
    justify-content: center;
  }

  /* ── gear button ───────────────── */
  .gear-btn {
    background: rgba(255,255,255,0.3);
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 14px;
    width: 44px; height: 44px;
    font-size: 1.3rem;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .gear-btn:hover { transform: scale(1.1) rotate(10deg); }
  .gear-btn:active { transform: scale(0.95); }

  /* ── backdrop ───────────────── */
  .backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(40, 20, 10, 0.4);
    backdrop-filter: blur(6px);
    z-index: 9999;
    align-items: flex-end;
    justify-content: center;
  }
  .backdrop.open {
    display: flex;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ── card ───────────────── */
  .card {
    width: 100%;
    max-width: 480px;
    border-radius: 26px 26px 0 0;
    background: linear-gradient(180deg, #fff8f2, #fff1e6);
    box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
    overflow: hidden;
    animation: bounceUp 0.45s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes bounceUp {
    0% { transform: translateY(100%); }
    70% { transform: translateY(-8px); }
    100% { transform: translateY(0); }
  }

  /* ── header ───────────────── */
  .card-header {
    display: flex;
    align-items: center;
    padding: 18px 20px;
  }

  .card-title {
    font-family: 'Fredoka', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #3a2a1a;
    flex: 1;
  }

  .close-btn {
    border: none;
    background: #ffe4cc;
    width: 34px; height: 34px;
    border-radius: 50%;
    cursor: pointer;
    font-weight: bold;
    transition: 0.2s;
  }
  .close-btn:hover {
    transform: rotate(90deg);
    background: #ffd3aa;
  }

  /* ── section title ───────────────── */
  .section-title {
    font-size: 0.75rem;
    font-weight: 800;
    color: #c89a6a;
    padding: 10px 20px 4px;
  }

  /* ── rows ───────────────── */
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    transition: background 0.2s;
    text-decoration: none;
    color: inherit;
  }

  .row:hover {
    background: #fff3e6;
  }

  .row-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .row-icon {
    width: 40px;
    height: 40px;
    background: #fff0dc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    transition: transform 0.2s;
  }

  .row:hover .row-icon {
    transform: scale(1.15) rotate(-5deg);
  }

  .row-label {
    font-weight: 800;
    font-size: 0.95rem;
  }

  .row-sub {
    font-size: 0.75rem;
    color: #9a7a5a;
  }

  /* ── toggle ───────────────── */
  .toggle {
    position: relative;
    width: 52px;
    height: 28px;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .track {
    background: #ddd;
    border-radius: 20px;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: 0.25s;
  }

  input:checked + .track {
    background: #6fd6c2;
  }

  input:checked + .track .knob {
    transform: translateX(24px);
  }

  /* ── rulebook highlight ───────────────── */
  .rules {
    background: #fff3e6;
    border-radius: 14px;
    margin: 6px 12px;
  }

  .nav-arrow {
    font-size: 1.4rem;
    color: #ffb86b;
  }

  /* ── credits ───────────────── */
  .credits {
    margin: 12px;
    padding: 14px;
    border-radius: 16px;
    background: #fff6ec;
    border: 1px solid #f2d5b5;
  }

  .credits p {
    margin: 4px 0;
    font-size: 0.8rem;
  }

</style>

<button class="gear-btn">⚙️</button>

<div class="backdrop">
  <div class="card">

    <div class="card-header">
      <div class="card-title">Settings</div>
      <button class="close-btn">✕</button>
    </div>

    <div class="section-title">🎧 AUDIO</div>

    <div class="row">
      <div class="row-left">
        <div class="row-icon">🎵</div>
        <div>
          <div class="row-label">Music</div>
          <div class="row-sub">Background music</div>
        </div>
      </div>
      <label class="toggle">
        <input type="checkbox" class="music-input" checked>
        <div class="track"><div class="knob"></div></div>
      </label>
    </div>

    <div class="row">
      <div class="row-left">
        <div class="row-icon">🔊</div>
        <div>
          <div class="row-label">SFX</div>
          <div class="row-sub">Clicks & feedback</div>
        </div>
      </div>
      <label class="toggle">
        <input type="checkbox" class="sfx-input" checked>
        <div class="track"><div class="knob"></div></div>
      </label>
    </div>

    <div class="section-title">📘 HELP</div>

    <a class="row rules" href="rules.html">
      <div class="row-left">
        <div class="row-icon">📖</div>
        <div>
          <div class="row-label">Rule Book</div>
          <div class="row-sub">How to play</div>
        </div>
      </div>
      <div class="nav-arrow">›</div>
    </a>

    <div class="credits">
      <p><strong>Math Tower</strong></p>
      <p>Made by Amit</p>
      <p>v1.0.0 ❤️</p>
    </div>

  </div>
</div>
`;

class SettingsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    const gear = this.shadowRoot.querySelector(".gear-btn");
    const close = this.shadowRoot.querySelector(".close-btn");
    const backdrop = this.shadowRoot.querySelector(".backdrop");

    gear.onclick = () => backdrop.classList.add("open");
    close.onclick = () => backdrop.classList.remove("open");

    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.classList.remove("open");
    };
  }
}

customElements.define("settings-panel", SettingsPanel);