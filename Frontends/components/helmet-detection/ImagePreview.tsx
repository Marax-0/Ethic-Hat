/**
 * ImagePreview - แสดงภาพที่เลือก
 */
import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ImagePreviewProps {
  imageUri: string;
  onClear?: () => void;
}

export function ImagePreview({ imageUri, onClear }: ImagePreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Photo Selected</Text>
        {onClear && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.clearText}>✕ ลบ</Text>
          </TouchableOpacity>
        )}
      </View>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b2350',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    color: '#ff8a80',
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 14,
  },
});
