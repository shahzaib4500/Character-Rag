"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DataSourceSection } from "@/components/data-source-section";
import { ChatInterface } from "@/components/chat-interface";
import { RagStore } from "@/components/rag-store";
import { ApiKeySection } from "@/components/api-key-section";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { BotMessageSquareIcon, X } from "lucide-react";

export default function RAGApp() {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState("default");
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("rag-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeyValid(
        savedApiKey.startsWith("sk-") && savedApiKey.length > 20
      );
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("rag-api-key", apiKey);
    }
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 md:p-4 max-w-7xl">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-primary">
              RAG Application
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg">
              Upload documents, scrape websites, and chat with your data using
              AI
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <SocialLinks />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            >
              {isRightSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <BotMessageSquareIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div
          className={`grid gap-4 md:gap-6 h-[calc(100vh-200px)] transition-all duration-300 ${
            isRightSidebarOpen
              ? "grid-cols-1 lg:grid-cols-3"
              : "grid-cols-1 lg:grid-cols-3"
          }`}
        >
          <div
            className={`lg:col-span-1 space-y-4 md:space-y-6 overflow-y-auto ${
              isRightSidebarOpen ? "hidden lg:block" : "block"
            }`}
          >
            <DataSourceSection isApiKeyValid={isApiKeyValid} apiKey={apiKey} />
            <RagStore />
            <ApiKeySection
              apiKey={apiKey}
              setApiKey={setApiKey}
              isApiKeyValid={isApiKeyValid}
              setIsApiKeyValid={setIsApiKeyValid}
            />
          </div>

          <div
            className={`lg:col-span-2 ${
              isRightSidebarOpen ? "block" : "hidden lg:block"
            }`}
          >
            <ChatInterface
              isApiKeyValid={isApiKeyValid}
              apiKey={apiKey}
              currentChatId={currentChatId}
              setCurrentChatId={setCurrentChatId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
