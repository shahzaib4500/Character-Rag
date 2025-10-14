import "dotenv/config";
import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

export class RAGQuerySystem {
  private openai: OpenAI;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: QdrantVectorStore | null = null;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    this.embeddings = new OpenAIEmbeddings({
      apiKey: apiKey,
      model: "text-embedding-3-large",
    });
  }

  async initializeVectorStore() {
    if (!this.vectorStore) {
      try {
        this.vectorStore = await QdrantVectorStore.fromExistingCollection(
          this.embeddings,
          {
            url: process.env.QDRANT_URL || "http://localhost:6333",
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: "rag-documents",
          }
        );
      } catch (error) {
        console.log(
          "No existing collection found, will create when documents are added"
        );
        return null;
      }
    }
    return this.vectorStore;
  }

  async query(userQuery: string): Promise<string> {
    try {
      await this.initializeVectorStore();

      if (!this.vectorStore) {
        return "No documents have been indexed yet. Please add some documents first.";
      }

      // Retrieve relevant chunks from top 3 most relevant chunks for any query
      const vectorRetriever = this.vectorStore.asRetriever({
        k: 3,
      });
      const relevantChunks = await vectorRetriever.invoke(userQuery);

      if (relevantChunks.length === 0) {
        return "I couldn't find any relevant information in the indexed documents to answer your question.";
      }

      const SYSTEM_PROMPT = `You are an AI assistant that answers questions based on the provided context from indexed documents. Only answer based on the available context.
      
      Context: ${JSON.stringify(
        relevantChunks.map((chunk) => ({
          content: chunk.pageContent,
          source: chunk.metadata.source,
          type: chunk.metadata.type,
        }))
      )}`;

      const messagesHistory = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        { role: "user" as const, content: userQuery },
      ];

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messagesHistory,
        temperature: 0.1,
      });

      return (
        response.choices[0].message.content || "I couldn't generate a response."
      );
    } catch (error) {
      console.log(`RAG query error: ${error}`);
      throw error;
    }
  }
}

// Example usage
const apiKey = process.env.OPENAI_API_KEY || "";
const ragQuerySystem = new RAGQuerySystem(apiKey);

const main = async () => {
  try {
    const userQuery =
      "please, can you tell me about the MongoDB hosting is what and why use?";
    const response = await ragQuerySystem.query(userQuery);
    console.log("Response:", response);
  } catch (error) {
    console.log(`Reterival chat phase error: ${error}`);
  }
};

main();
