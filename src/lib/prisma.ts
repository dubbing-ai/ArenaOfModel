import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const handleError = (e: unknown) => {
  if (e instanceof PrismaClientKnownRequestError) {
    // Known request errors, such as constraint violations or invalid queries
    console.error(`PrismaClientKnownRequestError (${e.code}): ${e.message}`);

    switch (e.code) {
      case "P2002": // Unique constraint failed
        return NextResponse.json(
          { message: "A unique constraint was violated. Check your input." },
          { status: 400 }
        );
      case "P2025": // Record not found
        return NextResponse.json(
          { message: "Record not found. Please check your input." },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { message: "A database error occurred. Please try again later." },
          { status: 500 }
        );
    }
  }

  if (e instanceof PrismaClientUnknownRequestError) {
    // Unknown request errors
    console.error(`PrismaClientUnknownRequestError: ${e.message}`);
    return NextResponse.json(
      { message: "An unknown database error occurred." },
      { status: 500 }
    );
  }

  if (e instanceof PrismaClientRustPanicError) {
    // Rust-level panics in Prisma
    console.error(`PrismaClientRustPanicError: ${e.message}`);
    return NextResponse.json(
      {
        message: "A critical database error occurred. Please contact support.",
      },
      { status: 500 }
    );
  }

  if (e instanceof PrismaClientInitializationError) {
    // Errors during Prisma Client initialization
    console.error(`PrismaClientInitializationError: ${e.message}`);
    return NextResponse.json(
      { message: "Failed to initialize the database connection." },
      { status: 500 }
    );
  }

  if (e instanceof PrismaClientValidationError) {
    // Validation errors on queries
    console.error(`PrismaClientValidationError: ${e.message}`);
    return NextResponse.json(
      { message: "Validation error on query. Check your input and try again." },
      { status: 400 }
    );
  }

  if (e instanceof Error) {
    // Generic errors
    console.error(`Generic Error: ${e.message}`);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }

  // Handle non-error objects or unexpected cases
  console.error(`Unknown Error: ${JSON.stringify(e)}`);
  return NextResponse.json(
    { message: "An unexpected error occurred." },
    { status: 500 }
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldValue = (obj: any, field: string) => {
  return field
    .split(".")
    .reduce(
      (o, key) => (o !== null && o !== undefined && key in o ? o[key] : null),
      obj
    );
};