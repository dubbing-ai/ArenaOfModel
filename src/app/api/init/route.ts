import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { Client, TestState } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// POST /api/init - Initialize database with sample data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.clientId) {
      const client: Client = await prisma.client.create({
        data: {
          state: TestState.ONE,
        },
      });
      return NextResponse.json(
        {
          message: "Init client successfully",
          clientId: client.id,
          state: client.state,
        },
        { status: 201 }
      );
    }

    const client: Client | null = await prisma.client.findUnique({
      where: {
        id: body.clientId,
      },
    });

    if (!client) {
      const newClient: Client = await prisma.client.create({
        data: {
          state: TestState.ONE,
        },
      });
      return NextResponse.json(
        {
          message: "Init new client successfully",

          clientId: newClient.id,
          state: newClient.state,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Client already exists",
          clientId: client.id,
          state: client.state,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return handleError(error);
  }
}
