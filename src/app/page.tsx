'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import StarRatingComponent from './components/StarRatingComponent';
// import Button from './components/Button';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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
}

interface Sample {
  id: number;
  audioUrl: string;
  name: string;
  naturalness: number;
  similarity: number;
  error: boolean;
}

type LanguageCode = 'en' | 'th';

const TTSRatingPage: React.FC = () => {
  // Language state
  const [language, setLanguage] = useState<LanguageCode>('en');

  const navigator = useRouter();

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
    },
  };

  const t: Translation = translations[language]; // Current translation

  // Sample data - in a real app, this would come from your backend
  const [samples, setSamples] = useState<Sample[]>([
    {
      id: 1,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 1',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
    {
      id: 2,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 2',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
    {
      id: 3,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 3',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
    {
      id: 4,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 4',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
    {
      id: 5,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 5',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
    {
      id: 6,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 6',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
    {
      id: 7,
      audioUrl: '/api/placeholder/400/320',
      name: 'Sample 7',
      naturalness: 0,
      similarity: 0,
      error: false,
    },
  ]);

  //Check score
  const checkScoreValid = (): boolean => {
    // First, collect all samples that have validation errors
    const samplesWithErrors = samples.filter(
      sample => sample.naturalness === 0 || sample.similarity === 0
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
      navigator.push('home');
      console.log('All samples rated:', samples);
    } else {
      console.log('All samples rated:', samples);
      alert('Please rate all samples before proceeding.');
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-center">{t.title}</h1>

        {/* Language Toggle */}
        <div className="flex items-center space-x-2">
          <Globe size={20} className="text-gray-600" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-white border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
        </div>
      </div>

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
          <li className="flex items-start">
            <span className="font-medium">{t.step3}</span>
            <ul className="ml-6 mt-1 space-y-1">
              <li className="text-sm">• {t.naturalDesc}</li>
              <li className="text-sm">• {t.similarityDesc}</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Top section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4 shadow bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold mb-2 text-blue-700 border-b pb-2">{t.inferencedText}</h2>
          <p className="text-gray-700">{inferencedText}</p>
        </div>

        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">{t.referenceVoice}</h2>
          <div className="mt-4">
            <audio controls className="w-full">
              <source src="/api/placeholder/400/320" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </div>

      {/* Comparison table header */}
      <div className="grid grid-cols-4 gap-4 mb-2 font-semibold text-center">
        <div className="text-left pl-4">{t.audioSample}</div>
        <div>{t.audio}</div>
        <div>
          {t.naturalness}
          <span className="block text-xs font-normal text-gray-500 mt-1">{t.naturalScale}</span>
        </div>
        <div>
          {t.similarity}
          <span className="block text-xs font-normal text-gray-500 mt-1">{t.similarityScale}</span>
        </div>
      </div>

      {/* Comparison rows */}
      <div className="space-y-4">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="grid grid-cols-4 gap-4 items-center border rounded-lg p-4 shadow"
          >
            <div className="font-medium">{sample.name}</div>

            <div className="flex justify-center">
              <audio controls className="w-full">
                <source src={sample.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>

            <div className="flex justify-center">
              <StarRatingComponent
                error ={sample.error}
                rating={sample.naturalness}
                onRatingChange={(value) => updateRating(sample.id, 'naturalness', value)}
              />
            </div>

            <div className="flex justify-center">
              <StarRatingComponent
                error ={sample.error}
                rating={sample.similarity}
                onRatingChange={(value) => updateRating(sample.id, 'similarity', value)}
              />
            </div>
          </div>
        ))}
      </div>

      {samples.map((sample) => {
        return <>{sample.error ? 't' : 'f'}</>
      }) }

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleClickNext}
          className='bg-blue-500 hover:bg-blue-700'
        >
          Next
        </Button>
      </div>

    </div>
  );
};

export default TTSRatingPage;
