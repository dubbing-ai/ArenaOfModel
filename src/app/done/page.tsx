"use client";

import React, { useEffect, useState } from "react";
import { LanguageCode } from "../types/translation";

export default function ThankYouPage() {
  const [language, setLanguage] = useState<LanguageCode | undefined>();
  const translations = {
    en: {
      first: "🎉 Thank You!",
      second: "We really appreciate you taking the time to score our project.",
      third: "Your feedback helps us improve and grow.",
    },
    th: {
      first: "🎉 ขอบคุณ!",
      second: "เราขอขอบคุณที่สละเวลาให้คะแนนโครงการของเรา",
      third: "ข้อเสนอแนะแบบนี้ช่วยให้เราพัฒนาและเติบโตได้",
    },
  };

  useEffect(() => {
    const lang = localStorage.getItem("language");
    if (!lang) {
      localStorage.setItem("language", "th");
      setLanguage("th");
    } else setLanguage(localStorage.getItem("language") as LanguageCode);
  }, [language]);

  if (!language) return <div>Loading...</div>;

  const text = translations[language];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-bold">{text.first}</h1>
        <p className="text-lg">{text.second}</p>
        <p className="text-md text-gray-600">{text.third}</p>
      </div>
    </main>
  );
}
