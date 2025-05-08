"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { LanguageCode } from "../types/translation";

export default function ClosePage() {
  const [language, setLanguage] = useState<LanguageCode | undefined>();

  const translations = {
    en: {
      title: "This Platform is Now Closed",
      message: "Thank you for your interest in our TTS Model Rating platform.",
      details:
        "The data collection period has ended. We appreciate all participants who contributed to our research.",
      contact: "If you have any questions, please contact the research team.",
    },
    th: {
      title: "แพลตฟอร์มนี้ปิดให้บริการแล้ว",
      message: "ขอบคุณสำหรับความสนใจในแพลตฟอร์มการให้คะแนนโมเดล TTS ของเรา",
      details:
        "ช่วงเวลาการเก็บข้อมูลสิ้นสุดลงแล้ว เราขอขอบคุณผู้เข้าร่วมทุกท่านที่มีส่วนร่วมในงานวิจัยของเรา",
      contact: "หากมีคำถามใด ๆ กรุณาติดต่อทีมวิจัย",
    },
  };

  useEffect(() => {
    const lang = localStorage.getItem("language");
    if (!lang) {
      localStorage.setItem("language", "th");
      setLanguage("th");
    } else setLanguage(lang as LanguageCode);
  }, [language]);

  // Handle language change
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  if (!language) return <div>Loading...</div>;

  const text = translations[language];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      {/* Language Toggle in top right */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Globe size={20} className="text-gray-600" />
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
          className="bg-white border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="th">ไทย</option>
        </select>
      </div>

      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-red-600">{text.title}</h1>
        <p className="text-xl">{text.message}</p>
        <p className="text-lg">{text.details}</p>
        <p className="text-md text-gray-600">{text.contact}</p>
      </div>
    </main>
  );
}
