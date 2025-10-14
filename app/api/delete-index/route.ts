import { type NextRequest, NextResponse } from "next/server";
import { VectorStoreManager } from "@/lib/vector-store";

export async function DELETE(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
        { status: 400 }
      );
    }

    const vectorStore = new VectorStoreManager(apiKey);
    await vectorStore.deleteAllDocuments();

    return NextResponse.json({
      success: true,
      message: "All indexed data deleted successfully",
    });
  } catch (error) {
    console.error("Delete index error:", error);
    return NextResponse.json(
      { error: "Failed to delete indexed data" },
      { status: 500 }
    );
  }
}
