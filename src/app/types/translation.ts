export interface TranslationFirstPage {
  title: string;
  inferencedText: string;
  referenceVoice: string;
  audioSample: string;
  audio: string;
  naturalness: string;
  similarity: string;
  next: string;
  instructions: string;
  step1: string;
  step2: string;
  step2Similarity: string;
  step2Naturalness: string;
  step3: string;
  naturalDesc: string;
  similarityDesc: string;
  naturalScale: string;
  similarityScale: string;
  loading: string;
  success: string;
  error: string;
  errorRate: string;
  progress: string;
}

export type LanguageCode = "en" | "th";
