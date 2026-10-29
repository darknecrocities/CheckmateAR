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
import { TacticalTrainerScreen } from '../features/trainer/TacticalTrainerScreen';
import { WelcomeScreen } from '../features/welcome/WelcomeScreen';
import { FloatingPillNavbar, NavTab } from '../components/navigation/FloatingPillNavbar';
import { KineticRouteTransition } from '../components/ui/MotionPrimitives';
import { StrategyItem } from '../services/chess/strategyLibrary';
import { EngineEvaluation } from '../types/stockfish';
import { StudySession } from '../types/study';

export type AppRoute =
  | 'welcome'
  | 'home'
  | 'scan'
  | 'analysis'
  | 'coach'
  | 'history'
  | 'settings'
  | 'mascot'
  | 'trainer';

export default function AppRoot() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [activeFen, setActiveFen] = useState<string>(
    'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
  );
  const [activeScanTitle, setActiveScanTitle] = useState<string | undefined>(undefined);
  const [activeEval, setActiveEval] = useState<EngineEvaluation | undefined>(undefined);
  const [activeStrategy, setActiveStrategy] = useState<StrategyItem | undefined>(undefined);

  useEffect(() => {
    StatusBar.setHidden(true, 'none');
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').catch(() => {
        // Safe fallback for device lifecycle shifts
      });
    }
  }, []);

  const navigateToScan = (fen?: string, title?: string) => {
    if (fen) setActiveFen(fen);
    setActiveScanTitle(title);
    setCurrentRoute('scan');
  };

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

  const navigateToTrainer = (strategy?: StrategyItem) => {
    if (strategy?.fen) setActiveFen(strategy.fen);
    setActiveStrategy(strategy);
    setCurrentRoute('trainer');
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

  const activeNavTab: NavTab =
    currentRoute === 'mascot'
      ? 'mascot'
      : currentRoute === 'coach'
      ? 'coach'
      : currentRoute === 'settings'
      ? 'settings'
      : 'home';

  const showNavbar =
    currentRoute !== 'scan' &&
    currentRoute !== 'analysis' &&
    currentRoute !== 'welcome';

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} barStyle="light-content" />

      <KineticRouteTransition routeKey={currentRoute}>
        {currentRoute === 'welcome' && (
          <WelcomeScreen onComplete={() => setCurrentRoute('home')} />
        )}

        {currentRoute === 'home' && (
          <HomeScreen
            onStartScan={(fen, title) => navigateToScan(fen, title)}
            onOpenAnalysis={navigateToAnalysis}
            onOpenCoach={navigateToCoach}
            onOpenMascot={() => setCurrentRoute('mascot')}
            onOpenHistory={() => setCurrentRoute('history')}
            onOpenTrainer={navigateToTrainer}
          />
        )}

        {currentRoute === 'trainer' && (
          <TacticalTrainerScreen
            initialStrategy={activeStrategy}
            onBack={() => setCurrentRoute('home')}
            onOpenEngine={(fen) => navigateToAnalysis(fen)}
          />
        )}

        {currentRoute === 'mascot' && (
          <MascotScreen
            onBack={() => setCurrentRoute('home')}
            onStartAR={() => navigateToScan()}
          />
        )}

        {currentRoute === 'scan' && (
          <ScanScreen
            initialFen={activeFen}
            strategyTitle={activeScanTitle}
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
      </KineticRouteTransition>

      {showNavbar && (
        <FloatingPillNavbar
          currentTab={activeNavTab}
          onSelectTab={handleNavTabSelect}
          onPressCenterAction={() => navigateToScan()}
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
