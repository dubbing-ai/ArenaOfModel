'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import StarRatingComponent from './components/StarRatingComponent';
import { Button } from '@/components/ui/button';
import { SkeletonPage } from './components/SkeletonPage';
import { useRouter } from 'next/navigation';
import { AnswerType, TestState, Answer } from "@prisma/client";
import { toast,Toaster } from "sonner"
import { Progress } from "@/components/ui/progress"
import wav from "@/assets/wav.json";
import axios from 'axios'

// Define types
interface Translation {
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

interface Sample {
  id: number;
  wavId: string;
  audioUrl: string;
  name: string;
  naturalness: number;
  similarity: number;
  error: boolean;
}

type LanguageCode = 'en' | 'th';

const TTSRatingPage: React.FC = () => {

  // State
  const [language, setLanguage] = useState<LanguageCode>(localStorage.getItem('language') as LanguageCode || 'th');
  localStorage.setItem("language", language);
  
  const navigator = useRouter();
  const [uid, setuid] = useState("");
  const [state, setState] = useState<TestState>(TestState.ONE);
  const [answerType, setAnswerType] = useState<AnswerType>(AnswerType.NATURALNESS);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);

  const initData = async () => {
    setLoading(true);
    const res = await axios.post(`/api/init` , {clientId : localStorage.getItem("clientId") || ''});
    const data_format = await res.data

    // Extract the state and ensure it's properly typed
    const currentState : TestState = data_format.state as keyof typeof wav;

    setuid(data_format.clientId)
    setState(currentState)

    // change type of answer
    if (currentState === TestState.SIX || currentState === TestState.SEVEN) {
      setAnswerType(AnswerType.SIMILARITY)
      setHeaderTable(t.similarityScale)
    }

    // set samples
    if (currentState !== TestState.DONE) {
      // Create a sample for each individual item in the array
      const newSamples: Sample[] = wav[currentState].map((item, index) => ({
        id: index + 1,
        wavId: item,
        audioUrl: `/api/placeholder/${item}/320`,
        name: `Sample ${index + 1}`,
        naturalness: 0,
        similarity: 0,
        error: false,
      }));
      
      setSamples(newSamples);
    }
    else {
      navigator.push('done');
    }

    // set localStorage
    localStorage.setItem("clientId", data_format.clientId);
    setLoading(false);
  }

  const putScore = async () => {
    setLoading(true);
    const newAnswers: Answer[] = await samples.map((sample) => ({
      type: answerType,
      wavId: sample.wavId,
      score: answerType === AnswerType.NATURALNESS ? sample.naturalness : sample.similarity
    }));
    
    const res = await axios.post(`/api/ratings`, {clientId: uid, testState: state, answers: newAnswers});
    const data_format = await res.data;
    initData();
    setLoading(false);
  }

  const progressCalculation = () => {
    switch (state){
      case TestState.ONE:
        return 0;
      case TestState.TWO:
        return 1;
      case TestState.THREE:
        return 2;
      case TestState.FOUR:
        return 3;
      case TestState.FIVE:
        return 4;
      case TestState.SIX:
        return 5;
      case TestState.SEVEN:
        return 6;
      default:
        return 0;
    }
  }
  useEffect(() => {
    initData()
  }, []);
  
