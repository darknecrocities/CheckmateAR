export const motion = {
  spring: {
    interactive: {
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    },
    pressIn: {
      damping: 20,
      stiffness: 340,
      mass: 0.6,
    },
    pressOut: {
      damping: 13,
      stiffness: 220,
      mass: 0.7,
    },
    bouncy: {
      damping: 12,
      stiffness: 260,
      mass: 0.65,
    },
    tabSlide: {
      damping: 22,
      stiffness: 260,
      mass: 0.8,
    },
    entrance: {
      damping: 18,
      stiffness: 190,
      mass: 0.85,
    },
    mascotLeap: {
      damping: 10,
      stiffness: 280,
      mass: 0.6,
    },
    gentle: {
      damping: 24,
      stiffness: 180,
      mass: 1.0,
    },
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    pulse: 1400,
    floatCycle: 2600,
  },
};
