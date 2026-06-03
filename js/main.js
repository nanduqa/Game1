import {
  clamp,
  createRampState,
  createSpringState,
  createPendulumState,
  createBuoyancyState,
  createFrictionState,
  stepRamp,
  stepSpring,
  stepPendulum,
  stepBuoyancy,
  stepFriction,
  starsFromError,
} from './physics.js';
import { LEVELS } from './levels.js';
import { UI } from './ui.js';
import { ParticleSystem } from './particles.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const particles = new ParticleSystem();

const game = {
  running: false,
  levelIndex: 0,
  activityIndex: 0,
  score: 0,
  stars: [],
  values: {},
  sim: null,
  local: { completed: false, message: '', feedbackClass: '', prediction: null },
  elapsed: 0,
  skyTime: 0,
};

const ui = new UI({
  onStart: () => startGame(),
  onRestart: () => restartGame(),
  onControlChange: (key, val) => {
    game.values[key] = val;
    resetSimulation();
    renderUI();
  },
  onPredict: (idx) => {
    game.local.prediction = idx;
    renderUI();
  },
  onCheck: () => checkActivity(),
  onReset: () => {
    resetSimulation();
    game.local = { completed: false, message: '', feedbackClass: '', prediction: null };
    renderUI();
  },
  onNext: () => nextActivity(),
});

function getLevel() {
  return LEVELS[game.levelIndex];
}

