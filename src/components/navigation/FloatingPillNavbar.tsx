import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BookOpen, Box, Camera, Brain, User } from 'lucide-react-native';
import { KineticPressable } from '../ui/MotionPrimitives';
import { radii, spacing } from '../../theme/spacing';

export type NavTab = 'home' | 'mascot' | 'coach' | 'settings';

interface FloatingPillNavbarProps {
  currentTab: string;
  onSelectTab: (tab: NavTab) => void;
  onPressCenterAction: () => void;
}

export const FloatingPillNavbar: React.FC<FloatingPillNavbarProps> = ({
  currentTab,
  onSelectTab,
  onPressCenterAction,
}) => {
  const handleTabPress = (tab: NavTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelectTab(tab);
  };

  const handleCenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    onPressCenterAction();
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View style={styles.navbarRow}>
        {/* Left Pill Pod: Home & 3D Mascot */}
        <View style={styles.pillPod}>
          <KineticPressable
            scaleTo={0.86}
            translateYTo={-2}
            hapticStyle="selection"
            style={[styles.podBtn, currentTab === 'home' && styles.activePodBtn]}
            onPress={() => handleTabPress('home')}
            accessibilityLabel="Home Library"
          >
            <BookOpen
              size={20}
              color={currentTab === 'home' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'home' ? 2.4 : 1.8}
            />
          </KineticPressable>

          <KineticPressable
            scaleTo={0.86}
            translateYTo={-2}
            hapticStyle="selection"
            style={[styles.podBtn, currentTab === 'mascot' && styles.activePodBtn]}
            onPress={() => handleTabPress('mascot')}
            accessibilityLabel="3D Mascot Studio"
          >
            <Box
              size={20}
              color={currentTab === 'mascot' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'mascot' ? 2.4 : 1.8}
            />
          </KineticPressable>
        </View>

        {/* Center Elevated Action Button with Continuous Kinetic Breathing Pulse */}
        <KineticPressable
          scaleTo={0.88}
          translateYTo={-3}
          enablePulse
          hapticStyle="medium"
          style={styles.centerCircleBtn}
          onPress={handleCenterPress}
          accessibilityLabel="Launch Live AR Scanner"
        >
          <Camera size={24} color="#000000" strokeWidth={2.4} />
        </KineticPressable>

        {/* Right Pill Pod: AI Coach & Settings */}
        <View style={styles.pillPod}>
          <KineticPressable
            scaleTo={0.86}
            translateYTo={-2}
            hapticStyle="selection"
            style={[styles.podBtn, currentTab === 'coach' && styles.activePodBtn]}
            onPress={() => handleTabPress('coach')}
            accessibilityLabel="AI Coach"
          >
            <Brain
              size={20}
              color={currentTab === 'coach' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'coach' ? 2.4 : 1.8}
            />
          </KineticPressable>

          <KineticPressable
            scaleTo={0.86}
            translateYTo={-2}
            hapticStyle="selection"
            style={[styles.podBtn, currentTab === 'settings' && styles.activePodBtn]}
            onPress={() => handleTabPress('settings')}
            accessibilityLabel="Settings"
          >
            <User
              size={20}
              color={currentTab === 'settings' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'settings' ? 2.4 : 1.8}
            />
          </KineticPressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  navbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pillPod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 24, 0.85)',
    borderRadius: radii.pill,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  podBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePodBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  centerCircleBtn: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    transform: [{ translateY: -4 }],
  },
});
