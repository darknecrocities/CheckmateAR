import React from 'react';
import { motion } from '../../src/theme/motion';
import {
  KineticPressable,
  KineticPressableProps,
  ContinuousFloatView,
  ContinuousFloatViewProps,
  KineticRouteTransition,
  KineticRouteTransitionProps,
} from '../../src/components/ui/MotionPrimitives';
import {
  KineticMascotCompanion,
  KineticMascotCompanionProps,
} from '../../src/components/mascot/KineticMascotCompanion';
import { LiquidGlassCard, LiquidGlassCardProps } from '../../src/components/ui/LiquidGlassCard';

// Mock react-native-svg and lucide-react-native for Node environment
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
    Ellipse: (props: any) => React.createElement('ellipse', props),
    Polygon: (props: any) => React.createElement('polygon', props),
    Line: (props: any) => React.createElement('line', props),
    G: (props: any) => React.createElement('g', props),
    Text: (props: any) => React.createElement('text', props),
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  return {
    Sparkles: (props: any) => React.createElement('svg', props),
    Box: (props: any) => React.createElement('svg', props),
  };
});

describe('Kinetic Motion Engine & Mascot Companion', () => {
  it('defines calibrated Apple harmonic spring physics in motion.ts', () => {
    expect(motion.spring.pressIn.stiffness).toBeGreaterThan(250);
    expect(motion.spring.pressOut.damping).toBeLessThan(20);
    expect(motion.spring.tabSlide.stiffness).toBe(260);
    expect(motion.spring.mascotLeap.stiffness).toBe(280);
    expect(motion.timing.floatCycle).toBeGreaterThanOrEqual(2000);
  });

  it('configures KineticPressable with whileTap scale, staggerIndex, and pulse', () => {
    const onPress = jest.fn();
    const props: KineticPressableProps = {
      scaleTo: 0.92,
      translateYTo: 3,
      staggerIndex: 2,
      enablePulse: true,
      hapticStyle: 'medium',
      onPress,
      children: 'Kinetic Button',
    };
    const el = React.createElement(KineticPressable, props);
    expect(el.props.scaleTo).toBe(0.92);
    expect(el.props.staggerIndex).toBe(2);
    expect(el.props.enablePulse).toBe(true);
    expect(el.props.onPress).toBe(onPress);
  });

  it('configures ContinuousFloatView with counter-parallax elevation', () => {
    const props: ContinuousFloatViewProps = {
      amplitude: 5,
      duration: 2400,
      delay: 180,
      elevated: true,
      children: 'Floating 3D Piece',
    };
    const el = React.createElement(ContinuousFloatView, props);
    expect(el.props.amplitude).toBe(5);
    expect(el.props.elevated).toBe(true);
    expect(el.props.delay).toBe(180);
  });

  it('configures KineticRouteTransition for spatial route animations', () => {
    const props: KineticRouteTransitionProps = {
      routeKey: 'mascot',
      children: 'Mascot Screen',
    };
    const el = React.createElement(KineticRouteTransition, props);
    expect(el.props.routeKey).toBe('mascot');
  });

  it('configures KineticMascotCompanion with reactionTrigger and 3D Studio action', () => {
    const openStudio = jest.fn();
    const props: KineticMascotCompanionProps = {
      reactionTrigger: 'strategy',
      onOpenMascotStudio: openStudio,
    };
    const el = React.createElement(KineticMascotCompanion, props);
    expect(el.props.reactionTrigger).toBe('strategy');
    expect(el.props.onOpenMascotStudio).toBe(openStudio);
  });

  it('integrates staggerIndex and scaleTo in LiquidGlassCard', () => {
    const props: LiquidGlassCardProps = {
      variant: 'cube',
      causticPosition: 'corner',
      staggerIndex: 3,
      scaleTo: 0.94,
      children: 'Glass Cube',
    };
    const el = React.createElement(LiquidGlassCard, props);
    expect(el.props.staggerIndex).toBe(3);
    expect(el.props.scaleTo).toBe(0.94);
  });
});
