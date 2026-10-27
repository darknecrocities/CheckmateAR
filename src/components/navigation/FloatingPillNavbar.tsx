import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BookOpen, Box, Camera, Brain, User, Plus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTab(tab);
  };

  const handleCenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPressCenterAction();
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View style={styles.navbarRow}>
        {/* Left Pill Pod: Home & 3D Mascot */}
        <View style={styles.pillPod}>
          <TouchableOpacity
            style={[styles.podBtn, currentTab === 'home' && styles.activePodBtn]}
            onPress={() => handleTabPress('home')}
            accessibilityLabel="Home Library"
          >
            <BookOpen
              size={20}
              color={currentTab === 'home' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'home' ? 2.4 : 1.8}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.podBtn, currentTab === 'mascot' && styles.activePodBtn]}
            onPress={() => handleTabPress('mascot')}
            accessibilityLabel="3D Mascot Studio"
          >
            <Box
              size={20}
              color={currentTab === 'mascot' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'mascot' ? 2.4 : 1.8}
            />
          </TouchableOpacity>
        </View>

        {/* Center Elevated Action Button (Matching Reference Screen 3) */}
        <TouchableOpacity
          style={styles.centerCircleBtn}
          activeOpacity={0.88}
          onPress={handleCenterPress}
          accessibilityLabel="Launch Live AR Scanner"
        >
          <Camera size={24} color="#000000" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Right Pill Pod: AI Coach & Settings */}
        <View style={styles.pillPod}>
          <TouchableOpacity
            style={[styles.podBtn, currentTab === 'coach' && styles.activePodBtn]}
            onPress={() => handleTabPress('coach')}
            accessibilityLabel="AI Coach"
          >
            <Brain
              size={20}
              color={currentTab === 'coach' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'coach' ? 2.4 : 1.8}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.podBtn, currentTab === 'settings' && styles.activePodBtn]}
            onPress={() => handleTabPress('settings')}
            accessibilityLabel="Settings"
          >
            <User
              size={20}
              color={currentTab === 'settings' ? '#FFFFFF' : '#737373'}
              strokeWidth={currentTab === 'settings' ? 2.4 : 1.8}
            />
          </TouchableOpacity>
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
