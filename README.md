# 🚗🧩 Math Tower — Tile Logic Game

> *Place the tiles · Solve the puzzle · Drive forward!*

A **browser-based math puzzle game** where players drag and place numbered tiles into shared equation slots to solve increasingly complex cross-grid challenges.

🎯 Built with **vanilla JavaScript (no frameworks)**
🎨 Designed with a **warm pastel, kid-friendly aesthetic**
⚡ Focused on **smooth gameplay, progression, and feedback**

---

## 🎮 Game Overview

```
index.html  →  map.html  →  worldLevels.html
 Tutorial       World Map     Puzzle Levels
```

### 🧠 Core Idea

Solve math puzzles by placing tiles correctly — but here’s the twist:

> 🧩 **One tile can affect multiple equations at once**

---

## 🕹️ How to Play

### ✨ Basic Actions

* Select a tile from the tray
* Place it into a slot (`A`, `B`, `C`…)
* Click again to remove it
* Hit **Check** to validate all equations

### ⚠️ The Twist

Slots are **shared across equations**.

A single tile must satisfy:

* ➕ Horizontal equation
* ✖️ Vertical equation

At the same time.

---

## 🎯 Game Progression

### 🚦 1. Tutorial (5 Levels)

Learn step-by-step:

| Level | Concept          |
| ----- | ---------------- |
| 1     | Addition         |
| 2     | Subtraction      |
| 3     | Multiplication   |
| 4     | Division         |
| 5     | Mixed operations |

🚗 A car moves forward as you complete each level.

---
![Tutorial Level](https://github.com/AmitTamas/mathsTilesv1/blob/773f6757d83a46e94335ee458cbb4f85e2ea74a8/Screenshot%20From%202026-05-05%2015-24-22.png)
### 🗺️ 2. World Map

* Animated **driving car**
* **3D floating level nodes**
* Smooth camera movement
* Locked → Current → Completed progression

Special nodes:

* 🔒 Locked
* ⭐ Current
* ✅ Completed
* 🏆 Boss
* 📦 Reward
* 🥇 Challenge
* ⏱️ Timed

---
![Map Page](https://github.com/AmitTamas/mathsTilesv1/blob/773f6757d83a46e94335ee458cbb4f85e2ea74a8/Screenshot%20From%202026-05-05%2015-23-06.png)
### 🧩 3. Puzzle Levels (Main Game)

* Cross-grid equations
* Increasing complexity
* Timer + lives system
* Star-based scoring

![Main Game Window](https://github.com/AmitTamas/mathsTilesv1/blob/773f6757d83a46e94335ee458cbb4f85e2ea74a8/Screenshot%20From%202026-05-05%2015-23-20.png)
![Pause screen](https://github.com/AmitTamas/mathsTilesv1/blob/773f6757d83a46e94335ee458cbb4f85e2ea74a8/Screenshot%20From%202026-05-05%2015-24-08.png)
![Settings pannel](https://github.com/AmitTamas/mathsTilesv1/blob/773f6757d83a46e94335ee458cbb4f85e2ea74a8/Screenshot%20From%202026-05-05%2015-24-22.png)

---

## ⭐ Scoring System

### 🌟 Stars

| Stars | Condition   |
| ----- | ----------- |
| ⭐⭐⭐   | Fast solve  |
| ⭐⭐    | Medium time |
| ⭐     | Completed   |

---

### 🧮 Score Formula

```
Score = 500 + max(0, 300 − time × 5) + stars × 100
```

---

### ❤️ Lives

* Start with **3 lives**
* Wrong answer = lose 1 life
* Lose all → level resets

---

## 🗺️ World Features

* 🚗 Animated car movement
* 🎥 Camera follow system
* 🧊 3D cube level nodes
* ⭐ Star display on nodes
* 📊 HUD (score + stars)
* 🔍 “Find My Level” button
* ✨ Floating math visuals

---

## 🔊 Audio System

| Event             | Sound          |
| ----------------- | -------------- |
| UI click          | Click          |
| Tile place/remove | Tile sound     |
| Correct answer    | Success / wow  |
| Wrong answer      | Error pop      |
| Hint              | Bell           |
| Car movement      | Engine + drift |
| Unlock            | Fanfare        |

🎧 Background music smoothly fades between screens.

---

## 🏗️ Project Structure

```
/
├── index.html
├── map.html
├── worldLevels.html
├── levelDesigner.html (dev tool)
│
├── mechanics/
│   ├── script.js
│   ├── map.js
│   ├── worldLevels.js
│   ├── gridRenderer.js
│   ├── gridLevelData.js
│   ├── levels.js
│   ├── progression.js
│   ├── audio.js
│   ├── effects.js
│   └── settingsPannel.js
│
├── design/
│   ├── style.css
│   ├── worldLevels.css
│   ├── map.css
│   ├── cube.css
│   └── settongPannel.css
│
└── assets/
    ├── sounds/
    └── level/
```

---

## 💾 Save System

All progress is stored locally using:

👉 `localStorage` (`mathTowerSave`)

Includes:

* Level progress
* Stars & scores
* Best times
* Tutorial completion
* Map position

⚡ No login required — fully offline capable

---

## 🚀 Run Locally

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

npx serve .
# OR
python -m http.server 8080
```

Open:

```
http://localhost:8080
```

> ⚠️ Must run on HTTP (modules won’t load via file://)

---

## 🌐 Browser Support

| Browser       | Status |
| ------------- | ------ |
| Chrome / Edge | ✅      |
| Firefox       | ✅      |
| Safari        | ✅      |
| Mobile        | ✅      |

---

## 🛠️ Tech Stack

* Vanilla JavaScript (ES Modules)
* HTML5 + Canvas
* CSS3 (animations + 3D transforms)
* Web Audio API
* localStorage

🚫 No frameworks
🚫 No build tools
🚫 No dependencies

---

## 🎨 Design Philosophy

* 🎨 Soft pastel colors (kid-friendly)
* 🔤 Rounded playful fonts
* 🧊 3D interactive elements
* ✨ Reward-based feedback (confetti, stars)
* 📱 Fully responsive

---

## 🧪 Developer Notes

* Built entirely from scratch
* Focused on **performance + smooth UX**
* Modular structure for easy expansion (new levels, mechanics)

---

## Special Thanks to

* chat-gpt to make things faster and understand the ideas i has
* claude to make the best optimized code to turn my ideas into playable world

* ---

## 📝 License

MIT — free to use and modify

---

## ❤️ Final Note

> Built using just the web platform — no engines, no frameworks.
> Just ideas, logic, and a lot of iteration.
