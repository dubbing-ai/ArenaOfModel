"use client";

import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import StarRatingComponent from "./components/StarRatingComponent";
import { Button } from "@/components/ui/button";
import { SkeletonPage } from "./components/SkeletonPage";
import { useRouter } from "next/navigation";
import { AnswerType, TestState, Answer } from "@prisma/client";
import { toast, Toaster } from "sonner";
import { Progress } from "@/components/ui/progress";
import wav from "@/assets/wav.json";
import axios from "axios";
import { LanguageCode, TranslationFirstPage } from "./types/translation";
import refVoiceState from "@/assets/ref_voice_state.json";

interface Sample {
  id: number;
  wavId: string;
  audioUrl: string;
  naturalness: number;
  similarity: number;
  error: boolean;
}

const TTSRatingPage: React.FC = () => {
  // State
  const [language, setLanguage] = useState<LanguageCode | undefined>();

  const navigator = useRouter();
  const [uid, setUid] = useState("");
  const [state, setState] = useState<TestState>(TestState.ONE);
  const [answerType, setAnswerType] = useState<AnswerType>(
    AnswerType.NATURALNESS
  );
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);

  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");

  const initData = async () => {
    setLoading(true);
    const res = await axios.post(`/api/init`, {
      clientId: localStorage.getItem("clientId") || "",
    });
    const dataFormat = await res.data;

    // Extract the state and ensure it's properly typed
    const currentState: TestState = dataFormat.state as keyof typeof wav;

    setUid(dataFormat.clientId);
    setState(currentState);

    // change type of answer
    if (currentState === TestState.SIX || currentState === TestState.SEVEN) {
      setAnswerType(AnswerType.SIMILARITY);
    }

    // set samples
    if (currentState !== TestState.DONE) {
      // Create a sample for each individual item in the array
      const newSamples: Sample[] = wav[currentState].map((item, index) => ({
        id: index + 1,
        wavId: item,
        audioUrl: `/wav/${item}.wav`,
        naturalness: 0,
        similarity: 0,
        error: false,
      }));

      const shuffledSamples = [...newSamples];
      for (let i = shuffledSamples.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSamples[i], shuffledSamples[j]] = [
          shuffledSamples[j],
          shuffledSamples[i],
        ];
      }
      console.log(shuffledSamples.map((sample) => sample.wavId));
      setSamples(shuffledSamples);
    } else {
      navigator.push("done");
    }

    // set localStorage
    localStorage.setItem("clientId", dataFormat.clientId);
    setLoading(false);
  };

  const putScore = async () => {
    setLoading(true);
    const newAnswers: Answer[] = await samples.map((sample) => ({
      type: answerType,
      wavId: sample.wavId,
      score:
        answerType === AnswerType.NATURALNESS
          ? sample.naturalness
          : sample.similarity,
    }));

    const res = await axios.post(`/api/ratings`, {
      clientId: uid,
      testState: state,
      answers: newAnswers,
    });
    const dataFormat = await res.data;
    console.log(dataFormat);
    await initData();
    setState(dataFormat.nextState);
    setLoading(false);
  };

  const progressCalculation = () => {
    switch (state) {
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
  };
  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    const lang = localStorage.getItem("language");
    if (!lang) {
      localStorage.setItem("language", "th");
      setLanguage("th");
    } else setLanguage(lang as LanguageCode);
  }, [language]);

  // Translations
  const translations = {
    en: {
      title: "TTS Comparison and Rating",
      inferencedText: "Inferenced Text",
      referenceVoice: "Reference Voice",
      audioSample: "Audio Sample",
      audio: "Audio",
      naturalness: "Quality",
      similarity: "Similarity",
      next: "Next",
      instructions: "Rating Instructions:",
      step1: "1. First listen to the Reference Voice at the top right",
      step2: "2. This test consists of 7 steps:",
      step2Naturalness: "Steps 1-5 will be for rating Quality of the voice",
      step2Similarity: "Steps 6-7 will be for rating Similarity of the voice",
      step3: "3. For the quality rating:",
      step3Label1: "1 : Very poor",
      step3Label2: "2 : Poor",
      step3Label3: "3 : Fair",
      step3Label4: "4 : Good",
      step3Label5: "5 : Excellent",
      step4: "4. For the similarity rating:",
      step4Label1: "1 : Completely different person",
      step4Label2: "2 : Probably a different person",
      step4Label3: "3 : Similar",
      step4Label4: "4 : Probably the same person",
      step4Label5: "5 : Exactly the same person",
      loading: "Submitting your score... please wait.",
      success: "Score submitted successfully",
      error: "Error",
      errorRate: "Please rate all samples before proceeding.",
      progress: "Progress",
    },
    th: {
      title: "การเปรียบเทียบและการให้คะแนน TTS",
      inferencedText: "ข้อความที่ใช้ทดสอบ",
      referenceVoice: "เสียงอ้างอิง",
      audioSample: "ตัวอย่างเสียง",
      audio: "เสียง",
      naturalness: "คุณภาพของเสียง",
      similarity: "ความคล้ายคลึง",
      next: "ถัดไป",
      instructions: "เกี่ยวกับแบบทดสอบนี้:",
      step1: "1. แบบทดสอบนี้ใช้เวลาไม่เกิน 10 นาที",
      step2: "2. แบบทดสอบนี้มีทั้งหมด 7 ขั้นตอน:",
      step2Naturalness: "ขั้นตอนที่ 1-5 จะเป็นการให้คะแนนคุณภาพของเสียง",
      step2Similarity: "ขั้นตอนที่ 6-7 จะเป็นการให้คะแนนความคล้ายคลึง",
      step3: "3. สำหรับการให้คะแนนคุณภาพของเสียง:",
      step3Label1: "1 : แย่มาก",
      step3Label2: "2 : แย่",
      step3Label3: "3 : พอใช้",
      step3Label4: "4 : ดี",
      step3Label5: "5 : ดีเยี่ยม",
      step4: "4. สำหรับการให้คะแนนความคล้ายคลึง:",
      step4Label1: "1 : คนละคนกันอย่างสิ้นเชิง",
      step4Label2: "2 : น่าจะเป็นคนละคนกัน",
      step4Label3: "3 : คล้ายคลึงกัน",
      step4Label4: "4 : น่าจะเป็นคนเดียวกัน",
      step4Label5: "5 : เป็นคนเดียวกันอย่างแน่นอน",
      loading: "กำลังส่งคะแนนของคุณ... กรุณารอสักครู่",
      success: "ส่งคะแนนเรียบร้อยแล้ว",
      error: "เกิดข้อผิดพลาด",
      errorRate: "กรุณาให้คะแนนตัวอย่างทั้งหมดก่อนดำเนินการต่อ",
      progress: "ความก้าวหน้า",
    },
  };

  const t: TranslationFirstPage = translations[language || "th"]; // Current translation

  //Check score
  const checkScoreValid = (): boolean => {
    // Check if any sample is missing a score
    const allScoresValid = samples.every((sample) =>
      answerType === AnswerType.NATURALNESS
        ? sample.naturalness !== 0
        : sample.similarity !== 0
    );

    // Mark samples with missing scores as having errors
    setSamples((prevSamples) =>
      prevSamples.map((sample) => ({
        ...sample,
        error:
          answerType === AnswerType.NATURALNESS
            ? sample.naturalness === 0
            : sample.similarity === 0,
      }))
    );

    return allScoresValid;
  };

  //Handle clickNext
  const handleClickNext = () => {
    if (checkScoreValid()) {
      // Scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: "smooth", // For smooth scrolling; use 'auto' for instant scrolling
      });

      // Announce to screen readers that we're submitting
      announceToScreenReader(
        language === "th"
          ? "กำลังส่งคะแนน กรุณารอสักครู่"
          : "Submitting scores, please wait"
      );

      // toast promise
      toast.promise(putScore(), {
        loading: t.loading,
        success: t.success,
        error: t.error,
      });
    } else {
      // Announce error
      announceToScreenReader(
        language === "th"
          ? "กรุณาให้คะแนนทุกตัวอย่างก่อนดำเนินการต่อ"
          : "Please rate all samples before proceeding"
      );

      toast.error(t.errorRate);
    }
  };

  // Add this function to handle aria announcements
  const announceToScreenReader = (message: string) => {
    setAriaAnnouncement(message);
    // Clear the message after a reasonable time so it can be announced again if needed
    setTimeout(() => setAriaAnnouncement(""), 1000);
  };

  // Update ratings
  const updateRating = (
    sampleId: number,
    category: "naturalness" | "similarity",
    value: number
  ): void => {
    setSamples(
      samples.map((sample) =>
        sample.id === sampleId
          ? { ...sample, [category]: value, error: false }
          : sample
      )
    );

    // Announce to screen readers
    const ratingType =
      category === "naturalness"
        ? language === "th"
          ? "คุณภาพ"
          : "quality"
        : language === "th"
        ? "ความคล้ายคลึง"
        : "similarity";

    const announcement =
      language === "th"
        ? `ให้คะแนน ${ratingType} ${value} จาก 5`
        : `Rated ${ratingType} ${value} out of 5`;

    announceToScreenReader(announcement);
  };

  if (!language) return <div>Loading...</div>;

  return (
    <div className="">
      {/* Live region for screen reader announcements */}
      <div aria-live="assertive" className="sr-only" role="status">
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-50 bg-white flex flex-col border-b border-gray-300"
        aria-label={language === "th" ? "ส่วนหัว" : "Header"}
      >
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

                  // Announce language change
                  const langAnnouncement =
                    e.target.value === "th"
                      ? "เปลี่ยนภาษาเป็นภาษาไทย"
                      : "Language changed to English";
                  announceToScreenReader(langAnnouncement);
                }}
                className="bg-white border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={language === "th" ? "เลือกภาษา" : "Select language"}
              >
                <option value="en">English</option>
                <option value="th">ไทย</option>
              </select>
            </div>
          </div>
          <div className="text-xl font-bold mb-2">
            {t.progress} {progressCalculation()} / {7}
          </div>
          <Progress value={(progressCalculation() / 7) * 100} />
        </div>
      </div>

      {/* Main content */}
      <div id="main-content" className="container mx-auto p-6 max-w-6xl">
        {/* Instructions */}
        <div
          className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm"
          role="region"
          aria-label={language === "th" ? "คำแนะนำ" : "Instructions"}
        >
          <h3 className="text-blue-800 font-bold text-lg mb-2">
            {t.instructions}
          </h3>
          <ul className="space-y-2 text-blue-900">
            <li className="flex items-start">
              <span className="font-medium">{t.step1}</span>
            </li>
            <li className="flex flex-col sm:flex-row items-start">
              <span className="font-medium">{t.step2}</span>
              <ul className="ml-6 mt-1 space-y-1">
                <li className="text-sm">• {t.step2Naturalness}</li>
                <li className="text-sm">• {t.step2Similarity}</li>
              </ul>
            </li>
            <li className="flex flex-col sm:flex-row items-start">
              <span className="font-medium">{t.step3}</span>
              <ul className="ml-6 mt-1 space-y-1">
                <li className="text-sm">• {t.step3Label5}</li>
                <li className="text-sm">• {t.step3Label4}</li>
                <li className="text-sm">• {t.step3Label3}</li>
                <li className="text-sm">• {t.step3Label2}</li>
                <li className="text-sm">• {t.step3Label1}</li>
              </ul>
            </li>
            <li className="flex flex-col sm:flex-row items-start">
              <span className="font-medium">{t.step4}</span>
              <ul className="ml-6 mt-1 space-y-1">
                <li className="text-sm">• {t.step4Label5}</li>
                <li className="text-sm">• {t.step4Label4}</li>
                <li className="text-sm">• {t.step4Label3}</li>
                <li className="text-sm">• {t.step4Label2}</li>
                <li className="text-sm">• {t.step4Label1}</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Loading state */}
        {loading ? (
          <>
            <div aria-live="polite" className="sr-only" role="status">
              {language === "th"
                ? "กำลังโหลด กรุณารอสักครู่"
                : "Loading, please wait"}
            </div>
            <SkeletonPage />
          </>
        ) : (
          <>
            {/* Top section */}
            <div
              className="grid gird-cols-1 sm:grid-cols-2 gap-6 mb-8"
              aria-label={
                language === "th" ? "เสียงอ้างอิง" : "Reference Voice"
              }
            >
              {state === TestState.SIX || state === TestState.SEVEN ? (
                <div className="border col-span-1 sm:col-span-2 rounded-lg p-4 shadow">
                  <h2
                    className="text-center sm:text-left text-lg font-semibold mb-2"
                    id="reference-voice-heading"
                  >
                    {t.referenceVoice}
                  </h2>
                  <div className="mt-4">
                    <audio
                      controls
                      className="w-full"
                      aria-labelledby="reference-voice-heading"
                    >
                      <source
                        src={`/wav/ref/${refVoiceState[state]}.wav`}
                        type="audio/mpeg"
                      />
                      {language === "th"
                        ? "เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียง"
                        : "Your browser does not support the audio element."}
                    </audio>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="w-full"
              role="region"
              aria-label={language === "th" ? "ตัวอย่างเสียง" : "Audio Samples"}
            >
              {/* Comparison table header - same column structure as rows */}
              <div
                className="grid grid-cols-3 gap-4 mb-4 font-semibold text-center md:grid"
                aria-hidden="true"
              >
                {/* Desktop view */}
                <div className="hidden md:block text-left pl-4">
                  {t.audioSample}
                </div>
                <div className="hidden md:block">{t.audio}</div>
                <div className="hidden md:block">
                  {answerType === AnswerType.NATURALNESS
                    ? t.naturalness
                    : t.similarity}
                </div>

                {/* Mobile view */}
                <div className="block md:hidden col-span-3 text-center">
                  {answerType === AnswerType.NATURALNESS
                    ? t.naturalness
                    : t.similarity}
                </div>
              </div>

              {/* Screen reader heading */}
              <h2 className="sr-only">
                {language === "th"
                  ? "ตัวอย่างเสียงเพื่อให้คะแนน"
                  : "Audio Samples for Rating"}
              </h2>

              {/* Comparison rows */}
              <ul className="space-y-4" role="list">
                {samples.map((sample, idx) => (
                  <li
                    key={sample.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border rounded-lg p-4 shadow"
                  >
                    <div
                      className="text-center md:text-left font-medium"
                      id={`sample-${idx + 1}-heading`}
                    >
                      {language === "th"
                        ? `ตัวอย่างที่ ${idx + 1}`
                        : `Sample ${idx + 1}`}
                    </div>

                    <div className="flex justify-center">
                      <audio
                        controls
                        className="w-full"
                        aria-labelledby={`sample-${idx + 1}-heading`}
                      >
                        <source src={sample.audioUrl} type="audio/mpeg" />
                        {language === "th"
                          ? "เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียง"
                          : "Your browser does not support the audio element."}
                      </audio>
                    </div>

                    <div className="flex justify-center">
                      <StarRatingComponent
                        error={sample.error}
                        rating={
                          answerType === AnswerType.NATURALNESS
                            ? sample.naturalness
                            : sample.similarity
                        }
                        onRatingChange={(value) =>
                          updateRating(
                            sample.id,
                            answerType === AnswerType.NATURALNESS
                              ? "naturalness"
                              : "similarity",
                            value
                          )
                        }
                        id={`sample-${idx + 1}-rating`}
                        ariaLabel={
                          answerType === AnswerType.NATURALNESS
                            ? language === "th"
                              ? "คะแนนคุณภาพ"
                              : "Quality Rating"
                            : language === "th"
                            ? "คะแนนความคล้ายคลึง"
                            : "Similarity Rating"
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Next button */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleClickNext}
                className="bg-blue-500 hover:bg-blue-700 cursor-pointer"
                aria-label={
                  language === "th" ? "ไปยังขั้นตอนถัดไป" : "Go to next step"
                }
              >
                {t.next}
              </Button>
            </div>
          </>
        )}
      </div>

      <footer
        className="bg-white text-gray-800 mt-8 py-8 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)]"
        aria-label={language === "th" ? "ส่วนท้าย" : "Footer"}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl font-medium mb-2">อาจารย์ที่ปรึกษา</h3>
              <ul className="ml-4">
                <li className="mb-1">• อ.ดร.เจษฎา ธัชแก้วกรพินธุ์</li>
                <li>• ผศ.ดร.เอกพล ช่วงสุวนิช</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">จัดทำโดยนิสิต</h3>
              <ul className="ml-4">
                <li className="mb-1">• ธนัส วงศ์สมุทร</li>
                <li className="mb-1">• กรวุฒิ ศิริอนันตภัทร์</li>
                <li className="mb-1">• ปุญญพัฒน์ สุรเกียรติกำจร</li>
                <li className="mb-1">• ณัฎฐ์ญณิณ ชยานุวงศ์</li>
                <li>• ธนกร สุธรรมเกษม</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
};

export default TTSRatingPage;
