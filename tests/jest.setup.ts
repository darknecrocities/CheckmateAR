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

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native', () => {
  const React = require('react');
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
  };
});

