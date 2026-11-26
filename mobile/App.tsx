import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Header } from './src/components/Header';
import { UploadScreen } from './src/screens/UploadScreen';
import { FilesScreen } from './src/screens/FilesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { COLORS } from './src/theme/colors';

type Tab = 'upload' | 'files' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  const handleBackFromReport = () => {
    setSelectedReportId(null);
  };

  const handleSwitchTab = (tab: Tab) => {
    setSelectedReportId(null);
    setActiveTab(tab);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ExpoStatusBar style="light" backgroundColor={COLORS.nav} />

        {/* Global Top App Header */}
        <Header />

        {/* Main Content Area */}
        <View style={styles.mainContainer}>
          {selectedReportId ? (
            <ReportScreen
              reportId={selectedReportId}
              onBack={handleBackFromReport}
            />
          ) : (
            <>
              {activeTab === 'upload' && (
                <UploadScreen onViewReport={handleViewReport} />
              )}
              {activeTab === 'files' && (
                <FilesScreen
                  onViewReport={handleViewReport}
                  onNavigateToUpload={() => handleSwitchTab('upload')}
                />
              )}
              {activeTab === 'profile' && <ProfileScreen />}
            </>
          )}
        </View>

        {/* Bottom Navigation Bar */}
        <SafeAreaView style={styles.bottomNavSafe} edges={['bottom']}>
          <View style={styles.navBar}>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'upload' && !selectedReportId && styles.navItemActive]}
              onPress={() => handleSwitchTab('upload')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'upload' && !selectedReportId ? 'cloud-upload' : 'cloud-upload-outline'}
                size={22}
                color={activeTab === 'upload' && !selectedReportId ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'upload' && !selectedReportId && styles.navLabelActive,
                ]}
              >
                Upload APK
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'files' && !selectedReportId && styles.navItemActive]}
              onPress={() => handleSwitchTab('files')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'files' && !selectedReportId ? 'folder-open' : 'folder-open-outline'}
                size={22}
                color={activeTab === 'files' && !selectedReportId ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'files' && !selectedReportId && styles.navLabelActive,
                ]}
              >
                My Files
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'profile' && !selectedReportId && styles.navItemActive]}
              onPress={() => handleSwitchTab('profile')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'profile' && !selectedReportId ? 'person' : 'person-outline'}
                size={22}
                color={activeTab === 'profile' && !selectedReportId ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'profile' && !selectedReportId && styles.navLabelActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomNavSafe: {
    backgroundColor: COLORS.nav,
  },
  navBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.nav,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: COLORS.primarySubtle,
  },
  navLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
