import { type NextRequest, NextResponse } from "next/server";
import { VectorStoreManager } from "@/lib/vector-store";

export async function POST(request: NextRequest) {
  try {
    const { text, apiKey } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key required" },
        { status: 400 }
      );
    }

    const vectorStore = new VectorStoreManager(apiKey);
    const chunks = await vectorStore.indexText(text, "manual-input");

    return NextResponse.json({
      success: true,
      message: "Text indexed successfully",
      chunks,
    });
  } catch (error) {
    console.error("Text indexing error:", error);
    return NextResponse.json(
      { error: "Failed to index text" },
      { status: 500 }
    );
  }
}
