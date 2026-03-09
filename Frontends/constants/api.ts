/**
 * API Configuration for Helmet Detection
 * สำหรับอุปกรณ์จริง ให้เปลี่ยน API_BASE เป็น IP เครื่องคอม เช่น http://192.168.1.100:8000
 */
import { Platform } from 'react-native';

// Android emulator: 10.0.2.2, iOS simulator: localhost, 设备: your computer's IP
const getApiBase = () => {
  if (__DEV__) {
    return Platform.select({
      android: 'http://10.0.2.2:8000',
      ios: 'http://localhost:8000',
      default: 'http://localhost:8000',
    }) || 'http://localhost:8000';
  }
  // Production - ใส่ URL ของ API จริง
  return 'https://your-api-domain.com';
};

export const API_BASE = getApiBase();

export const ENDPOINTS = {
  analyze: `${API_BASE}/analyze`,
  reportBias: `${API_BASE}/report-bias`,
} as const;