function getActivity() {
  return getLevel().activities[game.activityIndex];
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function startGame() {
  game.running = true;
  game.levelIndex = 0;
  game.activityIndex = 0;
  game.score = 0;
  game.stars = [];
  loadActivity();
  ui.showGame();
}

function restartGame() {
  document.getElementById('startScreen').classList.remove('hidden');
  document.getElementById('completionScreen').classList.add('hidden');
  game.running = false;
}

function loadActivity() {
  const level = getLevel();
  game.values = deepCopy(level.defaults);
  game.elapsed = 0;
  game.local = { completed: false, message: '', feedbackClass: '', prediction: null };
  resetSimulation();
  renderUI();
}

function resetSimulation() {
  const level = getLevel();
  const values = game.values;
  if (level.key === 'ramp') game.sim = createRampState(values);
  if (level.key === 'spring') game.sim = createSpringState(values);
  if (level.key === 'pendulum') game.sim = createPendulumState(values);
  if (level.key === 'buoyancy') game.sim = createBuoyancyState(values);
  if (level.key === 'friction') game.sim = createFrictionState(values);
}

function renderUI() {
  ui.updateHud(getLevel(), game.activityIndex, game.score);
  ui.renderActivity(getActivity(), game.values, game.local);
}

function gradeTarget(actual, target) {
  const denom = Math.max(Math.abs(target), 1);
  const err = Math.abs(actual - target) / denom;
  return { err, stars: starsFromError(err) };
}

function checkActivity() {
  const activity = getActivity();

  if (activity.type === 'predict') {
    if (game.local.prediction == null) {
      game.local.message = 'Pick an option first.';
      game.local.feedbackClass = 'fail';
      renderUI();
      return;
    }
    const correct = game.local.prediction === activity.correct;
    const stars = correct ? 3 : 1;
    finishCheck(correct, stars, correct ? 'Correct prediction! 🎯' : 'Nice try — review the concept and continue.');
    return;
  }

  const { actual, target } = activity.evaluator(game.values, game.sim);
  const { err, stars } = gradeTarget(actual, target);
  const success = stars > 0;
  const message = success
    ? `Great! value=${actual.toFixed(2)} target=${target.toFixed(2)} (${stars}⭐)`
    : `Not yet. value=${actual.toFixed(2)} target=${target.toFixed(2)}. Keep tuning.`;
  finishCheck(success, stars, message, err);
}

function finishCheck(success, stars, message) {
  game.local.message = message;
  game.local.feedbackClass = success ? 'success' : 'fail';
  if (!success) {
    renderUI();
    return;
  }

  game.local.completed = true;
  const levelSlot = game.levelIndex * 5 + game.activityIndex;
  if (!game.stars[levelSlot]) {
    game.stars[levelSlot] = stars;
    game.score += stars * 100;
  }

  const rect = canvas.getBoundingClientRect();
  particles.burst(rect.width * 0.78, rect.height * 0.26, getLevel().color, 52);
  renderUI();
}

function nextActivity() {
  if (!game.local.completed) return;
  if (game.activityIndex < 4) {
    game.activityIndex += 1;
    loadActivity();
    return;
  }

  if (game.levelIndex < LEVELS.length - 1) {
    game.levelIndex += 1;
    game.activityIndex = 0;
    loadActivity();
    return;
  }

  const totalStars = game.stars.reduce((a, b) => a + b, 0);
  ui.showCompletion(game.score, totalStars);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function update(dt) {
  if (!game.running) {
    particles.update(dt);
    return;
  }

  game.elapsed += dt;
  const levelKey = getLevel().key;
  if (levelKey === 'ramp') stepRamp(game.sim, dt);
  if (levelKey === 'spring') stepSpring(game.sim, dt);
  if (levelKey === 'pendulum') stepPendulum(game.sim, dt);
  if (levelKey === 'buoyancy') stepBuoyancy(game.sim, dt);
  if (levelKey === 'friction') stepFriction(game.sim, dt);

  if (game.elapsed > 6) {
    resetSimulation();
    game.elapsed = 0;
  }

  particles.update(dt);
  game.skyTime += dt;
}

function drawBackground(w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#261d6b');
  g.addColorStop(0.5, '#203a9c');
  g.addColorStop(1, '#112138');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 52; i += 1) {
    const x = ((i * 233) % (w + 200)) - 100 + Math.sin(game.skyTime * 0.2 + i) * 18;
    const y = ((i * 137) % h) * 0.7;
    const r = 1 + ((i * 17) % 3);
    ctx.fillStyle = `rgba(255,255,255,${0.18 + ((i * 19) % 40) / 220})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRamp(w, h) {
  const baseX = w * 0.16;
  const baseY = h * 0.82;
  const len = w * 0.54;
  const angle = (game.values.angle * Math.PI) / 180;
  const topX = baseX + len * Math.cos(angle);
  const topY = baseY - len * Math.sin(angle);

  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(126,220,255,0.85)';
  ctx.shadowColor = 'rgba(77, 213, 255, 0.5)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(topX, topY);
  ctx.stroke();

  const u = clamp(game.sim.s / (len * 0.8), 0, 1);
  const bx = baseX + (topX - baseX) * u;
  const by = baseY + (topY - baseY) * u;
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#7ce7ff';
  ctx.beginPath();
  ctx.arc(bx, by, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpring(w, h) {
  const anchorX = w * 0.5;
  const anchorY = h * 0.22;
  const stretch = game.sim.x * 90;
  const bobY = anchorY + 190 + stretch;
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#ffc9f4';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  for (let i = 1; i <= 10; i += 1) {
    const t = i / 10;
    const x = anchorX + (i % 2 === 0 ? -22 : 22);
    const y = anchorY + t * (bobY - anchorY);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(anchorX, bobY);
  ctx.stroke();

  ctx.shadowColor = 'rgba(255, 125, 218, 0.6)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#ff9de7';
  ctx.beginPath();
  ctx.arc(anchorX, bobY + 35, 33, 0, Math.PI * 2);
  ctx.fill();
}

function drawPendulum(w, h) {
  const pivotX = w * 0.5;
  const pivotY = h * 0.2;
  const len = game.values.length * 120;
  const x = pivotX + Math.sin(game.sim.theta) * len;
  const y = pivotY + Math.cos(game.sim.theta) * len;

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffd483';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.shadowColor = 'rgba(255, 208, 130, 0.55)';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#fbc96d';
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuoyancy(w, h) {
  const waterY = h * 0.58;
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(72, 196, 255, 0.3)';
  ctx.fillRect(0, waterY, w, h - waterY);

  ctx.strokeStyle = 'rgba(166, 242, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, waterY + Math.sin(game.skyTime * 2) * 4);
  for (let x = 0; x <= w; x += 24) {
    ctx.lineTo(x, waterY + Math.sin(game.skyTime * 2 + x * 0.02) * 6);
  }
  ctx.stroke();

  const blockY = waterY - game.sim.y * 120;
  ctx.shadowColor = 'rgba(105, 255, 228, 0.55)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#69ffe4';
  ctx.fillRect(w * 0.46, blockY, 110, 82);
}

function drawFriction(w, h) {
  const groundY = h * 0.72;
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, groundY, w, h - groundY);

  const x = w * 0.2 + game.sim.x * 35;
  ctx.shadowColor = 'rgba(255, 168, 138, 0.7)';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#ffa88a';
  ctx.fillRect(x, groundY - 72, 120, 72);
}

function drawOverlayText(w) {
  const level = getLevel();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '700 30px Fredoka, sans-serif';
  ctx.fillText(level.prop, 24, 56);
  ctx.fillStyle = level.color;
  ctx.font = '600 20px Inter, sans-serif';
  ctx.fillText(level.concept, 24, 84);
}

function draw() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  drawBackground(w, h);

  if (game.running) {
    const key = getLevel().key;
    if (key === 'ramp') drawRamp(w, h);
    if (key === 'spring') drawSpring(w, h);
    if (key === 'pendulum') drawPendulum(w, h);
    if (key === 'buoyancy') drawBuoyancy(w, h);
    if (key === 'friction') drawFriction(w, h);
    drawOverlayText(w);
  }

  particles.draw(ctx);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(loop);
