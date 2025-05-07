"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";
import { LanguageCode } from "../types/translation";

interface TableData {
  modelId: string;
  modelName: string;
  [key: string]: string | number | { avg: number; count: number };
}

interface TableResponse {
  tableData: TableData[];
  categories: string[];
  naturalnessCategories: string[];
  similarityCategories: string[];
  totalRatings: number;
}

const RatingsTable: React.FC = () => {
  const [data, setData] = useState<TableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LanguageCode>("th");
  const [highestScores, setHighestScores] = useState<Record<string, number>>(
    {}
  );
  const [highestSimilarityScores, setHighestSimilarityScores] = useState<
    Record<string, number>
  >({});

  // Translations
  const translations = {
    en: {
      title: "Naturalness Mean Opinion Score for TTS Models",
      similarityTitle: "Similarity Mean Opinion Score for TTS Models",
      loading: "Loading data...",
      male: "Male",
      female: "Female",
      seenThai: "Seen Thai",
      unseenThai: "Unseen Thai",
      unseenEnglish: "Unseen English",
      unseenThaiWithTrans: "Unseen Thai w/ Trans.",
      unseenENtoTH: "Unseen EN to TH",
      unseenTHtoTH: "Unseen TH to TH",
      ratings: "Total Ratings:",
      footer: "Table of averaged user ratings for TTS model comparison",
      notes: "Notes:",
      note1: "Trained on Tsync2 + Commonvoice",
      note2: "Trained on Tsync2 + LJSpeech + Commonvoice + VCTK",
      note3: "Trained on Tsync2 + LJSpeech + Commonvoice + VCTK + Thai Central",
    },
    th: {
      title: "คะแนนความเห็นเฉลี่ยด้านความเป็นธรรมชาติสำหรับโมเดล TTS",
      similarityTitle: "คะแนนความเห็นเฉลี่ยด้านความคล้ายคลึงสำหรับโมเดล TTS",
      loading: "กำลังโหลดข้อมูล...",
      male: "ชาย",
      female: "หญิง",
      seenThai: "ไทย (เคยเห็น)",
      unseenThai: "ไทย (ไม่เคยเห็น)",
      unseenEnglish: "อังกฤษ (ไม่เคยเห็น)",
      unseenThaiWithTrans: "ไทย พร้อมแปล (ไม่เคยเห็น)",
      unseenENtoTH: "อังกฤษเป็นไทย (ไม่เคยเห็น)",
      unseenTHtoTH: "ไทยเป็นไทย (ไม่เคยเห็น)",
      ratings: "จำนวนการให้คะแนนทั้งหมด:",
      footer: "ตารางคะแนนเฉลี่ยจากผู้ใช้สำหรับการเปรียบเทียบโมเดล TTS",
      notes: "หมายเหตุ:",
      note1: "ฝึกฝนด้วย Tsync2 + Commonvoice",
      note2: "ฝึกฝนด้วย Tsync2 + LJSpeech + Commonvoice + VCTK",
      note3: "ฝึกฝนด้วย Tsync2 + LJSpeech + Commonvoice + VCTK + Thai Central",
    },
  };

  const t = translations[language];

  // Format category names
  const formatCategory = (category: string): string => {
    const [gender, ...labelParts] = category.split("-");
    const label = labelParts.join("-");

    if (gender === "Male") {
      if (label === "Seen Thai") return t.seenThai;
      if (label === "Unseen Thai") return t.unseenThai;
      if (label === "Unseen English") return t.unseenEnglish;
      if (label === "Unseen TH to TH") return t.unseenTHtoTH;
    } else if (gender === "Female") {
      if (label === "Seen Thai") return t.seenThai;
      if (label === "Unseen Thai") return t.unseenThai;
      if (label === "Unseen Thai w/ Trans.") return t.unseenThaiWithTrans;
      if (label === "Unseen EN to TH") return t.unseenENtoTH;
    }
    return label;
  };

  // Group categories by gender
  const getGroupedCategories = (categoryList: string[]) => {
    if (!categoryList || categoryList.length === 0)
      return { male: [], female: [] };

    const male: string[] = [];
    const female: string[] = [];

    categoryList.forEach((category) => {
      const [gender] = category.split("-");

      if (gender === "Male") {
        male.push(category);
      } else if (gender === "Female") {
        female.push(category);
      }
    });

    return { male, female };
  };

  // Calculate highest scores for each category, excluding groundtruth
  const calculateHighestScores = (categories: string[]) => {
    if (!data || !categories) return {};

    const highestScores: Record<string, number> = {};

    // Initialize with lowest possible score
    categories.forEach((category) => {
      highestScores[category] = -Infinity;
    });

    // Find highest score for each category, excluding groundtruth (modelId = "0")
    data.tableData.forEach((row) => {
      // Skip groundtruth model
      if (row.modelId === "0") {
        return;
      }

      categories.forEach((category) => {
        if (
          row[category] !== undefined &&
          typeof row[category] === "object" &&
          "avg" in row[category]
        ) {
          const score = (row[category] as { avg: number }).avg;
          if (score > highestScores[category]) {
            highestScores[category] = score;
          }
        }
      });
    });

    return highestScores;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/ratings-table");
        setData(response.data);

        // Calculate highest scores after data is loaded
        setTimeout(() => {
          if (response.data.naturalnessCategories) {
            setHighestScores(
              calculateHighestScores(response.data.naturalnessCategories)
            );
          }
          if (response.data.similarityCategories) {
            setHighestSimilarityScores(
              calculateHighestScores(response.data.similarityCategories)
            );
          }
        }, 0);
      } catch (error) {
        console.error("Error fetching ratings table data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Check for saved language preference
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage as LanguageCode);
    }
  }, []);

  // Recalculate highest scores when data changes
  useEffect(() => {
    if (data) {
      if (data.naturalnessCategories) {
        setHighestScores(calculateHighestScores(data.naturalnessCategories));
      }
      if (data.similarityCategories) {
        setHighestSimilarityScores(
          calculateHighestScores(data.similarityCategories)
        );
      }
    }
  }, [data]);

  // Handle language change
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            <Skeleton className="h-8 w-64" />
          </h1>
        </div>
        <div className="overflow-x-auto">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const naturalnessCategoriesGrouped = data?.naturalnessCategories
    ? getGroupedCategories(data.naturalnessCategories)
    : { male: [], female: [] };

  const similarityCategoriesGrouped = data?.similarityCategories
    ? getGroupedCategories(data.similarityCategories)
    : { male: [], female: [] };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>

        {/* Language Toggle */}
        <div className="flex items-center space-x-2">
          <Globe size={20} className="text-gray-600" />
          <select
            value={language}
            onChange={(e) =>
              handleLanguageChange(e.target.value as LanguageCode)
            }
            className="bg-white border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
        </div>
      </div>

      {data && (
        <>
          {/* Naturalness Table */}
          <div className="overflow-x-auto mb-12">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    rowSpan={2}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b"
                  >
                    Model
                  </th>
                  {/* Male Category Group */}
                  {naturalnessCategoriesGrouped.male.length > 0 && (
                    <th
                      scope="col"
                      colSpan={naturalnessCategoriesGrouped.male.length}
                      className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b"
                    >
                      {t.male}
                    </th>
                  )}
                  {/* Female Category Group */}
                  {naturalnessCategoriesGrouped.female.length > 0 && (
                    <th
                      scope="col"
                      colSpan={naturalnessCategoriesGrouped.female.length}
                      className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b"
                    >
                      {t.female}
                    </th>
                  )}
                </tr>
                <tr>
                  {/* Male Subcategories */}
                  {naturalnessCategoriesGrouped.male.map((category, index) => (
                    <th
                      key={`male-${index}`}
                      scope="col"
                      className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                    >
                      {formatCategory(category)}
                    </th>
                  ))}
                  {/* Female Subcategories */}
                  {naturalnessCategoriesGrouped.female.map(
                    (category, index) => (
                      <th
                        key={`female-${index}`}
                        scope="col"
                        className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                      >
                        {formatCategory(category)}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.tableData.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                      {row.modelName}
                      {row.modelId === "5" && <sup>1</sup>}
                      {row.modelId === "2" && <sup>2</sup>}
                      {row.modelId === "1" && <sup>3</sup>}
                    </td>
                    {/* Male Category Cells */}
                    {naturalnessCategoriesGrouped.male.map(
                      (category, catIdx) => {
                        // Determine if this cell has the highest score
                        const cellData = row[category];
                        const isHighestScore =
                          row.modelId !== "0" &&
                          cellData !== undefined &&
                          typeof cellData === "object" &&
                          "avg" in cellData &&
                          Math.abs(cellData.avg - highestScores[category]) <
                            0.001; // Use small epsilon for float comparison

                        return (
                          <td
                            key={`male-cell-${catIdx}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r"
                          >
                            {cellData !== undefined &&
                            typeof cellData === "object" &&
                            "avg" in cellData &&
                            "count" in cellData ? (
                              <span
                                className={isHighestScore ? "font-bold" : ""}
                              >
                                {cellData.avg.toFixed(2)}/{cellData.count}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        );
                      }
                    )}

                    {/* Female Category Cells */}
                    {naturalnessCategoriesGrouped.female.map(
                      (category, catIdx) => {
                        // Determine if this cell has the highest score
                        const cellData = row[category];
                        const isHighestScore =
                          row.modelId !== "0" &&
                          cellData !== undefined &&
                          typeof cellData === "object" &&
                          "avg" in cellData &&
                          Math.abs(cellData.avg - highestScores[category]) <
                            0.001; // Use small epsilon for float comparison

                        return (
                          <td
                            key={`female-cell-${catIdx}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r"
                          >
                            {cellData !== undefined &&
                            typeof cellData === "object" &&
                            "avg" in cellData &&
                            "count" in cellData ? (
                              <span
                                className={isHighestScore ? "font-bold" : ""}
                              >
                                {cellData.avg.toFixed(2)}/{cellData.count}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Similarity Table */}
          {data.similarityCategories &&
            data.similarityCategories.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-6 mt-12">
                  {t.similarityTitle}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          rowSpan={2}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b"
                        >
                          Model
                        </th>
                        {/* Male Category Group for Similarity */}
                        {similarityCategoriesGrouped.male.length > 0 && (
                          <th
                            scope="col"
                            colSpan={similarityCategoriesGrouped.male.length}
                            className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b"
                          >
                            {t.male}
                          </th>
                        )}
                        {/* Female Category Group for Similarity */}
                        {similarityCategoriesGrouped.female.length > 0 && (
                          <th
                            scope="col"
                            colSpan={similarityCategoriesGrouped.female.length}
                            className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-b"
                          >
                            {t.female}
                          </th>
                        )}
                      </tr>
                      <tr>
                        {/* Male Similarity Categories */}
                        {similarityCategoriesGrouped.male.map(
                          (category, index) => (
                            <th
                              key={`sim-male-${index}`}
                              scope="col"
                              className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                            >
                              {formatCategory(category)}
                            </th>
                          )
                        )}
                        {/* Female Similarity Categories */}
                        {similarityCategoriesGrouped.female.map(
                          (category, index) => (
                            <th
                              key={`sim-female-${index}`}
                              scope="col"
                              className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                            >
                              {formatCategory(category)}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.tableData.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={
                            rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                            {row.modelName}
                            {row.modelId === "5" && <sup>1</sup>}
                            {row.modelId === "2" && <sup>2</sup>}
                            {row.modelId === "1" && <sup>3</sup>}
                          </td>
                          {/* Male Similarity Cells */}
                          {similarityCategoriesGrouped.male.map(
                            (category, catIdx) => {
                              // Determine if this cell has the highest score
                              const cellData = row[category];
                              const isHighestScore =
                                row.modelId !== "0" &&
                                cellData !== undefined &&
                                typeof cellData === "object" &&
                                "avg" in cellData &&
                                Math.abs(
                                  cellData.avg -
                                    highestSimilarityScores[category]
                                ) < 0.001; // Use small epsilon for float comparison

                              return (
                                <td
                                  key={`sim-male-cell-${catIdx}`}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r"
                                >
                                  {cellData !== undefined &&
                                  typeof cellData === "object" &&
                                  "avg" in cellData &&
                                  "count" in cellData ? (
                                    <span
                                      className={
                                        isHighestScore ? "font-bold" : ""
                                      }
                                    >
                                      {cellData.avg.toFixed(2)}/{cellData.count}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              );
                            }
                          )}

                          {/* Female Similarity Cells */}
                          {similarityCategoriesGrouped.female.map(
                            (category, catIdx) => {
                              // Determine if this cell has the highest score
                              const cellData = row[category];
                              const isHighestScore =
                                row.modelId !== "0" &&
                                cellData !== undefined &&
                                typeof cellData === "object" &&
                                "avg" in cellData &&
                                Math.abs(
                                  cellData.avg -
                                    highestSimilarityScores[category]
                                ) < 0.001; // Use small epsilon for float comparison

                              return (
                                <td
                                  key={`sim-female-cell-${catIdx}`}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r"
                                >
                                  {cellData !== undefined &&
                                  typeof cellData === "object" &&
                                  "avg" in cellData &&
                                  "count" in cellData ? (
                                    <span
                                      className={
                                        isHighestScore ? "font-bold" : ""
                                      }
                                    >
                                      {cellData.avg.toFixed(2)}/{cellData.count}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              );
                            }
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          <div className="mt-4 text-sm text-gray-600">
            <p>
              {t.ratings} {data.totalRatings}
            </p>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold">{t.notes}</p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>
                <sup>1</sup> {t.note1}
              </li>
              <li>
                <sup>2</sup> {t.note2}
              </li>
              <li>
                <sup>3</sup> {t.note3}
              </li>
            </ol>
          </div>
        </>
      )}

      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
};

export default RatingsTable;
