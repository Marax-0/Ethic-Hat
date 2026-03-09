/**
 * ImageInputSection - เลือกรูปจากกล้องหรือแกลเลอรี่
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageInputSectionProps {
  onImageSelected: (uri: string, file: { uri: string; name: string; type: string }) => void;
  onError: (message: string) => void;
}

export function ImageInputSection({ onImageSelected, onError }: ImageInputSectionProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        onError('กรุณาอนุญาตการใช้กล้องในการตั้งค่าแอป');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: `camera-capture-${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
      }
    } catch (e) {
      console.warn('Camera not available, falling back to gallery', e);
      onError('กล้องไม่พร้อมใช้งานบนอุปกรณ์นี้\nลองเลือกภาพจากแกลเลอรี่แทน');
      await launchGallery();
    }
  };

  const launchGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      onError('กรุณาอนุญาตการเข้าถึงแกลเลอรี่ในการตั้งค่าแอป');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      onImageSelected(asset.uri, {
        uri: asset.uri,
        name: `image-${Date.now()}.${ext}`,
        type: mime,
      });
    }
  };

  const handleTabPress = (tab: 'camera' | 'gallery') => {
    setActiveTab(tab);
    if (tab === 'camera') {
      launchCamera();
    } else {
      launchGallery();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>📸 เลือกรูปภาพ</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'camera' && styles.tabActive]}
          onPress={() => handleTabPress('camera')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>
            📷 กล้องถ่ายรูป
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gallery' && styles.tabActive]}
          onPress={() => handleTabPress('gallery')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'gallery' && styles.tabTextActive]}>
            🖼️ อัปโหลด
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.uploadArea}>
        <Text style={styles.uploadIcon}>🖼️</Text>
        <Text style={styles.uploadText}>แตะปุ่มด้านบนเพื่อเลือกรูปจากกล้องหรือแกลเลอรี่</Text>
        <Text style={styles.uploadHint}>รองรับ JPG, PNG</Text>
      </View>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#7b2ff7',
    shadowColor: '#7b2ff7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    color: '#a0a0c0',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    color: '#a0a0c0',
    fontSize: 14,
    textAlign: 'center',
  },
  uploadHint: {
    color: '#707090',
    fontSize: 12,
    marginTop: 4,
  },
});
