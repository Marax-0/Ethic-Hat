/**
 * Types for Helmet Detection API
 */
export type BadgeType = 'yes' | 'no' | 'unknown';

export interface AnalyzeResult {
  success: boolean;
  decision: string;
  confidence: number;
  bias_analysis: string;
  badge: BadgeType;
}
