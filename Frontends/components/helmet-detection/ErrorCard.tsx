/**
 * ErrorCard - แสดงข้อความ error
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorCardProps {
  message: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.3)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  text: {
    color: '#ff8a80',
    fontSize: 14,
    textAlign: 'center',
  },
});
