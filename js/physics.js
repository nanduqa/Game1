export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function createRampState(values) {
  return { s: 0, v: 0, t: 0, values: { ...values } };
}

export function stepRamp(state, dt) {
  state.t += dt;
  const { gravity, angle, friction } = state.values;
  const theta = (angle * Math.PI) / 180;
  const a = gravity * Math.sin(theta) - friction * gravity * Math.cos(theta);
  state.v += a * dt;
  state.s = Math.max(0, state.s + state.v * dt);
  state.acceleration = a;
}

export function createSpringState(values) {
  return { x: values.displacement, v: 0, t: 0, values: { ...values } };
}

export function stepSpring(state, dt) {
  state.t += dt;
  const { mass, stiffness, damping } = state.values;
  const a = (-(stiffness / mass) * state.x) - damping * state.v;
  state.v += a * dt;
  state.x += state.v * dt;
  state.springForce = -stiffness * state.x;
}

export function createPendulumState(values) {
  return { theta: values.angle * (Math.PI / 180), omega: 0, t: 0, values: { ...values } };
}

export function stepPendulum(state, dt) {
  state.t += dt;
  const { gravity, length, damping } = state.values;
  const alpha = -(gravity / length) * Math.sin(state.theta) - damping * state.omega;
  state.omega += alpha * dt;
  state.theta += state.omega * dt;
}

export function createBuoyancyState(values) {
  return { y: values.depth, vy: 0, t: 0, values: { ...values } };
}

export function stepBuoyancy(state, dt) {
  state.t += dt;
  const { fluidDensity, objectDensity, gravity, drag } = state.values;
  const volume = 1;
  const buoyancy = fluidDensity * volume * gravity;
  const weight = objectDensity * volume * gravity;
  const net = weight - buoyancy - drag * state.vy;
  const a = net / Math.max(objectDensity, 0.1);
  state.vy += a * dt;
  state.y += state.vy * dt;
  state.buoyancy = buoyancy;
  state.weight = weight;
}

export function createFrictionState(values) {
  return { x: 0, vx: 0, t: 0, values: { ...values } };
}

export function stepFriction(state, dt) {
  state.t += dt;
  const { force, mass, mu, gravity } = state.values;
  const normal = mass * gravity;
  const maxStatic = mu * normal;
  const applied = force;
  let friction = 0;

  if (Math.abs(state.vx) < 0.01 && Math.abs(applied) < maxStatic) {
    state.vx = 0;
    friction = -applied;
  } else {
    const dir = state.vx !== 0 ? Math.sign(state.vx) : Math.sign(applied);
    friction = -dir * mu * normal;
    const a = (applied + friction) / mass;
    state.vx += a * dt;
  }

  state.x += state.vx * dt;
  state.frictionForce = friction;
  state.normalForce = normal;
}

export function periodicError(actual, target) {
  return Math.abs(actual - target) / Math.max(target, 0.001);
}

export function starsFromError(error) {
  if (error <= 0.05) return 3;
  if (error <= 0.12) return 2;
  if (error <= 0.2) return 1;
  return 0;
}
