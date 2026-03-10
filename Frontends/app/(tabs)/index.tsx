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
  Image
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti'; // <-- อิมพอร์ต Moti ตรงนี้
import { useHelmetDetection } from '@/hooks/use-helmet-detection';
import {
  ImageInputSection,
  ImagePreview,
  LoadingOverlay,
  AnalyzeResult,
  BiasReportSection,
  Toast,
  ErrorCard
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
        {/* Header - Animate เข้ามาจากด้านบน */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <Image source={require('../../assets/images/happy-face.png')} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Helmet Detection AI</Text>
          <Text style={styles.headerSubtitle}>ตรวจจับหมวกกันน็อก & วิเคราะห์ Bias ด้วย AI</Text>
        </MotiView>

        {/* Image Input - Fade in จากด้านล่าง */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
        >
          <ImageInputSection onImageSelected={setPreview} onError={(msg) => showToast(msg, 'warning')} />
        </MotiView>

        {/* Preview - เด้ง (Scale) ขึ้นมาเมื่อมีรูปภาพ */}
        <AnimatePresence>
          {currentImageUri && (
            <MotiView
              key="preview"
              from={{ opacity: 0, scale: 0.8, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, scale: 0.8, height: 0, marginBottom: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <ImagePreview imageUri={currentImageUri} onClear={clearPreview} />
            </MotiView>
          )}
        </AnimatePresence>

        {/* Analyze Button - Fade in */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
        >
          <TouchableOpacity
            style={[styles.analyzeBtn, (!currentImageUri || loading) && styles.analyzeBtnDisabled]}
            onPress={analyzeImage}
            disabled={!currentImageUri || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.analyzeBtnText}>🔍 วิเคราะห์ด้วย AI</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Error - โชว์พร้อมกับเด้งเตือน (ถ้ามี) */}
        <AnimatePresence>
          {error && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring' }}
            >
              <ErrorCard message={error} />
            </MotiView>
          )}
        </AnimatePresence>

        {/* Result & Bias Report - เลื่อนขึ้นมาเมื่อวิเคราะห์เสร็จ */}
        <AnimatePresence>
          {lastResult && (
            <MotiView
              key="results"
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 30 }}
              transition={{ type: 'spring', delay: 100 }}
            >
              <AnalyzeResult data={lastResult} />
              <View style={{ height: 16 }} /> {/* เว้นระยะห่าง */}
              <BiasReportSection onReport={reportBias} />
            </MotiView>
          )}
        </AnimatePresence>

        {/* Footer */}
        <MotiView 
          from={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 800, delay: 400 }} 
          style={styles.footer}
        >
          <Text style={styles.footerText}>Powered by Google Gemini AI</Text>
          <Text style={styles.footerText}>Project Ethics — AI Bias Analysis • 2026</Text>
        </MotiView>
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
  headerIcon: {
    width: 64,
    height: 64,
    marginBottom: 12,
  }
});