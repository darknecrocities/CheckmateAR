import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Cpu, Moon, Vibrate, ShieldCheck, Trash2 } from 'lucide-react-native';

import { AppSettings } from '../../types/study';
import { getAppSettings, saveAppSettings } from '../../services/storage/settingsStorage';
import { clearAllStudySessions } from '../../services/storage/studyStorage';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = await saveAppSettings({ [key]: val });
    setSettings(updated);
  };

  const handleClearData = () => {
    Alert.alert('Reset App Data', 'This will delete all saved study sessions and reset settings.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset All',
        style: 'destructive',
        onPress: async () => {
          await clearAllStudySessions();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Data Cleared', 'All local history has been reset.');
        },
      },
    ]);
  };

  if (!settings) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={colors.dark.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Engine Settings Section */}
        <Text style={styles.sectionHeader}>Stockfish Engine</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLabelWrap}>
              <Cpu size={20} color="#FFFFFF" />
              <View>
                <Text style={styles.rowTitle}>Search Depth</Text>
                <Text style={styles.rowSubtitle}>Higher depth calculates deeper tactics</Text>
              </View>
            </View>
            <View style={styles.depthPill}>
              <Text style={styles.depthText}>{settings.engineDepth} ply</Text>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            {[10, 14, 18, 22].map((depth) => (
              <TouchableOpacity
                key={depth}
                style={[styles.depthBtn, settings.engineDepth === depth && styles.activeDepthBtn]}
                onPress={() => updateSetting('engineDepth', depth)}
              >
                <Text style={[styles.depthBtnText, settings.engineDepth === depth && styles.activeDepthBtnText]}>
                  {depth}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tactile & Motion Settings */}
        <Text style={styles.sectionHeader}>Tactile & Feedback</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.rowLabelWrap}>
              <Vibrate size={20} color={colors.dark.textPrimary} />
              <View>
                <Text style={styles.rowTitle}>Haptic Feedback</Text>
                <Text style={styles.rowSubtitle}>Tactile vibration on move confirmation</Text>
              </View>
            </View>
            <Switch
              value={settings.enableHaptics}
              onValueChange={(val) => updateSetting('enableHaptics', val)}
              trackColor={{ false: '#2A2D3D', true: colors.dark.accent }}
            />
          </View>
        </View>

        {/* Offline & Privacy Guarantees */}
        <Text style={styles.sectionHeader}>Privacy & Diagnostics</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLabelWrap}>
              <ShieldCheck size={20} color="#FFFFFF" />
              <View>
                <Text style={styles.rowTitle}>100% On-Device Privacy</Text>
                <Text style={styles.rowSubtitle}>Zero camera frames or board data leave this device</Text>
              </View>
            </View>
          </View>
          <View style={styles.statusBox}>
            <Text style={styles.statusLine}>• Local Engine: Stockfish UCI Ready</Text>
            <Text style={styles.statusLine}>• Vision Engine: Projective Homography Active</Text>
            <Text style={styles.statusLine}>• Cloud Telemetry: Disabled</Text>
          </View>
        </View>

        {/* Reset Data Button */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleClearData}>
          <Trash2 size={18} color={colors.dark.danger} />
          <Text style={styles.resetBtnText}>Clear Local Study Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.dark.textPrimary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  depthPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  depthText: {
    ...typography.tiny,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  depthBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  activeDepthBtn: {
    borderColor: colors.dark.accent,
    backgroundColor: colors.dark.accentSubtle,
  },
  depthBtnText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
  },
  activeDepthBtnText: {
    color: colors.dark.textPrimary,
    fontWeight: '800',
  },
  statusBox: {
    marginTop: spacing.md,
    backgroundColor: colors.dark.surface,
    padding: spacing.sm,
    borderRadius: radii.md,
    gap: 4,
  },
  statusLine: {
    ...typography.tiny,
    color: colors.dark.textMuted,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 82, 82, 0.12)',
    borderWidth: 1,
    borderColor: colors.dark.danger,
    borderRadius: radii.lg,
  },
  resetBtnText: {
    ...typography.headline,
    color: colors.dark.danger,
    fontSize: 14,
  },
});
