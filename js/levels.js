export const LEVELS = [
  {
    key: 'ramp',
    prop: 'Ball on Ramp',
    concept: 'Gravity & Acceleration',
    color: '#7ce7ff',
    defaults: { gravity: 9.8, angle: 35, friction: 0.18 },
    activities: [
      {
        title: 'Tune acceleration',
        instruction: 'Adjust ramp angle so acceleration is close to 4.5 m/s².',
        controls: [{ key: 'angle', label: 'Ramp Angle (°)', min: 10, max: 60, step: 1 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.gravity * Math.sin((v.angle * Math.PI) / 180) - v.friction * v.gravity * Math.cos((v.angle * Math.PI) / 180), target: 4.5 })
      },
      {
        title: 'Low gravity launch',
        instruction: 'Set gravity to make acceleration close to 2.5 m/s².',
        controls: [{ key: 'gravity', label: 'Gravity (m/s²)', min: 2, max: 15, step: 0.1 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.gravity * Math.sin((v.angle * Math.PI) / 180) - v.friction * v.gravity * Math.cos((v.angle * Math.PI) / 180), target: 2.5 })
      },
      {
        title: 'Balance forces',
        instruction: 'Increase friction so the ball nearly stops (target acceleration 0).',
        controls: [{ key: 'friction', label: 'Friction (μ)', min: 0, max: 1, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: Math.abs(v.gravity * Math.sin((v.angle * Math.PI) / 180) - v.friction * v.gravity * Math.cos((v.angle * Math.PI) / 180)), target: 0 })
      },
      {
        title: 'Match distance pattern',
        instruction: 'Tune angle so distance in 2s is close to 10m.',
        controls: [{ key: 'angle', label: 'Ramp Angle (°)', min: 10, max: 60, step: 1 }],
        type: 'target',
        evaluator: (v) => {
          const a = v.gravity * Math.sin((v.angle * Math.PI) / 180) - v.friction * v.gravity * Math.cos((v.angle * Math.PI) / 180);
          return { actual: 0.5 * a * 4, target: 10 };
        }
      },
      {
        title: 'Predict outcome',
        instruction: 'Prediction: if mass doubles on same ramp, what happens to acceleration?',
        type: 'predict',
        options: ['Acceleration doubles', 'Acceleration halves', 'Acceleration stays same'],
        correct: 2
      }
    ]
  },
  {
    key: 'spring',
    prop: 'Spring Orb',
    concept: "Elasticity & Hooke's Law",
    color: '#ff9de7',
    defaults: { mass: 1.4, stiffness: 18, damping: 0.5, displacement: 2 },
    activities: [
      {
        title: 'Match Hooke force',
        instruction: 'Set stiffness so spring force is ~30N at current stretch.',
        controls: [{ key: 'stiffness', label: 'Stiffness k (N/m)', min: 5, max: 45, step: 0.5 }],
        type: 'target',
        evaluator: (v) => ({ actual: Math.abs(v.stiffness * v.displacement), target: 30 })
      },
      {
        title: 'Slow bounce',
        instruction: 'Adjust mass for oscillation period close to 2.2s.',
        controls: [{ key: 'mass', label: 'Mass (kg)', min: 0.4, max: 4, step: 0.1 }],
        type: 'target',
        evaluator: (v) => ({ actual: 2 * Math.PI * Math.sqrt(v.mass / v.stiffness), target: 2.2 })
      },
      {
        title: 'Stabilize spring',
        instruction: 'Increase damping so damping ratio is near critical (≈1).',
        controls: [{ key: 'damping', label: 'Damping c', min: 0, max: 8, step: 0.05 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.damping / (2 * Math.sqrt(v.mass * v.stiffness)), target: 1 })
      },
      {
        title: 'Energy pattern',
        instruction: 'Set displacement so spring energy is around 36J.',
        controls: [{ key: 'displacement', label: 'Displacement x (m)', min: 0.5, max: 3.5, step: 0.05 }],
        type: 'target',
        evaluator: (v) => ({ actual: 0.5 * v.stiffness * v.displacement * v.displacement, target: 36 })
      },
      {
        title: 'Predict oscillation',
        instruction: 'Prediction: if stiffness increases, oscillation frequency…',
        type: 'predict',
        options: ['Increases', 'Decreases', 'Stays unchanged'],
        correct: 0
      }
    ]
  },
  {
    key: 'pendulum',
    prop: 'Pendulum',
    concept: 'Oscillation & Energy',
    color: '#fbc96d',
    defaults: { gravity: 9.8, length: 2, damping: 0.08, angle: 32 },
    activities: [
      {
        title: 'Set period',
        instruction: 'Adjust length to get a period near 2.8s.',
        controls: [{ key: 'length', label: 'Length (m)', min: 0.5, max: 4, step: 0.05 }],
        type: 'target',
        evaluator: (v) => ({ actual: 2 * Math.PI * Math.sqrt(v.length / v.gravity), target: 2.8 })
      },
      {
        title: 'Gravity challenge',
        instruction: 'Adjust gravity to make period close to 1.8s.',
        controls: [{ key: 'gravity', label: 'Gravity (m/s²)', min: 2, max: 20, step: 0.1 }],
        type: 'target',
        evaluator: (v) => ({ actual: 2 * Math.PI * Math.sqrt(v.length / v.gravity), target: 1.8 })
      },
      {
        title: 'Steady swing',
        instruction: 'Tune damping near 0.15 for a smooth balanced oscillation.',
        controls: [{ key: 'damping', label: 'Damping', min: 0, max: 0.6, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.damping, target: 0.15 })
      },
      {
        title: 'Potential energy match',
        instruction: 'Adjust release angle so max potential energy factor ~0.16.',
        controls: [{ key: 'angle', label: 'Release Angle (°)', min: 5, max: 70, step: 1 }],
        type: 'target',
        evaluator: (v) => ({ actual: 1 - Math.cos((v.angle * Math.PI) / 180), target: 0.16 })
      },
      {
        title: 'Predict period change',
        instruction: 'Prediction: doubling length changes period by…',
        type: 'predict',
        options: ['2×', '√2×', 'No change'],
        correct: 1
      }
    ]
  },
  {
    key: 'buoyancy',
    prop: 'Floating Block',
    concept: 'Buoyancy & Density',
    color: '#69ffe4',
    defaults: { fluidDensity: 1, objectDensity: 0.75, gravity: 9.8, drag: 0.35, depth: 0.4 },
    activities: [
      {
        title: 'Neutral float',
        instruction: 'Set object density to be neutrally buoyant in water (ρ=1).',
        controls: [{ key: 'objectDensity', label: 'Object Density', min: 0.2, max: 1.6, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.objectDensity, target: v.fluidDensity })
      },
      {
        title: 'Fluid swap',
        instruction: 'Increase fluid density so buoyant force is near 12N.',
        controls: [{ key: 'fluidDensity', label: 'Fluid Density', min: 0.5, max: 2, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.fluidDensity * v.gravity, target: 12 })
      },
      {
        title: 'Rise slowly',
        instruction: 'Tune drag so rise index is around 0.3.',
        controls: [{ key: 'drag', label: 'Drag', min: 0.05, max: 1.2, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: (v.fluidDensity - v.objectDensity) / (v.drag * 5), target: 0.3 })
      },
      {
        title: 'Submerged ratio',
        instruction: 'Adjust object density so submerged fraction is near 0.6.',
        controls: [{ key: 'objectDensity', label: 'Object Density', min: 0.2, max: 1.6, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.objectDensity / v.fluidDensity, target: 0.6 })
      },
      {
        title: 'Predict float/sink',
        instruction: 'Prediction: object density > fluid density means the object will…',
        type: 'predict',
        options: ['Float higher', 'Stay neutral', 'Sink'],
        correct: 2
      }
    ]
  },
  {
    key: 'friction',
    prop: 'Sliding Block',
    concept: 'Friction & Normal Force',
    color: '#ffa88a',
    defaults: { force: 14, mass: 2.5, mu: 0.35, gravity: 9.8 },
    activities: [
      {
        title: 'Set net acceleration',
        instruction: 'Adjust applied force so acceleration is near 2.0 m/s².',
        controls: [{ key: 'force', label: 'Applied Force (N)', min: 0, max: 40, step: 0.2 }],
        type: 'target',
        evaluator: (v) => ({ actual: Math.max(0, (v.force - v.mu * v.mass * v.gravity) / v.mass), target: 2.0 })
      },
      {
        title: 'High normal force',
        instruction: 'Increase mass so normal force is ~40N.',
        controls: [{ key: 'mass', label: 'Mass (kg)', min: 0.5, max: 8, step: 0.1 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.mass * v.gravity, target: 40 })
      },
      {
        title: 'Near static lock',
        instruction: 'Set friction coefficient so motion almost stops at current force.',
        controls: [{ key: 'mu', label: 'Friction μ', min: 0.05, max: 1.2, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: v.mu * v.mass * v.gravity, target: v.force })
      },
      {
        title: 'Match stopping pattern',
        instruction: 'Tune friction so stopping distance index is ~1.2.',
        controls: [{ key: 'mu', label: 'Friction μ', min: 0.05, max: 1.2, step: 0.01 }],
        type: 'target',
        evaluator: (v) => ({ actual: (v.force / Math.max(v.mu * v.mass * v.gravity, 0.1)) * 0.6, target: 1.2 })
      },
      {
        title: 'Predict friction effect',
        instruction: 'Prediction: if μ increases with same force, block acceleration…',
        type: 'predict',
        options: ['Increases', 'Decreases', 'Unchanged'],
        correct: 1
      }
    ]
  }
];
