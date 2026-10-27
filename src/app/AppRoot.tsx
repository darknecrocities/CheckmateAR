import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { HomeScreen } from '../features/home/HomeScreen';
import { ScanScreen } from '../features/scan/ScanScreen';
import { AnalysisScreen } from '../features/analysis/AnalysisScreen';
import { CoachScreen } from '../features/coach/CoachScreen';
import { HistoryScreen } from '../features/history/HistoryScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { MascotScreen } from '../features/mascot/MascotScreen';
import { FloatingPillNavbar, NavTab } from '../components/navigation/FloatingPillNavbar';
import { EngineEvaluation } from '../types/stockfish';
import { StudySession } from '../types/study';
import { colors } from '../theme/colors';

export type AppRoute = 'home' | 'scan' | 'analysis' | 'coach' | 'history' | 'settings' | 'mascot';

export default function AppRoot() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [activeFen, setActiveFen] = useState<string>(
    '5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1'
  );
  const [activeEval, setActiveEval] = useState<EngineEvaluation | undefined>(undefined);

  useEffect(() => {
    // Hide mobile status bar and navigation bar globally for full immersion
    StatusBar.setHidden(true, 'none');
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setVisibilityAsync('hidden');
      } catch {
        // Fallback for non-supported device runtimes
      }
    }
  }, []);

  const navigateToAnalysis = (fen?: string, evaluation?: EngineEvaluation) => {
    if (fen) setActiveFen(fen);
    setActiveEval(evaluation);
    setCurrentRoute('analysis');
  };

  const navigateToCoach = (fen?: string, evaluation?: EngineEvaluation) => {
    if (fen) setActiveFen(fen);
    setActiveEval(evaluation);
    setCurrentRoute('coach');
  };

  const handleOpenSavedSession = (session: StudySession) => {
    setActiveFen(session.fen);
    setActiveEval(session.evaluation);
    setCurrentRoute('analysis');
  };

  const handleNavTabSelect = (tab: NavTab) => {
    if (tab === 'home') setCurrentRoute('home');
    else if (tab === 'mascot') setCurrentRoute('mascot');
    else if (tab === 'coach') setCurrentRoute('coach');
    else if (tab === 'settings') setCurrentRoute('settings');
  };

  // Determine active navbar tab
  const activeNavTab: NavTab =
    currentRoute === 'mascot'
      ? 'mascot'
      : currentRoute === 'coach'
      ? 'coach'
      : currentRoute === 'settings'
      ? 'settings'
      : 'home';

  const showNavbar = currentRoute !== 'scan' && currentRoute !== 'analysis';

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} barStyle="light-content" />

      {currentRoute === 'home' && (
        <HomeScreen
          onStartScan={() => setCurrentRoute('scan')}
          onOpenAnalysis={navigateToAnalysis}
          onOpenCoach={navigateToCoach}
          onOpenMascot={() => setCurrentRoute('mascot')}
          onOpenHistory={() => setCurrentRoute('history')}
        />
      )}

      {currentRoute === 'mascot' && (
        <MascotScreen
          onBack={() => setCurrentRoute('home')}
          onStartAR={() => setCurrentRoute('scan')}
        />
      )}

      {currentRoute === 'scan' && (
        <ScanScreen
          onNavigateToAnalysis={navigateToAnalysis}
          onNavigateToCoach={navigateToCoach}
          onBackToHome={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'analysis' && (
        <AnalysisScreen
          initialFen={activeFen}
          initialEvaluation={activeEval}
          onBack={() => setCurrentRoute('home')}
          onNavigateToCoach={navigateToCoach}
        />
      )}

      {currentRoute === 'coach' && (
        <CoachScreen
          fen={activeFen}
          evaluation={activeEval}
          onBack={() => setCurrentRoute('home')}
        />
      )}

      {currentRoute === 'history' && (
        <HistoryScreen
          onBack={() => setCurrentRoute('home')}
          onOpenSession={handleOpenSavedSession}
        />
      )}

      {currentRoute === 'settings' && (
        <SettingsScreen onBack={() => setCurrentRoute('home')} />
      )}

      {/* Signature Floating Pill Navbar (Matching Reference Screen 3) */}
      {showNavbar && (
        <FloatingPillNavbar
          currentTab={activeNavTab}
          onSelectTab={handleNavTabSelect}
          onPressCenterAction={() => setCurrentRoute('scan')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
