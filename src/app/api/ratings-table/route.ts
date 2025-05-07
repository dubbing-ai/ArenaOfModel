import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/prisma";
import { TestState } from "@prisma/client";

// Model mapping from ID to display name
const MODEL_NAMES: Record<string, string> = {
  "0": "Groundtruth",
  "1": "KhongkhunTTS w/ ThaiCentral",
  "2": "KhongkhunTTS Thai/English",
  "3": "Another VITS",
  "4": "F5-TTS-THAI",
  "5": "KhongkhunTTS Thai Only",
  "6": "Typhoon2 Audio"
};

// Categories mapping based on TestState
const CATEGORIES: Record<TestState, { label: string, gender: string, type: string }> = {
  [TestState.ONE]: { label: "Seen Thai", gender: "Male", type: "seen" },
  [TestState.TWO]: { label: "Seen Thai", gender: "Female", type: "seen" },
  [TestState.THREE]: { label: "Unseen Thai", gender: "Female", type: "unseen" },
  [TestState.FOUR]: { label: "Unseen Thai w/ Trans.", gender: "Female", type: "unseen" },
  [TestState.FIVE]: { label: "Unseen English", gender: "Male", type: "unseen" },
  // SIX and SEVEN not currently needed, but keep them for completeness
  [TestState.SIX]: { label: "Not Used", gender: "Not Used", type: "not_used" },
  [TestState.SEVEN]: { label: "Not Used", gender: "Not Used", type: "not_used" },
  [TestState.DONE]: { label: "Unknown", gender: "Unknown", type: "unknown" }
};

// GET /api/ratings-table - Get all ratings in table format
export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({});
    
    // Initialize results structure
    interface ModelScores {
      [modelId: string]: {
        [category: string]: {
          sum: number;
          count: number;
          avg: number;
        }
      }
    }
    
    // Structure to store all scores by model and category
    const modelScores: ModelScores = {};
    
    // Initialize model scores with all models and categories
    Object.keys(MODEL_NAMES).forEach(modelId => {
      modelScores[modelId] = {};
      
      // Initialize categories
      Object.keys(CATEGORIES).forEach(state => {
        if (state !== TestState.DONE) {
          const category = `${CATEGORIES[state as TestState].gender}-${CATEGORIES[state as TestState].label}`;
          modelScores[modelId][category] = { sum: 0, count: 0, avg: 0 };
        }
      });
    });
    
    // Mapping from wav IDs to model IDs - reuse existing structure from the application
    const wavToModelMappings = await fetchWavToModelMappings();
    
    // Process all ratings
    ratings.forEach(rating => {
      if (rating.state === TestState.DONE) return;
      
      const category = `${CATEGORIES[rating.state].gender}-${CATEGORIES[rating.state].label}`;
      
      rating.answers.forEach(answer => {
        const modelId = wavToModelMappings[answer.wavId];
        if (!modelId) return;
        
        if (modelScores[modelId]?.[category]) {
          modelScores[modelId][category].sum += answer.score;
          modelScores[modelId][category].count += 1;
        }
      });
    });
    
    // Calculate averages
    Object.keys(modelScores).forEach(modelId => {
      Object.keys(modelScores[modelId]).forEach(category => {
        const scores = modelScores[modelId][category];
        scores.avg = scores.count > 0 ? scores.sum / scores.count : 0;
      });
    });
    
    // Format for table view
    const tableData = Object.keys(MODEL_NAMES).map(modelId => {
      const modelName = MODEL_NAMES[modelId];
      const scores: Record<string, { avg: number; count: number }> = {};
      
      // Add scores for each category
      Object.keys(modelScores[modelId]).forEach(category => {
        scores[category] = {
          avg: parseFloat(modelScores[modelId][category].avg.toFixed(2)),
          count: modelScores[modelId][category].count
        };
      });
      
      return {
        modelId,
        modelName,
        ...scores
      };
    });
    
    // Group by categories for easier frontend rendering
    const categories = Object.values(CATEGORIES)
      .filter(cat => cat.label !== "Unknown" && cat.label !== "Not Used")
      .map(cat => `${cat.gender}-${cat.label}`);
    
    return NextResponse.json({ 
      tableData,
      categories,
      totalRatings: ratings.length
    });
  } catch (error) {
    return handleError(error);
  }
}

// Helper function to map wav IDs to model IDs
async function fetchWavToModelMappings() {
  // Import model data from assets
  const modelData = (await import("@/assets/model.json")).default;
  
  // Create a mapping from wav ID to model ID
  const mapping: Record<string, string> = {};
  
  modelData.forEach((model: { modelId: string; wavId: string[] }) => {
    model.wavId.forEach((wavId: string) => {
      mapping[wavId] = model.modelId;
    });
  });
  
  return mapping;
}