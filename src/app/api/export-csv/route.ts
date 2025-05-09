import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/prisma";

// Mapping of wavId to generation data code names
const wavIdToCodeName: Record<string, string> = {
  "s9zam": "[tsync2-denoised_lj]-[cv_no_my-vctk]_cv044",
  "st9gd": "[tsync2-denoised_lj]-[cv_no_my-vctk]_cv062",
  "0e7ib": "[tsync2-denoised_lj]-[cv_no_my-vctk]_speaker-008",
  "ss0jw": "[tsync2-denoised_lj]-[cv_no_my-vctk]_speaker-009",
  "4384v": "[tsync2-denoised_lj]-[cv_no_my-vctk]_speaker-010",
  "7zjea": "[tsync2-denoised_lj]-[cv_no_my-vctk]_speaker-021",
  "fux14": "[tsync2-denoised_lj]-[cv_no_my-vctk]_speaker-024",
  "gry4m": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_cv044",
  "9p4zt": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_cv062",
  "3mrdu": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_speaker-008",
  "4vgy5": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_speaker-009",
  "6hvjf": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_speaker-010",
  "nsumf": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_speaker-021",
  "9l7lm": "[tsync2-denoised_lj]-H100[vctk-cv_no_my-vtc]_speaker-024",
  "85d8d": "another-vits_cv044",
  "2des1": "another-vits_cv062",
  "yflcg": "another-vits_speaker-008",
  "9wtin": "another-vits_speaker-009",
  "6fc9s": "another-vits_speaker-010",
  "oaown": "another-vits_speaker-021",
  "t4tfr": "another-vits_speaker-024",
  "3ontg": "f5-output-v3_cv044",
  "y45rr": "f5-output-v3_cv062",
  "qboa3": "f5-output-v3_speaker-008",
  "sp8y8": "f5-output-v3_speaker-009",
  "smlw0": "f5-output-v3_speaker-010",
  "xeht1": "f5-output-v3_speaker-021",
  "1m660": "f5-output-v3_speaker-024",
  "p6io3": "tsync2_cv_no-my_cv044",
  "kfbym": "tsync2_cv_no-my_cv062",
  "aagna": "tsync2_cv_no-my_speaker-008",
  "vvi0k": "tsync2_cv_no-my_speaker-009",
  "5r9d4": "tsync2_cv_no-my_speaker-010",
  "87ql3": "tsync2_cv_no-my_speaker-021",
  "c2bww": "tsync2_cv_no-my_speaker-024",
  "mpltl": "typhoon_cv044",
  "rlm7z": "typhoon_cv062",
  "ivqx8": "typhoon_speaker-008",
  "g3hu8": "typhoon_speaker-009",
  "aqbwk": "typhoon_speaker-010",
  "i4j7l": "typhoon_speaker-021",
  "faolg": "typhoon_speaker-024"
};

// GET /api/export-csv - Export ratings as CSV
export async function GET() {
  try {
    // Get all ratings
    const ratings = await prisma.rating.findMany({});

    // Group ratings by clientId and wavId
    const clientRatings: Record<string, Record<string, number>> = {};

    // Initialize client ratings
    ratings.forEach(rating => {
      if (!clientRatings[rating.clientId]) {
        clientRatings[rating.clientId] = {};
      }

      // Add each answer to the client's ratings
      rating.answers.forEach(answer => {
        clientRatings[rating.clientId][answer.wavId] = answer.score;
      });
    });

    // Get all unique wavIds used in ratings
    const allWavIds = new Set<string>();
    Object.values(clientRatings).forEach(ratings => {
      Object.keys(ratings).forEach(wavId => {
        allWavIds.add(wavId);
      });
    });

    // Convert to array for consistent ordering
    const wavIdsArray = Array.from(allWavIds).sort();

    // Create CSV header with code names
    const header = ['clientId', ...wavIdsArray.map(wavId => wavIdToCodeName[wavId] || wavId)].join(',');

    // Create CSV rows
    const rows = Object.entries(clientRatings).map(([clientId, ratings]) => {
      // Start with the clientId
      const row = [clientId];
      
      // Add a column for each wavId
      wavIdsArray.forEach(wavId => {
        // Add the rating if it exists, otherwise leave it blank
        row.push(ratings[wavId] !== undefined ? ratings[wavId].toString() : '');
      });
      
      return row.join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Return the CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ratings.csv"'
      }
    });
  } catch (error) {
    return handleError(error);
  }
}