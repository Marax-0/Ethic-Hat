/**
 * AnalyzeResult - แสดงผลการวิเคราะห์
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import type { AnalyzeResult as AnalyzeResultType, BadgeType } from '@/types/helmet';

interface AnalyzeResultProps {
  data: AnalyzeResultType;
}

const ICON_MAP: Record<BadgeType, string> = {
  yes: '✅',
  no: '❌',
  unknown: '⚠️',
};

const BADGE_STYLES: Record<BadgeType, { backgroundColor: string; color?: string }> = {
  yes: { backgroundColor: '#00c853' },
  no: { backgroundColor: '#ff1744' },
  unknown: { backgroundColor: '#ff9100' },
};

export function AnalyzeResult({ data }: AnalyzeResultProps) {
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    barWidth.setValue(0);
    Animated.timing(barWidth, {
      toValue: data.confidence,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [data.confidence, barWidth]);

  const conf = data.confidence;
  const confSafe = Math.max(conf, 1);
  let barColor = '#ff5252';
  if (conf >= 80) barColor = '#00c853';
  else if (conf >= 50) barColor = '#ff9100';

  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>📊 ผลการวิเคราะห์</Text>

      <View style={styles.resultCenter}>
        <Text style={styles.resultIcon}>{ICON_MAP[data.badge] || '⚠️'}</Text>
        <View style={[styles.badge, BADGE_STYLES[data.badge] || BADGE_STYLES.unknown]}>
          <Text style={[styles.badgeText, data.badge === 'yes' && { color: '#003d00' }, data.badge === 'unknown' && { color: '#3e2700' }]}>
            {data.decision}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence Score</Text>
        <Text style={styles.confidenceValue}>{conf}%</Text>
        <View style={styles.confidenceBarBg}>
          <Animated.View
            style={[
              styles.confidenceBarFill,
              {
                width: barWidth.interpolate({
                  inputRange: [0, confSafe],
                  outputRange: ['0%', `${conf}%`],
                }),
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.cardTitle}>🧠 การวิเคราะห์ Bias</Text>
      <Text style={styles.biasText}>{data.bias_analysis}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  resultCenter: {
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(167, 139, 250, 0.3)',
    marginVertical: 16,
  },
  confidenceContainer: {
    marginVertical: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    color: '#c0c0e0',
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7b2ff7',
    marginTop: 4,
  },
  confidenceBarBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    height: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  biasText: {
    color: '#d0d0f0',
    fontSize: 15,
    lineHeight: 24,
  },
});