  // Translations
  const translations = {
    en: {
      title: 'TTS Comparison and Rating',
      inferencedText: 'Inferenced Text',
      referenceVoice: 'Reference Voice',
      audioSample: 'Audio Sample',
      audio: 'Audio',
      naturalness: 'Naturalness',
      similarity: 'Similarity',
      next: 'Next',
      instructions: 'Rating Instructions:',
      step1: '1. First listen to the Reference Voice at the top right',
      step2: '2. Then listen to each Audio Sample below',
      step3: '3. Rate each sample on two criteria:',
      naturalDesc: 'Naturalness: How natural the voice sounds (1 = robotic, 5 = human-like)',
      similarityDesc:
        'Similarity: How similar the voice is to the reference (1 = different person, 5 = same person)',
      naturalScale: '(1 = robotic, 5 = completely natural)',
      similarityScale: '(1 = different person, 5 = same person)',
      loading: 'Submitting your score... please wait.',
      success: 'Score submitted successfully',
      error: 'Error',
      errorRate: 'Please rate all samples before proceeding.',
      progress: 'Progress',
    },
    th: {
      title: 'การเปรียบเทียบและการให้คะแนน TTS',
      inferencedText: 'ข้อความที่ใช้ทดสอบ',
      referenceVoice: 'เสียงอ้างอิง',
      audioSample: 'ตัวอย่างเสียง',
      audio: 'เสียง',
      naturalness: 'ความเป็นธรรมชาติ',
      similarity: 'ความคล้ายคลึง',
      next: 'ถัดไป',
      instructions: 'คำแนะนำในการให้คะแนน:',
      step1: '1. ฟังเสียงอ้างอิงที่มุมบนขวาก่อน',
      step2: '2. จากนั้นฟังตัวอย่างเสียงแต่ละชิ้นด้านล่าง',
      step3: '3. ให้คะแนนแต่ละตัวอย่างตามเกณฑ์สองข้อ:',
      naturalDesc:
        'ความเป็นธรรมชาติ: เสียงฟังดูเป็นธรรมชาติแค่ไหน (1 = เหมือนหุ่นยนต์, 5 = เหมือนมนุษย์)',
      similarityDesc:
        'ความคล้ายคลึง: เสียงมีความคล้ายคลึงกับเสียงอ้างอิงแค่ไหน (1 = คนละคน, 5 = คนเดียวกัน)',
      naturalScale: '(1 = เหมือนหุ่นยนต์, 5 = เป็นธรรมชาติอย่างสมบูรณ์)',
      similarityScale: '(1 = คนละคน, 5 = คนเดียวกัน)',
      loading: 'กำลังส่งคะแนนของคุณ... กรุณารอสักครู่',
      success: 'ส่งคะแนนเรียบร้อยแล้ว',
      error: 'เกิดข้อผิดพลาด',
      errorRate: 'กรุณาให้คะแนนตัวอย่างทั้งหมดก่อนดำเนินการต่อ',
      progress: 'ความก้าวหน้า',
    },
  };

  const t: Translation = translations[language]; // Current translation
  const [headerTable, setHeaderTable] = useState<string>(t.naturalScale);

  useEffect(() => {
    if (state === TestState.SIX || state === TestState.SEVEN) {
      setHeaderTable(t.similarityScale)
    }
    else{
      setHeaderTable(t.naturalScale)
    }
  }, [t]);

  //Check score
  const checkScoreValid = (): boolean => {
    // First, collect all samples that have validation errors
    const samplesWithErrors = samples.filter(
      sample => answerType === AnswerType.NATURALNESS ? sample.naturalness === 0 : sample.similarity === 0
    );
    
    // Then, make a single state update with all errors marked appropriately
    setSamples(prevSamples => {
      return prevSamples.map(sample => {
        // First reset all errors
        const updatedSample = { ...sample, error: false };
        
        // Then set error flag for invalid samples
        if (samplesWithErrors.some(errorSample => errorSample.id === sample.id)) {
          updatedSample.error = true;
        }
        
        return updatedSample;
      });
    });
    
    // Return whether all samples are valid
    return samplesWithErrors.length === 0;
  }

  //Handle clickNext
  const handleClickNext = () => {
    if (checkScoreValid()) {

      // Scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // For smooth scrolling; use 'auto' for instant scrolling
      });

