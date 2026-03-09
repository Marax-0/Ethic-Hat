/**
 * LoadingOverlay - แสดงสถานะกำลังวิเคราะห์
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';

export function LoadingOverlay() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}>🔍</Animated.Text>
        <Text style={styles.loadingText}>AI กำลังวิเคราะห์ภาพ...</Text>
        <Text style={styles.loadingSub}>กำลังส่งข้อมูลไปยัง Google Gemini Vision API</Text>
        <ActivityIndicator size="small" color="#a78bfa" style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 12, 41, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
  },
  spinner: {
    marginTop: 12,
  },
  emoji: {
    fontSize: 48,
  },
  loadingText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 12,
  },
  loadingSub: {
    color: '#707090',
    fontSize: 13,
    marginTop: 4,
  },
});
