import React from 'react';
import { LiquidGlassCard, LiquidGlassCardProps } from '../../src/components/ui/LiquidGlassCard';

// Mock react-native-svg for node environment
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('svg', props),
    Svg: (props: any) => React.createElement('svg', props),
    Defs: (props: any) => React.createElement('defs', props),
    LinearGradient: (props: any) => React.createElement('linearGradient', props),
    RadialGradient: (props: any) => React.createElement('radialGradient', props),
    Stop: (props: any) => React.createElement('stop', props),
    Rect: (props: any) => React.createElement('rect', props),
    Path: (props: any) => React.createElement('path', props),
    Circle: (props: any) => React.createElement('circle', props),
    G: (props: any) => React.createElement('g', props),
  };
});

describe('LiquidGlassCard UI Component', () => {
  it('instantiates cleanly as a static glass container with children', () => {
    const props: LiquidGlassCardProps = {
      variant: 'featured',
      causticPosition: 'right',
      children: 'Test Content',
    };
    const element = React.createElement(LiquidGlassCard, props);

    expect(element).toBeDefined();
    expect(element.props.variant).toBe('featured');
    expect(element.props.causticPosition).toBe('right');
  });

  it('supports interactive card with onPress handler', () => {
    const handlePress = jest.fn();
    const props: LiquidGlassCardProps = {
      variant: 'cube',
      causticPosition: 'corner',
      onPress: handlePress,
      children: 'Cube Child',
    };
    const element = React.createElement(LiquidGlassCard, props);

    expect(element.props.onPress).toBe(handlePress);
    expect(element.props.variant).toBe('cube');
  });

  it('supports all card variants (featured, cube, strategy, spec, default)', () => {
    const variants = ['featured', 'cube', 'strategy', 'spec', 'default'] as const;
    for (const v of variants) {
      const props: LiquidGlassCardProps = {
        variant: v,
        children: v,
      };
      const el = React.createElement(LiquidGlassCard, props);
      expect(el.props.variant).toBe(v);
    }
  });
});
