import { type NextRequest, NextResponse } from "next/server";
import { RAGQuerySystem } from "@/lib/rag-query";

export async function POST(request: NextRequest) {
  try {
    const { query, apiKey } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key required" },
        { status: 400 }
      );
    }

    const ragSystem = new RAGQuerySystem(apiKey);
    const response = await ragSystem.query(query);

    return NextResponse.json({
      success: true,
      response,
      query,
    });
  } catch (error) {
    console.error("Chat query error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
