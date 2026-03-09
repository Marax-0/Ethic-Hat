/**
 * Hook สำหรับ Helmet Detection - จัดการ state และ API calls
 */
import { useState, useCallback } from 'react';
import { ENDPOINTS } from '@/constants/api';
import type { AnalyzeResult } from '@/types/helmet';

export type ToastType = 'success' | 'error' | 'warning';

export function useHelmetDetection() {
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [lastResult, setLastResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const clearPreview = useCallback(() => {
    setCurrentImageUri(null);
    setCurrentFile(null);
    setLastResult(null);
    setError(null);
  }, []);

  const setPreview = useCallback((uri: string, file: { uri: string; name: string; type: string }) => {
    setCurrentImageUri(uri);
    setCurrentFile(file);
    setError(null);
    setLastResult(null);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!currentFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: currentFile.uri,
        name: currentFile.name,
        type: currentFile.type,
      } as unknown as Blob);

      const response = await fetch(ENDPOINTS.analyze, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' }));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }

      const data: AnalyzeResult = await response.json();
      setLastResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(`❌ เกิดข้อผิดพลาด: ${message}`);
      console.error('Analyze error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFile]);

  const reportBias = useCallback(async (feedback: string) => {
    if (!feedback.trim()) {
      showToast('⚠️ กรุณากรอกเหตุผลก่อนส่ง', 'warning');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('feedback', feedback.trim());
      if (lastResult) {
        formData.append('decision', lastResult.decision || '');
        formData.append('confidence', String(lastResult.confidence || 0));
      }

      const response = await fetch(ENDPOINTS.reportBias, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'เกิดข้อผิดพลาด' }));
        throw new Error(err.detail);
      }

      showToast('✅ ขอบคุณ! ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      showToast(`❌ ${message}`, 'error');
      return false;
    }
  }, [lastResult, showToast]);

  return {
    currentImageUri,
    currentFile,
    lastResult,
    loading,
    error,
    toast,
    showToast,
    setPreview,
    clearPreview,
    analyzeImage,
    reportBias,
    setError,
  };
}
