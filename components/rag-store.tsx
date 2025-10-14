"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, FileText, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RagStoreData {
  totalDocuments: number;
  totalChunks: number;
  sources: Array<{
    type: "text" | "website" | "file";
    name: string;
    chunks: number;
    timestamp: string;
  }>;
}

export function RagStore() {
  const [storeData, setStoreData] = useState<RagStoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchStoreData = async () => {
    try {
      const response = await fetch("/api/rag-store");
      if (response.ok) {
        const data = await response.json();
        setStoreData(data);
      }
    } catch (error) {
      console.error("Failed to fetch RAG store data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const apiKey = localStorage.getItem("rag-qdrant-key");
      if (!apiKey) {
        toast({
          title: "Error",
          description: "OpenAI API key not found. Please configure it first.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/delete-index", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "All indexed data has been deleted successfully.",
        });
        await fetchStoreData();
      } else {
        throw new Error("Failed to delete indexed data");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete indexed data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
    const interval = setInterval(fetchStoreData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG Store
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          RAG Store
        </CardTitle>
        <CardDescription>
          Overview of indexed data in your vector database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {storeData ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {storeData.totalDocuments}
                </div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {storeData.totalChunks}
                </div>
                <div className="text-sm text-muted-foreground">Chunks</div>
              </div>
            </div>

            {storeData.totalDocuments > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Indexed Data
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all indexed documents and chunks from your vector
                      database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Recent Sources</h4>
              {storeData.sources.length > 0 ? (
                <div className="space-y-2">
                  {storeData.sources.slice(0, 5).map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{source.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {source.chunks} chunks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No data indexed yet
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Unable to load store data
          </p>
        )}
      </CardContent>
    </Card>
  );
}
