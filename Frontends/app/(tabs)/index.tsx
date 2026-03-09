/**
 * Helmet Detection AI — หน้าหลัก
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useHelmetDetection } from '@/hooks/use-helmet-detection';
import {
  ImageInputSection,
  ImagePreview,
  LoadingOverlay,
  AnalyzeResult,
  BiasReportSection,
  Toast,
  ErrorCard,
} from '@/components/helmet-detection';

export default function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const {
    currentImageUri,
    lastResult,
    loading,
    error,
    toast,
    showToast,
    setPreview,
    clearPreview,
    analyzeImage,
    reportBias,
  } = useHelmetDetection();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(_w, h) => {
          setScrollEnabled(h > windowHeight);
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🏍️</Text>
          <Text style={styles.headerTitle}>Helmet Detection AI</Text>
          <Text style={styles.headerSubtitle}>ตรวจจับหมวกกันน็อก & วิเคราะห์ Bias ด้วย AI</Text>
        </View>

        {/* Image Input */}
        <ImageInputSection onImageSelected={setPreview} onError={(msg) => showToast(msg, 'warning')} />

        {/* Preview */}
        {currentImageUri && (
          <ImagePreview imageUri={currentImageUri} onClear={clearPreview} />
        )}

        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, (!currentImageUri || loading) && styles.analyzeBtnDisabled]}
          onPress={analyzeImage}
          disabled={!currentImageUri || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.analyzeBtnText}>🔍 วิเคราะห์ด้วย AI</Text>
        </TouchableOpacity>

        {/* Error */}
        <ErrorCard message={error || ''} />

        {/* Result */}
        {lastResult && <AnalyzeResult data={lastResult} />}

        {/* Bias Report */}
        {lastResult && (
          <BiasReportSection onReport={reportBias} />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Google Gemini AI</Text>
          <Text style={styles.footerText}>Project Ethics — AI Bias Analysis • 2026</Text>
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        visible={!!toast}
      />

      {/* Full-screen loading overlay */}
      {loading && <LoadingOverlay />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  headerIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#a0a0c0',
    fontSize: 14,
    marginTop: 6,
  },
  analyzeBtn: {
    backgroundColor: '#7b2ff7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7b2ff7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  analyzeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: '#505070',
    fontSize: 12,
    marginBottom: 4,
  },
});
