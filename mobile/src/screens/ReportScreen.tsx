import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SecurityReport, SeverityLevel } from '../types';
import { RiskSummary } from '../components/RiskSummary';
import { VulnerabilityCard } from '../components/VulnerabilityCard';
import { mobileApi } from '../services/api';
import { COLORS } from '../theme/colors';

interface ReportScreenProps {
  reportId: string;
  onBack: () => void;
}

type TabType = 'FINDINGS' | 'PERMISSIONS';

export const ReportScreen: React.FC<ReportScreenProps> = ({ reportId, onBack }) => {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('FINDINGS');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [copiedSha, setCopiedSha] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    mobileApi.getReport(reportId).then((data) => {
      setReport(data);
      setIsLoading(false);
    });
  }, [reportId]);

  const handleCopySha = async () => {
    if (!report) return;
    await Clipboard.setStringAsync(report.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleExportShare = async () => {
    if (!report) return;
    try {
      setIsExporting(true);
      const jsonContent = JSON.stringify(report, null, 2);
      const fileUri = `${FileSystem.cacheDirectory}apkguard-audit-${report.packageName}.json`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: `Share APKGuard Audit Report: ${report.fileName}`,
        });
      } else {
        await Clipboard.setStringAsync(jsonContent);
        Alert.alert('Report Copied', 'JSON audit report copied to device clipboard.');
      }
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert('Export Failed', 'Unable to generate export file.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Security Audit Report...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.critical} />
        <Text style={styles.notFoundTitle}>Report Not Found</Text>
        <Text style={styles.notFoundDesc}>
          The requested security audit report could not be located in local storage.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={16} color={COLORS.textDark} />
          <Text style={styles.backButtonText}>Return to Files</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredFindings = report.findings.filter((f) => {
    if (selectedSeverity === 'ALL') return true;
    return f.severity === selectedSeverity;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Navigation Row */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backNavBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backNavText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExportShare}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="share-outline" size={16} color={COLORS.primary} />
              <Text style={styles.exportBtnText}>Export JSON</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* APK Meta Card */}
      <View style={styles.metaCard}>
        <View style={styles.metaCardHeader}>
          <View style={styles.apkIconContainer}>
            <MaterialCommunityIcons name="android" size={26} color={COLORS.primary} />
          </View>
          <View style={styles.metaTitleCol}>
            <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
              {report.fileName}
            </Text>
            <Text style={styles.packageName} numberOfLines={1}>
              {report.packageName}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaGridItem}>
            <Text style={styles.gridLabel}>VERSION</Text>
            <Text style={styles.gridValue}>
              v{report.versionName} ({report.versionCode})
            </Text>
          </View>
          <View style={styles.metaGridItem}>
            <Text style={styles.gridLabel}>SDK TARGET</Text>
            <Text style={styles.gridValue}>
              Android {report.targetSdkVersion} (Min {report.minSdkVersion})
            </Text>
          </View>
          <View style={styles.metaGridItem}>
            <Text style={styles.gridLabel}>FILE SIZE</Text>
            <Text style={styles.gridValue}>{report.formattedSize}</Text>
          </View>
          <View style={styles.metaGridItem}>
            <Text style={styles.gridLabel}>AUDIT DATE</Text>
            <Text style={styles.gridValue}>{report.scanDate}</Text>
          </View>
        </View>

        {/* SHA-256 Hash */}
        <View style={styles.shaContainer}>
          <View style={styles.shaHeader}>
            <Text style={styles.shaLabel}>SHA-256 CHECKSUM</Text>
            <TouchableOpacity onPress={handleCopySha} style={styles.copyShaBtn}>
              <Ionicons
                name={copiedSha ? 'checkmark' : 'copy-outline'}
                size={12}
                color={copiedSha ? COLORS.success : COLORS.primaryLight}
              />
              <Text style={[styles.copyShaText, copiedSha && { color: COLORS.success }]}>
                {copiedSha ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.shaText} numberOfLines={1} ellipsizeMode="middle">
            {report.sha256}
          </Text>
        </View>
      </View>

      {/* Risk Summary Gauge & Breakdown */}
      <RiskSummary riskScore={report.riskScore} />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'FINDINGS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('FINDINGS')}
        >
          <Ionicons
            name="shield-outline"
            size={16}
            color={activeTab === 'FINDINGS' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'FINDINGS' && styles.tabTextActive]}>
            Vulnerabilities ({report.findings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'PERMISSIONS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('PERMISSIONS')}
        >
          <Ionicons
            name="key-outline"
            size={16}
            color={activeTab === 'PERMISSIONS' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'PERMISSIONS' && styles.tabTextActive]}>
            Permissions ({report.permissions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content: Findings */}
      {activeTab === 'FINDINGS' && (
        <View>
          {/* Severity Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.severityFilterScroll}
            contentContainerStyle={styles.severityFilterContent}
          >
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'].map((sev) => {
              const count =
                sev === 'ALL'
                  ? report.findings.length
                  : report.findings.filter((f) => f.severity === sev).length;

              if (count === 0 && sev !== 'ALL') return null;

              return (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.sevChip,
                    selectedSeverity === sev && styles.sevChipActive,
                  ]}
                  onPress={() => setSelectedSeverity(sev)}
                >
                  <Text
                    style={[
                      styles.sevChipText,
                      selectedSeverity === sev && styles.sevChipTextActive,
                    ]}
                  >
                    {sev} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredFindings.map((finding, idx) => (
            <VulnerabilityCard
              key={finding.id}
              finding={finding}
              defaultExpanded={idx === 0}
            />
          ))}
        </View>
      )}

      {/* Tab Content: Permissions */}
      {activeTab === 'PERMISSIONS' && (
        <View style={styles.permissionsContainer}>
          {report.permissions.map((perm, idx) => (
            <View key={idx} style={styles.permCard}>
              <View style={styles.permTopRow}>
                <Text style={styles.permName} numberOfLines={1}>
                  {perm.name}
                </Text>
                <View
                  style={[
                    styles.permBadge,
                    perm.isDangerous ? styles.permBadgeDangerous : styles.permBadgeStandard,
                  ]}
                >
                  <Text
                    style={[
                      styles.permBadgeText,
                      perm.isDangerous
                        ? styles.permBadgeTextDangerous
                        : styles.permBadgeTextStandard,
                    ]}
                  >
                    {perm.isDangerous ? 'DANGEROUS' : 'STANDARD'}
                  </Text>
                </View>
              </View>
              <Text style={styles.permDesc}>{perm.description}</Text>
            </View>
          ))}
        </View>
      )}
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
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
  notFoundTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  notFoundDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  backNavText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.borderOrange,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  exportBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  metaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  metaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  apkIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metaTitleCol: {
    flex: 1,
  },
  fileName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  packageName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Courier',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 12,
    marginBottom: 12,
  },
  metaGridItem: {
    width: '50%',
    marginBottom: 8,
  },
  gridLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  gridValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  shaContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 10,
  },
  shaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shaLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  copyShaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyShaText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '600',
  },
  shaText: {
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
    fontSize: 11,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  severityFilterScroll: {
    marginBottom: 12,
  },
  severityFilterContent: {
    gap: 8,
  },
  sevChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sevChipActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.borderOrange,
  },
  sevChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  sevChipTextActive: {
    color: COLORS.primaryLight,
  },
  permissionsContainer: {
    gap: 10,
  },
  permCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  permTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  permName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Courier',
    flex: 1,
  },
  permBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  permBadgeDangerous: {
    backgroundColor: COLORS.criticalBg,
    borderColor: COLORS.criticalBorder,
  },
  permBadgeStandard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  permBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  permBadgeTextDangerous: {
    color: COLORS.critical,
  },
  permBadgeTextStandard: {
    color: COLORS.textMuted,
  },
  permDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
});
