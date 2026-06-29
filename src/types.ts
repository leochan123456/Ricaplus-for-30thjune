export interface PresetScenario {
  id: number;
  title: string;
  targetAudience: string;
  platform: string;
  language: 'zh-Hant-HK' | 'zh-Hans';
  landmarks: string[];
  defaultPrice: number; // Market average for deviation checks
  defaultArea: number; // in sq.ft.
  defaultPropertyID: string;
  copywriting: string;
  chaosInput: string;
}

export interface ComplianceStatus {
  passed: boolean;
  priceDeviation: number; // percentage
  priceDeviationViolation: boolean; // if > 20%
  redirectFiltered: boolean; // if WeChat/phone/WhatsApp numbers were replaced
  originalContactRemoved: string[]; // names of filtered words
  legalPreambleAdded: boolean;
  fallbacksApplied: {
    priceNull: boolean;
    propertyIDNull: boolean;
    mediaFilesNull: boolean;
  };
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  choices: {
    text: string;
    isCorrect: boolean;
  }[];
  rationale: string;
}
