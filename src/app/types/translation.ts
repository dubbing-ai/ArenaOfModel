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
  step3Label1: string;
  step3Label2: string;
  step3Label3: string;
  step3Label4: string;
  step3Label5: string;
  step4: string;
  step4Label1: string;
  step4Label2: string;
  step4Label3: string;
  step4Label4: string;
  step4Label5: string;
  loading: string;
  success: string;
  error: string;
  errorRate: string;
  progress: string;
}

export type LanguageCode = "en" | "th";
