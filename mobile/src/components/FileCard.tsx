import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { APKRecord } from '../types';
import { COLORS } from '../theme/colors';

interface FileCardProps {
  file: APKRecord;
  onViewReport: (reportId: string) => void;
  onDelete: (file: APKRecord) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onViewReport, onDelete }) => {
  const isSafe = file.status === 'SAFE';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="android" size={24} color={COLORS.primary} />
        </View>

        <View style={styles.details}>
          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {file.fileName}
          </Text>
          <Text style={styles.packageName} numberOfLines={1}>
            {file.packageName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(file)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="server-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{file.formattedSize}</Text>
        </View>
        <Text style={styles.metaDot}>•</Text>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{file.uploadDate}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View
          style={[
            styles.statusBadge,
            isSafe ? styles.statusBadgeSafe : styles.statusBadgeIssues,
          ]}
        >
          <Ionicons
            name={isSafe ? 'shield-checkmark' : 'alert-circle'}
            size={13}
            color={isSafe ? COLORS.success : COLORS.critical}
          />
          <Text
            style={[
              styles.statusText,
              isSafe ? styles.statusTextSafe : styles.statusTextIssues,
            ]}
          >
            {isSafe ? 'No issues detected' : `${file.findingsCount} Issues Found`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => onViewReport(file.reportId)}
        >
          <Text style={styles.reportBtnText}>View Report</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  fileName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  packageName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: 'Courier',
  },
  deleteBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  metaDot: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  statusBadgeSafe: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
  },
  statusBadgeIssues: {
    backgroundColor: COLORS.criticalBg,
    borderColor: COLORS.criticalBorder,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextSafe: {
    color: COLORS.success,
  },
  statusTextIssues: {
    color: COLORS.critical,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.borderOrange,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  reportBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
