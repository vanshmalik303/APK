import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RiskScore } from '../types';
import { COLORS } from '../theme/colors';

interface RiskSummaryProps {
  riskScore: RiskScore;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({ riskScore }) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const getScoreColor = () => {
    switch (riskScore.level) {
      case 'CRITICAL':
        return COLORS.critical;
      case 'HIGH':
        return COLORS.high;
      case 'MEDIUM':
        return COLORS.medium;
      case 'LOW':
        return COLORS.low;
      case 'SAFE':
      default:
        return COLORS.success;
    }
  };

  const scoreColor = getScoreColor();

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{riskScore.score}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
        </View>

        <View style={styles.scoreDetails}>
          <View style={styles.badgeRow}>
            <View style={[styles.levelBadge, { backgroundColor: `${scoreColor}20`, borderColor: scoreColor }]}>
              <Text style={[styles.levelText, { color: scoreColor }]}>{riskScore.level} RISK</Text>
            </View>
          </View>

          <Text style={styles.title}>Cumulative Threat Score</Text>
          <Text style={styles.subtitle}>
            Calculated via static rule penalty weightings against Android threat profiles.
          </Text>
        </View>
      </View>

      {/* Severity Breakdown Bar */}
      <View style={styles.breakdownGrid}>
        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownCount, { color: COLORS.critical }]}>
            {riskScore.breakdown.critical}
          </Text>
          <Text style={styles.breakdownLabel}>Critical</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownCount, { color: COLORS.high }]}>
            {riskScore.breakdown.high}
          </Text>
          <Text style={styles.breakdownLabel}>High</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownCount, { color: COLORS.medium }]}>
            {riskScore.breakdown.medium}
          </Text>
          <Text style={styles.breakdownLabel}>Medium</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownCount, { color: COLORS.low }]}>
            {riskScore.breakdown.low}
          </Text>
          <Text style={styles.breakdownLabel}>Low</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownItem}>
          <Text style={[styles.breakdownCount, { color: COLORS.info }]}>
            {riskScore.breakdown.informational}
          </Text>
          <Text style={styles.breakdownLabel}>Info</Text>
        </View>
      </View>

      {/* Methodology Accordion */}
      <TouchableOpacity
        style={styles.methodologyToggle}
        onPress={() => setShowMethodology(!showMethodology)}
      >
        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
        <Text style={styles.methodologyToggleText}>Scoring Methodology</Text>
        <Ionicons
          name={showMethodology ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {showMethodology && (
        <View style={styles.methodologyContent}>
          <Text style={styles.methodologyText}>{riskScore.methodology}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  scoreMax: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scoreDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  breakdownGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 12,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  breakdownLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  methodologyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  methodologyToggleText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  methodologyContent: {
    marginTop: 8,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  methodologyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