      // toast promise
      toast.promise(putScore(), {
        loading: t.loading,
        success: t.success,
        error: t.error,
      });

    } else {
      toast.error(t.errorRate);
    }
  }

  // The actual text content being spoken in the audio samples
  const inferencedText =
    'The rainbow arched across the sky after the storm, painting the world in vibrant colors. Birds began to sing again as sunshine broke through the clouds, creating a perfect moment of natural beauty.';

  // Update ratings
  const updateRating = (
    sampleId: number,
    category: 'naturalness' | 'similarity',
    value: number
  ): void => {
    setSamples(
      samples.map((sample) => (sample.id === sampleId ? { ...sample, [category]: value } : sample))
    );
  };
  

  return (
    <div className="">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white flex flex-col border-b border-gray-300">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-center truncate whitespace-nowrap overflow-hidden">
              {t.title}
            </h1>

            {/* Language Toggle */}
            <div className="flex items-center space-x-2">
              <Globe size={20} className="text-gray-600" />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as LanguageCode);
                  localStorage.setItem("language", e.target.value);
                }}
                className="bg-white border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="th">ไทย</option>
              </select>
            </div>
          </div>
          <div className="text-xl font-bold mb-2">{t.progress}</div>
          <Progress value={(progressCalculation() / 7) * 100} />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto p-6 max-w-6xl">

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm">
          <h3 className="text-blue-800 font-bold text-lg mb-2">{t.instructions}</h3>
          <ul className="space-y-2 text-blue-900">
            <li className="flex items-start">
              <span className="font-medium">{t.step1}</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium">{t.step2}</span>
            </li>
            <li className="flex flex-col sm:flex-row items-start">
              <span className="font-medium">{t.step3}</span>
              <ul className="ml-6 mt-1 space-y-1">
                <li className="text-sm">• {t.naturalDesc}</li>
                <li className="text-sm">• {t.similarityDesc}</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Top section */}
        <div className="grid gird-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4 shadow bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold mb-2 text-blue-700 border-b pb-2">{t.inferencedText}</h2>
            <p className="text-gray-700">{inferencedText}</p>
          </div>

          <div className="border rounded-lg p-4 shadow">
            <h2 className="text-center sm:text-left text-lg font-semibold mb-2">{t.referenceVoice}</h2>
            <div className="mt-4">
              <audio controls className="w-full">
                <source src="/api/placeholder/400/320" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <SkeletonPage/>
        ) : (
        <>
          <div className="w-full">

            {/* Comparison table header - same column structure as rows */}
            <div className="grid grid-cols-3 gap-4 mb-4 font-semibold text-center md:grid">
              {/* Desktop view */}
              <div className="hidden md:block text-left pl-4">{t.audioSample}</div>
              <div className="hidden md:block">{t.audio}</div>
              <div className="hidden md:block">
                {answerType === AnswerType.NATURALNESS ? t.naturalness : t.similarity}
                <span className="block text-xs font-normal text-gray-500 mt-1">{headerTable}</span>
              </div>

              {/* Mobile view */}
              <div className="block md:hidden col-span-3 text-center">
                {answerType === AnswerType.NATURALNESS ? t.naturalness : t.similarity}
                <span className="block text-xs font-normal text-gray-500 mt-1">{headerTable}</span>
              </div>
            </div>


            {/* Comparison rows */}
            <div className="space-y-4">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border rounded-lg p-4 shadow"
                >
                  <div className="text-center md:text-left font-medium">
                    {sample.name}
                  </div>
                  
                  <div className="flex justify-center">
                    <audio controls className="w-full">
                      <source src={sample.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <div className="flex justify-center">
                    <StarRatingComponent
                      error={sample.error}
                      rating={answerType === AnswerType.NATURALNESS ? sample.naturalness : sample.similarity}
                      onRatingChange={(value) => updateRating(sample.id, answerType === AnswerType.NATURALNESS ? 'naturalness' : "similarity", value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
        )}
        {/* Next button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleClickNext}
            className='bg-blue-500 hover:bg-blue-700'
          >
            Next
          </Button>
        </div>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default TTSRatingPage;
