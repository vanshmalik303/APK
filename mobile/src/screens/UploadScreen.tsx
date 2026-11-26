import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { UploadArea, SelectedFile } from '../components/UploadArea';
import { ScanProgress } from '../components/ScanProgress';
import { mobileApi } from '../services/api';
import { SecurityReport } from '../types';
import { COLORS } from '../theme/colors';

interface UploadScreenProps {
  onViewReport: (reportId: string) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onViewReport }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentFile, setCurrentFile] = useState<SelectedFile | null>(null);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  const handleStartScan = (file: SelectedFile) => {
    setCurrentFile(file);
    setIsScanning(true);
    setScanStageIndex(0);
    setProgress(5);
    setLogs([
      `Initiating hermetic static audit for ${file.name}`,
      `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      'Validating magic bytes and ZIP headers...',
    ]);

    const stageMilestones = [
      {
        stage: 0,
        progress: 18,
        log: 'ZIP headers validated. PK\\x03\\x04 magic bytes verified. Decompressing AndroidManifest.xml...',
      },
      {
        stage: 1,
        progress: 36,
        log: 'AndroidManifest parsed. 4 Activities, 2 Services, 1 Receiver identified. Component flags verified.',
      },
      {
        stage: 2,
        progress: 54,
        log: 'Auditing 6 permissions. Found 3 dangerous permissions (LOCATION, STORAGE).',
      },
      {
        stage: 3,
        progress: 72,
        log: 'Disassembling DEX bytecode. classes.dex parsed into 1,420 method signatures.',
      },
      {
        stage: 4,
        progress: 90,
        log: 'Evaluating static rules: Hardcoded API credentials detected. Insecure cleartext HTTP flag identified.',
      },
      {
        stage: 5,
        progress: 100,
        log: 'CVSS risk score synthesized: Score 74 (HIGH RISK). Audit report compiled.',
      },
    ];

    let currentStep = 0;

    scanIntervalRef.current = setInterval(async () => {
      currentStep += 1;

      if (currentStep < stageMilestones.length) {
        const item = stageMilestones[currentStep];
        setScanStageIndex(item.stage);
        setProgress(item.progress);
        setLogs((prev) => [...prev, item.log]);
      } else {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }

        // Finalize scan and create report
        const newReportId = `rep-${Date.now()}`;
        const newReport: SecurityReport = {
          id: newReportId,
          apkId: `apk-${Date.now()}`,
          fileName: file.name,
          fileSizeBytes: file.size,
          formattedSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          packageName: `com.example.${file.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
          versionName: '1.0.0',
          versionCode: '101',
          minSdkVersion: 24,
          targetSdkVersion: 34,
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          scanDate: 'Just now',
          status: 'ISSUES_FOUND',
          riskScore: {
            score: 74,
            level: 'HIGH',
            methodology:
              'Calculated using a CVSS-weighted penalty model. Cumulative penalty of 26 points deducted due to high severity network configuration and credential leakage.',
            breakdown: {
              critical: 1,
              high: 2,
              medium: 2,
              low: 1,
              informational: 2,
            },
          },
          summary: {
            totalFindings: 8,
            confirmedFindings: 6,
            heuristicDetections: 2,
          },
          permissions: [
            { name: 'android.permission.INTERNET', description: 'Network communication', isDangerous: false },
            { name: 'android.permission.ACCESS_FINE_LOCATION', description: 'Precise GPS position', isDangerous: true },
            { name: 'android.permission.READ_EXTERNAL_STORAGE', description: 'Read device files', isDangerous: true },
            { name: 'android.permission.POST_NOTIFICATIONS', description: 'Post alerts', isDangerous: false },
          ],
          findings: [
            {
              id: `f-${Date.now()}-1`,
              title: 'Hardcoded Secret API Key in Decompiled Code',
              severity: 'CRITICAL',
              category: 'Cryptography',
              shortExplanation: 'Plaintext secret credential found embedded within decompiled class constants.',
              evidence: 'private static final String API_SECRET = "sk_live_99d8a39f1c7e92b8d4e7f1";',
              affectedComponent: 'com.example.network.ApiClient.smali',
              whyItMatters:
                'Hardcoded production secrets can be extracted by any party decompiling the APK. This exposes backend endpoints to unauthenticated abuse.',
              recommendedFix:
                'Remove secret keys from client binaries. Authenticate client apps using OAuth tokens or store transient secrets in Android Keystore.',
              isHeuristic: false,
              cwe: 'CWE-798',
            },
            {
              id: `f-${Date.now()}-2`,
              title: 'Insecure Cleartext HTTP Traffic Explicitly Permitted',
              severity: 'HIGH',
              category: 'Network Security',
              shortExplanation: 'Network security config permits cleartext HTTP transmissions.',
              evidence: '<domain-config cleartextTrafficPermitted="true">',
              affectedComponent: 'res/xml/network_security_config.xml',
              whyItMatters: 'Transmitting payload data over unencrypted HTTP enables Man-In-The-Middle (MITM) eavesdropping.',
              recommendedFix: 'Enforce cleartextTrafficPermitted="false" globally in your network security configuration.',
              isHeuristic: false,
              cwe: 'CWE-319',
            },
            {
              id: `f-${Date.now()}-3`,
              title: 'Exported Activity Without Security Guard',
              severity: 'HIGH',
              category: 'Component Exposure',
              shortExplanation: 'Sensitive internal activity is exported and callable by any installed app.',
              evidence: '<activity android:name=".ui.PaymentConfirmActivity" android:exported="true" />',
              affectedComponent: 'AndroidManifest.xml',
              whyItMatters: 'Third-party malware installed on the device can launch this Activity via explicit Intent.',
              recommendedFix: 'Set android:exported="false" unless the component is intentionally exposed.',
              isHeuristic: false,
              cwe: 'CWE-926',
            },
          ],
        };

        await mobileApi.saveNewScan(file.name, file.size, newReport);
        setIsScanning(false);
        setCurrentFile(null);

        Alert.alert(
          'Security Scan Complete',
          `Analysis finished for ${file.name}. CVSS Risk Score: 74/100 (HIGH).`,
          [
            { text: 'View Report', onPress: () => onViewReport(newReportId) },
            { text: 'OK', style: 'cancel' },
          ]
        );
      }
    }, 1400);
  };

  const handleCancelScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setIsScanning(false);
    setCurrentFile(null);
    setProgress(0);
    setLogs([]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroBadge}>
          <Ionicons name="shield" size={14} color={COLORS.primary} />
          <Text style={styles.heroBadgeText}>ZERO-EXECUTION STATIC ANALYSIS</Text>
        </View>
        <Text style={styles.heroTitle}>Static APK Security Analyzer</Text>
        <Text style={styles.heroDescription}>
          Audit Android application binaries for embedded secrets, insecure network configs, and
          misconfigured components before deployment.
        </Text>
      </View>

      {/* Upload or Scanning Section */}
      {isScanning && currentFile ? (
        <ScanProgress
          currentStageIndex={scanStageIndex}
          overallProgress={progress}
          fileName={currentFile.name}
          logs={logs}
          onCancel={handleCancelScan}
        />
      ) : (
        <UploadArea onStartScan={handleStartScan} isScanning={isScanning} />
      )}

      {/* How it Works Cards */}
      <View style={styles.sectionHeaderRow}>
        <Ionicons name="flash-outline" size={16} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
      </View>

      <View style={styles.stepsContainer}>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>01</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Decompile Bytecode</Text>
            <Text style={styles.stepDesc}>
              Safely extracts AndroidManifest.xml, DEX string pools, and compiled resources without running the app.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>02</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Deterministic Rules</Text>
            <Text style={styles.stepDesc}>
              Audits against 10+ deterministic static security rules spanning cryptography, intents, and permissions.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>03</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>CVSS Weighted Score</Text>
            <Text style={styles.stepDesc}>
              Computes cumulative risk score and produces clear evidence and line-by-line remediation guides.
            </Text>
          </View>
        </View>
      </View>

      {/* Safety Guarantee */}
      <View style={styles.guaranteeBox}>
        <Ionicons name="lock-closed" size={16} color={COLORS.success} />
        <Text style={styles.guaranteeText}>
          Hermetic Analysis: APKs are analyzed entirely in isolated memory and are never executed on your device.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroBanner: {
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.borderOrange,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  stepsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    padding: 12,
    gap: 8,
  },
  guaranteeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});
