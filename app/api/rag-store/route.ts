import { type NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function GET(request: NextRequest) {
  try {
    const qdrantUrl =
      request.headers.get("x-qdrant-url") ||
      process.env.QDRANT_URL ||
      "http://localhost:6333";
    const qdrantApiKey =
      request.headers.get("x-qdrant-api-key") || process.env.QDRANT_API_KEY;

    const client = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey || undefined,
    });

    try {
      const collectionInfo = await client.getCollection("rag-documents");
      const totalPoints = collectionInfo.points_count || 0;

      // Get recent sources from collection (simplified)
      const searchResult = await client.scroll("rag-documents", {
        limit: 10,
        with_payload: true,
      });

      const sources =
        searchResult.points?.map((point: any) => ({
          type: point.payload?.type || "unknown",
          name: point.payload?.source || "Unknown source",
          chunks: 1, // Each point is one chunk
          timestamp: new Date().toISOString(),
        })) || [];

      // Group sources by name and count chunks
      const groupedSources = sources.reduce((acc: any[], source: any) => {
        const existing = acc.find((s) => s.name === source.name);
        if (existing) {
          existing.chunks += 1;
        } else {
          acc.push({ ...source });
        }
        return acc;
      }, []);

      const data = {
        totalDocuments: groupedSources.length,
        totalChunks: totalPoints,
        sources: groupedSources.slice(0, 5), // Show only recent 5
      };

      return NextResponse.json(data);
    } catch (collectionError) {
      console.log("Collection not found or empty:", collectionError);
      return NextResponse.json({
        totalDocuments: 0,
        totalChunks: 0,
        sources: [],
      });
    }
  } catch (error) {
    console.error("RAG store query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store data" },
      { status: 500 }
    );
  }
}
