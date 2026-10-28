import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { motion } from '../../theme/motion';

/**
 * Context broadcasting whether a parent card/surface is currently pressed,
 * enabling child 3D artwork to perform counter-parallax lift automatically.
 */
export const KineticPressContext = createContext<boolean>(false);

export const useKineticPressState = (): boolean => useContext(KineticPressContext);

export interface KineticPressableProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  scaleTo?: number;
  translateYTo?: number;
  staggerIndex?: number;
  hapticStyle?: 'light' | 'medium' | 'selection' | 'none';
  enablePulse?: boolean;
  onPressStateChange?: (pressed: boolean) => void;
  accessibilityLabel?: string;
  testID?: string;
  disabled?: boolean;
}

/**
 * Framer-Motion-inspired interactive wrapper (`whileTap` + staggered `initial`/`animate`)
 * powered by React Native's hardware-accelerated native driver springs.
 */
export const KineticPressable: React.FC<KineticPressableProps> = ({
  children,
  style,
  onPress,
  scaleTo = 0.95,
  translateYTo = 2,
  staggerIndex,
  hapticStyle = 'light',
  enablePulse = false,
  onPressStateChange,
  accessibilityLabel,
  testID,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressY = useRef(new Animated.Value(0)).current;
  const mountOpacity = useRef(new Animated.Value(staggerIndex !== undefined ? 0 : 1)).current;
  const mountY = useRef(new Animated.Value(staggerIndex !== undefined ? 16 : 0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Staggered Entrance Cascade
  useEffect(() => {
    if (staggerIndex === undefined) return;
    mountOpacity.setValue(0);
    mountY.setValue(16);

    const delay = Math.min(staggerIndex * 55, 450);
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(mountOpacity, {
          toValue: 1,
          duration: motion.timing.normal,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(mountY, {
          toValue: 0,
          ...motion.spring.entrance,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [staggerIndex, mountOpacity, mountY]);

  // Optional Continuous Breathing Pulse (e.g. primary AR action button)
  useEffect(() => {
    if (!enablePulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: motion.timing.pulse,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: motion.timing.pulse,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enablePulse, pulseValue]);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    onPressStateChange?.(true);

    if (hapticStyle === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (hapticStyle === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (hapticStyle === 'selection') {
      Haptics.selectionAsync().catch(() => {});
    }

    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: scaleTo,
        ...motion.spring.pressIn,
        useNativeDriver: true,
      }),
      Animated.spring(pressY, {
        toValue: translateYTo,
        ...motion.spring.pressIn,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    setIsPressed(false);
    onPressStateChange?.(false);

    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        ...motion.spring.pressOut,
        useNativeDriver: true,
      }),
      Animated.spring(pressY, {
        toValue: 0,
        ...motion.spring.pressOut,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const combinedScale = enablePulse
    ? Animated.multiply(pressScale, pulseValue)
    : pressScale;

  const combinedTranslateY =
    staggerIndex !== undefined ? Animated.add(pressY, mountY) : pressY;

  return (
    <KineticPressContext.Provider value={isPressed}>
      <TouchableOpacity
        activeOpacity={1}
        disabled={disabled || !onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        <Animated.View
          style={[
            style,
            {
              opacity: mountOpacity,
              transform: [{ scale: combinedScale }, { translateY: combinedTranslateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>
    </KineticPressContext.Provider>
  );
};

export interface ContinuousFloatViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  amplitude?: number;
  duration?: number;
  delay?: number;
  elevated?: boolean;
  enabled?: boolean;
}

/**
 * Continuous sinusoidal levitation wrapper with automatic 3D counter-parallax
 * lift when its parent card is pressed.
 */
export const ContinuousFloatView: React.FC<ContinuousFloatViewProps> = ({
  children,
  style,
  amplitude = 4.5,
  duration = motion.timing.floatCycle,
  delay = 0,
  elevated,
  enabled = true,
}) => {
  const parentPressed = useKineticPressState();
  const isElevated = elevated ?? parentPressed;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const parallaxScale = useRef(new Animated.Value(1)).current;
  const parallaxLift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return;
    let loop: Animated.CompositeAnimation | null = null;
    const timer = setTimeout(() => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -amplitude,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: amplitude,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      loop?.stop();
    };
  }, [enabled, amplitude, duration, delay, floatAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(parallaxScale, {
        toValue: isElevated ? 1.1 : 1,
        ...motion.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.spring(parallaxLift, {
        toValue: isElevated ? -7 : 0,
        ...motion.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isElevated, parallaxScale, parallaxLift]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: Animated.add(floatAnim, parallaxLift) },
            { scale: parallaxScale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {children}
    </Animated.View>
  );
};

export interface KineticRouteTransitionProps {
  routeKey: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Spatial route transition container that springs screens into view on navigation.
 */
export const KineticRouteTransition: React.FC<KineticRouteTransitionProps> = ({
  routeKey,
  children,
  style,
}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0.35);
    translateY.setValue(10);
    scale.setValue(0.985);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        ...motion.spring.entrance,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...motion.spring.entrance,
        useNativeDriver: true,
      }),
    ]).start();
  }, [routeKey, opacity, translateY, scale]);

  return (
    <Animated.View
      style={[
        styles.routeFlex,
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  routeFlex: {
    flex: 1,
  },
});
