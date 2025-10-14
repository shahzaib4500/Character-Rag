"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, Globe, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  textFormSchema,
  websiteFormSchema,
  type TextFormData,
  type WebsiteFormData,
} from "@/lib/validation";

interface DataSourceSectionProps {
  isApiKeyValid: boolean;
  apiKey: string;
}

export function DataSourceSection({
  isApiKeyValid,
  apiKey,
}: DataSourceSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const { toast } = useToast();

  const textForm = useForm<TextFormData>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      text: "",
    },
  });

  const websiteForm = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleTextSubmit = async (data: TextFormData) => {
    if (!isApiKeyValid) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Processing text...");
    try {
      const response = await fetch("/api/index-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text, apiKey }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Text Indexed Successfully",
          description: `Successfully indexed ${result.chunks} chunks from your text.`,
        });
        textForm.reset();
        const ragData = JSON.parse(
          localStorage.getItem("rag-store-data") ||
            '{"documents": 0, "chunks": 0, "sources": []}'
        );
        ragData.documents += 1;
        ragData.chunks += result.chunks;
        ragData.sources.push({
          type: "text",
          name: "Text Input",
          chunks: result.chunks,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("rag-store-data", JSON.stringify(ragData));
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to index text");
      }
    } catch (error) {
      console.error("[v0] Text indexing error:", error);
      toast({
        title: "Indexing Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to index text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleWebsiteSubmit = async (data: WebsiteFormData) => {
    if (!isApiKeyValid) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Scraping website...");
    try {
      const response = await fetch("/api/index-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url, apiKey }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Website Indexed Successfully",
          description: `Successfully indexed ${result.chunks} chunks from ${data.url}.`,
        });
        websiteForm.reset();
        const ragData = JSON.parse(
          localStorage.getItem("rag-store-data") ||
            '{"documents": 0, "chunks": 0, "sources": []}'
        );
        ragData.documents += 1;
        ragData.chunks += result.chunks;
        ragData.sources.push({
          type: "website",
          name: data.url,
          chunks: result.chunks,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("rag-store-data", JSON.stringify(ragData));
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to index website");
      }
    } catch (error) {
      console.error("Website indexing error:", error);
      toast({
        title: "Indexing Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to index website. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isApiKeyValid) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key first.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("apiKey", apiKey);

    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStatus(`Uploading ${file.name}...`);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 50); // Upload is 50% of total progress
          setUploadProgress(progress);
        }
      });

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          setUploadProgress(50);
          setProcessingStatus("Processing file...");
          resolve(new Response(xhr.responseText, { status: xhr.status }));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("POST", "/api/index-file");
        xhr.send(formData);
      });

      setUploadProgress(75);
      setProcessingStatus("Indexing content...");

      if (response.ok) {
        const data = await response.json();
        setUploadProgress(100);
        toast({
          title: "File Indexed Successfully",
          description: `${file.name} has been successfully indexed with ${data.chunks} chunks.`,
        });

        const ragData = JSON.parse(
          localStorage.getItem("rag-store-data") ||
            '{"documents": 0, "chunks": 0, "sources": []}'
        );
        ragData.documents += 1;
        ragData.chunks += data.chunks;
        ragData.sources.push({
          type: "file",
          name: file.name,
          chunks: data.chunks,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("rag-store-data", JSON.stringify(ragData));
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to index file");
      }
    } catch (error) {
      console.error("[v0] File upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to index file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingStatus("");
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Data Sources</CardTitle>
        <CardDescription className="text-sm">
          Add data to your RAG system by entering text, providing a website URL,
          or uploading files.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs">
            <TabsTrigger
              value="text"
              className="flex items-center gap-1 md:gap-2"
            >
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="website"
              className="flex items-center gap-1 md:gap-2"
            >
              <Globe className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Website</span>
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="flex items-center gap-1 md:gap-2"
            >
              <Upload className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">File</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <form
              onSubmit={textForm.handleSubmit(handleTextSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="text-input" className="text-sm">
                  Enter Text
                </Label>
                <Textarea
                  id="text-input"
                  placeholder="Paste your text content here..."
                  rows={4}
                  className="text-sm"
                  {...textForm.register("text")}
                />
                {textForm.formState.errors.text && (
                  <p className="text-xs text-destructive">
                    {textForm.formState.errors.text.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={!isApiKeyValid || isProcessing}
                className="w-full"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Index Text"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="website" className="space-y-4">
            <form
              onSubmit={websiteForm.handleSubmit(handleWebsiteSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="website-url" className="text-sm">
                  Website URL
                </Label>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  className="text-sm"
                  {...websiteForm.register("url")}
                />
                {websiteForm.formState.errors.url && (
                  <p className="text-xs text-destructive">
                    {websiteForm.formState.errors.url.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={!isApiKeyValid || isProcessing}
                className="w-full"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Index Website"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm">
                Upload File
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={handleFileUpload}
                disabled={!isApiKeyValid || isProcessing}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, CSV, TXT (max 10MB)
              </p>
            </div>

            {isProcessing && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>{processingStatus}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{processingStatus || "Processing..."}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
