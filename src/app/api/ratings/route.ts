import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AnswerType, TestState } from "@prisma/client";
import { handleError } from "@/lib/prisma";
import wavJson from "@/assets/wav.json";
import models from "@/assets/model.json";

// GET /api/ratings - Get all ratings
export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({});

    // Calculate average scores grouped by model
    interface ModelScore {
      naturalness: { sum: number; count: number };
      similarity: { sum: number; count: number };
    }

    const modelScores: Record<string, ModelScore> = {};

    // Initialize model scores
    models.forEach((model) => {
      modelScores[model.modelId] = {
        naturalness: { sum: 0, count: 0 },
        similarity: { sum: 0, count: 0 },
      };
    });

    // Calculate sums and counts
    ratings.forEach((rating) => {
      rating.answers.forEach((answer) => {
        // Find which model this wavId belongs to
        for (const model of models) {
          if (model.wavId.includes(answer.wavId)) {
            if (answer.type === AnswerType.NATURALNESS) {
              modelScores[model.modelId].naturalness.sum += answer.score;
              modelScores[model.modelId].naturalness.count += 1;
            } else if (answer.type === AnswerType.SIMILARITY) {
              modelScores[model.modelId].similarity.sum += answer.score;
              modelScores[model.modelId].similarity.count += 1;
            }
            break;
          }
        }
      });
    });

    const modelAverages: {
      modelId: string;
      naturalness: number;
      similarity: number;
      count: number;
    }[] = [];

    Object.keys(modelScores).forEach((modelId) => {
      const scores = modelScores[modelId];
      modelAverages.push({
        modelId,
        naturalness:
          scores.naturalness.count > 0
            ? scores.naturalness.sum / scores.naturalness.count
            : 0,
        similarity:
          scores.similarity.count > 0
            ? scores.similarity.sum / scores.similarity.count
            : 0,
        count: scores.naturalness.count,
      });
    });

    return NextResponse.json({ scores: modelAverages });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/ratings - Create a new rating
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.clientId || !data.testState || !data.answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: {
        id: data.clientId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.state !== data.testState && client.state !== TestState.DONE) {
      return NextResponse.json(
        { error: "Client is not in the first state" },
        { status: 400 }
      );
    }
    const testState = data.testState as TestState;

    const wav = wavJson[testState as keyof typeof wavJson].map((wav) => wav);

    if (
      !Array.isArray(data.answers) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.answers.some((answer: any) => !wav.includes(answer.wavId)) ||
      data.answers.length !== wav.length
    ) {
      return NextResponse.json(
        { error: "Wrong answer format" },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = data.answers.map((answer: any) => ({
      type: answer.type as AnswerType,
      wavId: answer.wavId,
      score: answer.score,
    }));

    const rating = await prisma.rating.create({
      data: {
        clientId: data.clientId,
        state: testState,
        answers: answers,
      },
    });

    if (client.state !== TestState.DONE) {
      await prisma.client.update({
        where: {
          id: data.clientId,
        },
        data: {
          state:
            testState === TestState.ONE
            ? TestState.TWO
            : testState === TestState.TWO
              ? TestState.THREE
              : testState === TestState.THREE
                ? TestState.FOUR
                : testState === TestState.FOUR
                  ? TestState.FIVE
                  : testState === TestState.FIVE
                    ? TestState.SIX
                    : testState === TestState.SIX
                      ? TestState.SEVEN
                      : TestState.DONE
        },
      });
    }

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
