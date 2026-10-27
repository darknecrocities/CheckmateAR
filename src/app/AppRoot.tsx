import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { HomeScreen } from '../features/home/HomeScreen';
import { ScanScreen } from '../features/scan/ScanScreen';
import { AnalysisScreen } from '../features/analysis/AnalysisScreen';
import { CoachScreen } from '../features/coach/CoachScreen';
import { HistoryScreen } from '../features/history/HistoryScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { EngineEvaluation } from '../types/stockfish';
import { StudySession } from '../types/study';
import { colors } from '../theme/colors';

export type AppRoute = 'home' | 'scan' | 'analysis' | 'coach' | 'history' | 'settings';

export default function AppRoot() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('scan');
  const [activeFen, setActiveFen] = useState<string>(
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
  );
  const [activeEval, setActiveEval] = useState<EngineEvaluation | undefined>(undefined);

  const navigateToAnalysis = (fen: string, evaluation?: EngineEvaluation) => {
    setActiveFen(fen);
    setActiveEval(evaluation);
    setCurrentRoute('analysis');
  };

  const navigateToCoach = (fen: string, evaluation?: EngineEvaluation) => {
    setActiveFen(fen);
    setActiveEval(evaluation);
    setCurrentRoute('coach');
  };

  const handleOpenSavedSession = (session: StudySession) => {
    setActiveFen(session.fen);
    setActiveEval(session.evaluation);
    setCurrentRoute('analysis');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {currentRoute === 'home' && (
        <HomeScreen
          onStartScan={() => setCurrentRoute('scan')}
          onOpenAnalysis={() => navigateToAnalysis(activeFen, activeEval)}
          onOpenHistory={() => setCurrentRoute('history')}
          onOpenSettings={() => setCurrentRoute('settings')}
          onOpenSession={handleOpenSavedSession}
        />
      )}

      {currentRoute === 'scan' && (
        <ScanScreen
          onNavigateToAnalysis={navigateToAnalysis}
          onNavigateToCoach={navigateToCoach}
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
          onBack={() => setCurrentRoute(activeEval ? 'scan' : 'home')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
});
