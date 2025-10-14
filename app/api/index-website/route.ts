import { type NextRequest, NextResponse } from "next/server";
import { VectorStoreManager } from "@/lib/vector-store";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    if (docs.length === 0) {
      return NextResponse.json(
        { error: "No content found at URL" },
        { status: 400 }
      );
    }

    const vectorStore = new VectorStoreManager(apiKey);
    const chunks = await vectorStore.indexWebsite(docs[0].pageContent, url);

    return NextResponse.json({
      success: true,
      message: "Website content indexed successfully",
      chunks,
      url,
    });
  } catch (error) {
    console.error("Website indexing error:", error);
    return NextResponse.json(
      { error: "Failed to index website content" },
      { status: 500 }
    );
  }
}
