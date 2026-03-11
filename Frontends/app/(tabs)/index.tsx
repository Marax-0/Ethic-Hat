/**
 * Helmet Detection AI — หน้าหลัก
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
  Animated, 
  StyleProp,
  ViewStyle,
  Modal // 👈 1. Import Modal เพิ่มเข้ามา
} from 'react-native';
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

// ---------------------------------------------------------
// 🛠 สร้าง Component ตัวช่วยทำ Fade-in
// ---------------------------------------------------------
const FadeInView = ({ 
  children, 
  style, 
  delay = 0, 
  translateY = 20 
}: { 
  children: React.ReactNode; 
  style?: StyleProp<ViewStyle>;
  delay?: number;
  translateY?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(translateY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true, 
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      })
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// ---------------------------------------------------------
// 🚀 หน้าจอหลัก
// ---------------------------------------------------------
export default function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const [scrollEnabled, setScrollEnabled] = useState(false);

  // ---------------------------------------------------------
  // 📜 State สำหรับ Policy Popup
  // ---------------------------------------------------------
  const [showPolicy, setShowPolicy] = useState(true); // ตั้งค่าเริ่มต้นให้โชว์ Popup ทันทีที่เข้าแอป
  const [isAgreed, setIsAgreed] = useState(false);    // State สำหรับเช็กว่าติ๊กยอมรับหรือยัง

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
        {/* Header - Fade in จากด้านบน */}
        <FadeInView translateY={-20} style={styles.header}>
          <Image source={require('../../assets/images/happy-face.png')} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Helmet Detection AI</Text>
          <Text style={styles.headerSubtitle}>ตรวจจับหมวกกันน็อก & วิเคราะห์ Bias ด้วย AI</Text>
        </FadeInView>

        {/* Image Input */}
        <FadeInView delay={100}>
          <ImageInputSection onImageSelected={setPreview} onError={(msg) => showToast(msg, 'warning')} />
        </FadeInView>

        {/* Preview */}
        {currentImageUri && (
          <FadeInView delay={0} translateY={10} style={{ marginBottom: 16 }}>
            <ImagePreview imageUri={currentImageUri} onClear={clearPreview} />
          </FadeInView>
        )}

        {/* Analyze Button */}
        <FadeInView delay={200}>
          <TouchableOpacity
            style={[styles.analyzeBtn, (!currentImageUri || loading) && styles.analyzeBtnDisabled]}
            onPress={analyzeImage}
            disabled={!currentImageUri || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.analyzeBtnText}>Check Handsome</Text>
          </TouchableOpacity>
        </FadeInView>

        {/* Error */}
        {error && (
          <FadeInView translateY={10}>
            <ErrorCard message={error} />
          </FadeInView>
        )}

        {/* Result & Bias Report */}
        {lastResult && (
          <FadeInView delay={100} translateY={30}>
            <AnalyzeResult data={lastResult} />
            <View style={{ height: 16 }} />
            <BiasReportSection onReport={reportBias} />
          </FadeInView>
        )}

        {/* Footer */}
        <FadeInView delay={400} translateY={0} style={styles.footer}>
          <Text style={styles.footerText}>Powered by Google Gemini AI</Text>
          <Text style={styles.footerText}>Project Ethics — AI Bias Analysis • 2026</Text>
        </FadeInView>
      </ScrollView>

      {/* --------------------------------------------------------- */}
      {/* 📜 Policy Popup Modal */}
      {/* --------------------------------------------------------- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPolicy}
        onRequestClose={() => {
          // ป้องกันการกดปุ่ม Back บน Android เพื่อหนี Popup (บังคับให้อ่านและกดยอมรับ)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>นโยบายการใช้งาน</Text>
            
            <ScrollView style={styles.policyScroll}>
              <Text style={styles.policyText}>
                แอปพลิเคชันนี้มีการใช้งานระบบ AI เพื่อประมวลผลรูปภาพของคุณ โปรดอ่านและทำความเข้าใจเงื่อนไขก่อนใช้งาน:
                {"\n\n"}
                <Text style={{ fontWeight: 'bold', color: '#1E3A8A' }}>1. การจัดเก็บข้อมูล:</Text> รูปภาพที่คุณอัปโหลดจะถูกส่งไปยังระบบ AI เพื่อทำการวิเคราะห์เท่านั้น เราจะไม่มีการบันทึกภาพของคุณลงในเซิร์ฟเวอร์ของเรา
                {"\n\n"}
                <Text style={{ fontWeight: 'bold', color: '#1E3A8A' }}>2. ความแม่นยำ:</Text> ผลลัพธ์จากการวิเคราะห์ของ AI อาจมีความคลาดเคลื่อนได้ ไม่สามารถใช้เป็นหลักฐานทางกฎหมายได้ 100%
                {"\n\n"}
                <Text style={{ fontWeight: 'bold', color: '#1E3A8A' }}>3. ข้อมูลส่วนบุคคล:</Text> กรุณาหลีกเลี่ยงการอัปโหลดรูปภาพที่มีข้อมูลส่วนบุคคลที่ละเอียดอ่อน หรือข้อมูลที่อาจระบุตัวตนบุคคลอื่นโดยไม่ได้รับอนุญาต
              </Text>
            </ScrollView>

            {/* Checkbox Area */}
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setIsAgreed(!isAgreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isAgreed && styles.checkboxChecked]}>
                {isAgreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>ฉันได้อ่านและยอมรับเงื่อนไขทั้งหมด</Text>
            </TouchableOpacity>

            {/* Accept Button */}
            <TouchableOpacity
              style={[styles.acceptBtn, !isAgreed && styles.acceptBtnDisabled]}
              onPress={() => {
                if (isAgreed) setShowPolicy(false); // ปิด Popup เมื่อกดยอมรับ
              }}
              disabled={!isAgreed}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptBtnText}>เข้าสู่แอปพลิเคชัน</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Toast message={toast?.message || ''} type={toast?.type || 'success'} visible={!!toast} />

      {/* Full-screen loading overlay */}
      {loading && <LoadingOverlay />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... (สไตล์เดิมของคุณที่อยู่ด้านบน)
  container: {
    flex: 1,
    backgroundColor: '#131313', // เทาอ่อนสบายตา
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24, 
    paddingBottom: 40,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28, 
    fontWeight: '800',
    color: '#ffffff', 
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#64748B', 
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  analyzeBtn: {
    backgroundColor: '#1E3A8A', 
    borderRadius: 12, 
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  analyzeBtnDisabled: {
    backgroundColor: '#94A3B8', 
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', 
    marginTop: 20,
  },
  footerText: { 
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  headerIcon: {
    width: 72, 
    height: 72,
    marginBottom: 16,
  },

  // ---------------------------------------------------------
  // 🎨 สไตล์สำหรับ Policy Popup (Minimal Luxury)
  // ---------------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // สีพื้นหลังจางๆ เป็นโทนสีกรมท่าเข้ม
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A', // น้ำเงินเข้มจัด
    marginBottom: 16,
    textAlign: 'center',
  },
  policyScroll: {
    backgroundColor: '#F8FAFC', // เทาอ่อนมากๆ สบายตา
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    maxHeight: 300, 
  },
  policyText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#1E3A8A', // ถ้ายอมรับแล้ว เปลี่ยนเป็นสีน้ำเงินเข้ม
    borderColor: '#1E3A8A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#334155',
    flex: 1, // ป้องกันข้อความล้นทะลุจอ
  },
  acceptBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptBtnDisabled: {
    backgroundColor: '#CBD5E1', // ปุ่มเทาถ้ายังไม่ติ๊กยอมรับ
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});