import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const SCAN_STAGES = [
  { id: 0, label: 'APK Integrity & ZIP Validation', desc: 'Validating magic bytes PK\\x03\\x04 and ZIP structure' },
  { id: 1, label: 'Manifest & Component Audit', desc: 'Parsing exported activities, receivers & services' },
  { id: 2, label: 'Permission Threat Surface', desc: 'Auditing dangerous permissions and protection levels' },
  { id: 3, label: 'DEX Bytecode Decompilation', desc: 'Static string pool extraction and method traversal' },
  { id: 4, label: 'Cryptographic & Secret Rules', desc: 'Evaluating hardcoded secrets, TLS and debug flags' },
  { id: 5, label: 'CVSS Risk Scoring & Synthesis', desc: 'Calculating cumulative risk penalty and generating report' },
];

interface ScanProgressProps {
  currentStageIndex: number; // 0 to 5
  overallProgress: number; // 0 to 100
  fileName: string;
  logs: string[];
  onCancel: () => void;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({
  currentStageIndex,
  overallProgress,
  fileName,
  logs,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.spinner} />
          <View style={styles.titleTextContainer}>
            <Text style={styles.headerTitle}>Static Security Analysis</Text>
            <Text style={styles.fileNameText} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Ionicons name="close" size={16} color={COLORS.textSecondary} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, overallProgress)}%` }]} />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressStageText}>
            Stage {Math.min(currentStageIndex + 1, 6)} of 6
          </Text>
          <Text style={styles.progressPercentText}>{Math.round(overallProgress)}%</Text>
        </View>
      </View>

      {/* Stages List */}
      <View style={styles.stagesList}>
        {SCAN_STAGES.map((stage) => {
          const isDone = currentStageIndex > stage.id;
          const isActive = currentStageIndex === stage.id;
          const isPending = currentStageIndex < stage.id;

          return (
            <View key={stage.id} style={styles.stageItem}>
              <View style={styles.stageIndicator}>
                {isDone ? (
                  <View style={styles.doneCircle}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                ) : isActive ? (
                  <View style={styles.activeCircle}>
                    <ActivityIndicator size={12} color={COLORS.primary} />
                  </View>
                ) : (
                  <View style={styles.pendingCircle} />
                )}
                {stage.id < SCAN_STAGES.length - 1 && (
                  <View style={[styles.stageConnector, isDone && styles.stageConnectorActive]} />
                )}
              </View>

              <View style={styles.stageContent}>
                <Text
                  style={[
                    styles.stageLabel,
                    isActive && styles.stageLabelActive,
                    isDone && styles.stageLabelDone,
                  ]}
                >
                  {stage.label}
                </Text>
                <Text style={styles.stageDesc}>{stage.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Terminal Console Logs */}
      <View style={styles.logContainer}>
        <View style={styles.logHeader}>
          <Ionicons name="terminal-outline" size={14} color={COLORS.primary} />
          <Text style={styles.logHeaderText}>ANALYZER LOG STREAM</Text>
        </View>
        <ScrollView style={styles.logScroll} nestedScrollEnabled>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logLine}>
              <Text style={styles.logPrompt}>$&gt; </Text>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spinner: {
    marginRight: 10,
  },
  titleTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  fileNameText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '500',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStageText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercentText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  stagesList: {
    marginBottom: 16,
  },
  stageItem: {
    flexDirection: 'row',
    minHeight: 46,
  },
  stageIndicator: {
    width: 24,
    alignItems: 'center',
  },
  doneCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 3,
  },
  stageConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  stageConnectorActive: {
    backgroundColor: COLORS.success,
  },
  stageContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 10,
  },
  stageLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  stageLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  stageLabelDone: {
    color: COLORS.textSecondary,
  },
  stageDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  logContainer: {
    backgroundColor: '#050505',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 6,
    marginBottom: 6,
  },
  logHeaderText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  logScroll: {
    maxHeight: 90,
  },
  logLine: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#D4D4D4',
    lineHeight: 16,
  },
  logPrompt: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
