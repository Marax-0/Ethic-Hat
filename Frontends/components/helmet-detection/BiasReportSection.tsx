/**
 * BiasReportSection - แจ้ง Bias / ส่งความคิดเห็น
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface BiasReportSectionProps {
  onReport: (feedback: string) => Promise<boolean>;
}

export function BiasReportSection({ onReport }: BiasReportSectionProps) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    const success = await onReport(feedback);
    setSubmitting(false);
    if (success) setFeedback('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>🚩 แจ้ง Bias / ความคิดเห็น</Text>
      <Text style={styles.hint}>
        หากคุณคิดว่า AI ตัดสินใจผิดพลาดหรือมีอคติ สามารถแจ้งเหตุผลได้ที่นี่
      </Text>
      <TextInput
        style={styles.textarea}
        placeholder="เช่น AI ตัดสินว่าสวมหมวกกันน็อกแต่จริงๆ เป็นหมวกก่อสร้าง..."
        placeholderTextColor="#606080"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!submitting}
      />
      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {submitting ? '⏳ กำลังส่ง...' : '📩 ส่งข้อมูลแจ้ง Bias'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  hint: {
    color: '#a0a0c0',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 20,
  },
  textarea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    color: '#e0e0ff',
    fontSize: 15,
    padding: 14,
    minHeight: 100,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#7b2ff7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
