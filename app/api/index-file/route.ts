import { type NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { VectorStoreManager } from "@/lib/vector-store";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get API key from headers or form data
    const apiKey =
      request.headers.get("x-api-key") || (formData.get("apiKey") as string);
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "text/csv", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), file.name);
    await writeFile(tempPath, buffer);

    await writeFile(tempPath, buffer);

    try {
      const vectorStore = new VectorStoreManager(apiKey);
      let chunks = 0;

      // Process file based on type
      if (file.type === "application/pdf") {
        chunks = await vectorStore.indexPDF(tempPath);
      } else if (file.type === "text/csv") {
        const loader = new CSVLoader(tempPath);
        const docs = await loader.load();
        for (const doc of docs) {
          chunks += await vectorStore.indexText(
            doc.pageContent,
            `${file.name}:${doc.metadata.line}`
          );
        }
      } else if (file.type === "text/plain") {
        const loader = new TextLoader(tempPath);
        const docs = await loader.load();
        chunks = await vectorStore.indexText(docs[0].pageContent, file.name);
      }

      // Clean up temp file
      await unlink(tempPath);

      return NextResponse.json({
        success: true,
        message: `File indexed successfully`,
        chunks,
        filename: file.name,
      });
    } catch (error) {
      // Clean up temp file on error
      await unlink(tempPath).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("File indexing error:", error);
    return NextResponse.json(
      { error: "Failed to index file" },
      { status: 500 }
    );
  }
}
