import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";

export class VectorStoreManager {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: QdrantVectorStore | null = null;

  constructor(apiKey: string) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: apiKey,
      model: "text-embedding-3-large",
    });
  }

  async initializeVectorStore() {
    if (!this.vectorStore) {
      this.vectorStore = await QdrantVectorStore.fromExistingCollection(
        this.embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: "rag-documents",
        }
      );
    }
    return this.vectorStore;
  }

  async indexPDF(filePath: string): Promise<number> {
    try {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      console.log("Pages loaded:", docs.length);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitDocuments(docs);
      console.log("Total chunks: ", chunks.length);

      await this.addDocuments(chunks);
      return chunks.length;
    } catch (err) {
      console.log(`PDF indexing error: ${err}`);
      throw err;
    }
  }

  async indexText(text: string, source = "manual-input"): Promise<number> {
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const doc = new Document({
        pageContent: text,
        metadata: { source, type: "text" },
      });

      const chunks = await splitter.splitDocuments([doc]);
      console.log("Total chunks: ", chunks.length);

      await this.addDocuments(chunks);
      return chunks.length;
    } catch (err) {
      console.log(`Text indexing error: ${err}`);
      throw err;
    }
  }

  async indexWebsite(content: string, url: string): Promise<number> {
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const doc = new Document({
        pageContent: content,
        metadata: { source: url, type: "website" },
      });

      const chunks = await splitter.splitDocuments([doc]);
      console.log("Total chunks: ", chunks.length);

      await this.addDocuments(chunks);
      return chunks.length;
    } catch (err) {
      console.log(`Website indexing error: ${err}`);
      throw err;
    }
  }

  private async addDocuments(chunks: Document[]) {
    if (!this.vectorStore) {
      // Create new collection if it doesn't exist
      this.vectorStore = await QdrantVectorStore.fromDocuments(
        chunks,
        this.embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: "rag-documents",
        }
      );
    } else {
      await this.vectorStore.addDocuments(chunks);
    }
    console.log("Documents successfully indexed into Qdrant...");
  }

  async getVectorStore() {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }
    return this.vectorStore;
  }

  async deleteAllDocuments(): Promise<void> {
    try {
      if (!this.vectorStore) {
        await this.initializeVectorStore();
      }

      // Delete the entire collection and recreate it empty
      const qdrantClient = this.vectorStore?.client;
      if (qdrantClient) {
        await qdrantClient.deleteCollection("rag-documents");
        console.log("Collection deleted successfully");

        // Reset the vector store instance
        this.vectorStore = null;
      }
    } catch (err) {
      console.log(`Delete collection error: ${err}`);
      throw err;
    }
  }

  async getCollectionInfo() {
    try {
      if (!this.vectorStore) {
        await this.initializeVectorStore();
      }

      const qdrantClient = this.vectorStore?.client;
      if (qdrantClient) {
        const info = await qdrantClient.getCollection("rag-documents");
        return info;
      }
      return null;
    } catch (err) {
      console.log(`Get collection info error: ${err}`);
      return null;
    }
  }
}
