jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    setUpdateInterval: jest.fn(),
  },
}));

jest.mock('expo-navigation-bar', () => ({
  setVisibilityAsync: jest.fn(),
  setBehaviorAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native', () => {
  const React = require('react');
  class MockAnimatedValue {
    value: number;
    constructor(val: number) {
      this.value = val;
    }
    setValue(val: number) {
      this.value = val;
    }
    interpolate() {
      return this;
    }
  }

  const createAnim = () => ({
    start: (cb?: (res: { finished: boolean }) => void) => cb?.({ finished: true }),
    stop: jest.fn(),
  });

  return {
    View: (props: any) => React.createElement('div', props),
    Text: (props: any) => React.createElement('span', props),
    TouchableOpacity: (props: any) => React.createElement('button', props),
    StyleSheet: {
      create: (styles: any) => styles,
      absoluteFill: {},
    },
    Platform: {
      select: (obj: any) => obj.ios || obj.android || {},
    },
    Dimensions: {
      get: () => ({ width: 390, height: 844 }),
    },
    Easing: {
      linear: jest.fn(),
      sin: jest.fn(),
      cubic: jest.fn(),
      out: (fn: any) => fn,
      inOut: (fn: any) => fn,
      back: () => jest.fn(),
    },
    Animated: {
      Value: MockAnimatedValue,
      View: (props: any) => React.createElement('div', props),
      spring: jest.fn(() => createAnim()),
      timing: jest.fn(() => createAnim()),
      parallel: jest.fn(() => createAnim()),
      sequence: jest.fn(() => createAnim()),
      loop: jest.fn(() => createAnim()),
      add: jest.fn((a) => a),
      multiply: jest.fn((a) => a),
    },
  };
});
