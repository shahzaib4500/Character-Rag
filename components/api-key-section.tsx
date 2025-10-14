"use client";

import { useEffect, useState } from "react";
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
import {
  Key,
  Check,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Cloud,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  apiKeyFormSchema,
  type ApiKeyFormData,
  qdrantConfigSchema,
  type QdrantConfigData,
} from "@/lib/validation";

interface ApiKeySectionProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isApiKeyValid: boolean;
  setIsApiKeyValid: (valid: boolean) => void;
}

export function ApiKeySection({
  apiKey,
  setApiKey,
  isApiKeyValid,
  setIsApiKeyValid,
}: ApiKeySectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [qdrantUrl, setQdrantUrl] = useState("");
  const [qdrantApiKey, setQdrantApiKey] = useState("");
  const [showQdrantKey, setShowQdrantKey] = useState(false);
  const [isQdrantEditing, setIsQdrantEditing] = useState(false);

  const form = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const qdrantForm = useForm<QdrantConfigData>({
    resolver: zodResolver(qdrantConfigSchema),
    defaultValues: {
      qdrantUrl: "",
      qdrantApiKey: "",
    },
  });

  const validateApiKey = (key: string) => {
    return key.startsWith("sk-") && key.length > 20;
  };

  const handleSaveApiKey = (data: ApiKeyFormData) => {
    if (validateApiKey(data.apiKey)) {
      setApiKey(data.apiKey);
      setIsApiKeyValid(true);
      localStorage.setItem("rag-api-key", data.apiKey);
      setIsEditing(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved locally.",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key starting with 'sk-'.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = () => {
    setApiKey("");
    setIsApiKeyValid(false);
    localStorage.removeItem("rag-api-key");
    form.reset();
    setIsEditing(false);
    toast({
      title: "API Key Deleted",
      description: "Your API key has been removed.",
    });
  };

  const handleEditApiKey = () => {
    setIsEditing(true);
    form.setValue("apiKey", apiKey);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleLoadApiKey = () => {
    const savedKey = localStorage.getItem("rag-api-key");
    if (savedKey && validateApiKey(savedKey)) {
      setApiKey(savedKey);
      form.setValue("apiKey", savedKey);
      setIsApiKeyValid(true);
    }
  };

  const handleSaveQdrantConfig = (data: QdrantConfigData) => {
    setQdrantUrl(data.qdrantUrl ?? "");
    setQdrantApiKey(data.qdrantApiKey ?? "");
    localStorage.setItem("rag-qdrant-url", data.qdrantUrl ?? "");
    localStorage.setItem("rag-qdrant-key", data.qdrantApiKey ?? "");
    setIsQdrantEditing(false);
    toast({
      title: "Qdrant Configuration Saved",
      description: "Your Qdrant Cloud settings have been saved locally.",
    });
  };

  const handleDeleteQdrantConfig = () => {
    setQdrantUrl("");
    setQdrantApiKey("");
    localStorage.removeItem("rag-qdrant-url");
    localStorage.removeItem("rag-qdrant-key");
    qdrantForm.reset();
    setIsQdrantEditing(false);
    toast({
      title: "Qdrant Configuration Deleted",
      description: "Your Qdrant Cloud settings have been removed.",
    });
  };

  const handleEditQdrantConfig = () => {
    setIsQdrantEditing(true);
    qdrantForm.setValue("qdrantUrl", qdrantUrl);
    qdrantForm.setValue("qdrantApiKey", qdrantApiKey);
  };

  const handleLoadQdrantConfig = () => {
    const savedUrl = localStorage.getItem("rag-qdrant-url");
    const savedKey = localStorage.getItem("rag-qdrant-key");
    if (savedUrl) {
      setQdrantUrl(savedUrl);
      qdrantForm.setValue("qdrantUrl", savedUrl);
    }
    if (savedKey) {
      setQdrantApiKey(savedKey);
      qdrantForm.setValue("qdrantApiKey", savedKey);
    }
  };

  useEffect(() => {
    handleLoadApiKey();
    handleLoadQdrantConfig();
  }, []);

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 7)}${"*".repeat(key.length - 14)}${key.slice(-7)}`;
  };

  return (
    <div className="space-y-6 lg:max-w-md md:max-w-lg max-w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Key className="h-5 w-5" />
            OpenAI API Key
          </CardTitle>
          <CardDescription className="text-sm">
            Enter your OpenAI API key to enable AI features. It will be stored
            locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isApiKeyValid || isEditing ? (
            <form
              onSubmit={form.handleSubmit(handleSaveApiKey)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm">
                  API Key
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      {...form.register("apiKey")}
                      className="text-sm"
                    />
                    {form.formState.errors.apiKey && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.apiKey.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!form.watch("apiKey")}
                      size="sm"
                    >
                      Save
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                  <code className="text-xs font-mono truncate">
                    {showApiKey ? apiKey : maskApiKey(apiKey)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="shrink-0"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={handleEditApiKey}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteApiKey}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isApiKeyValid && !isEditing && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="h-4 w-4" />
              API key is valid and ready to use
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Cloud className="h-5 w-5" />
            Qdrant Configuration
          </CardTitle>
          <CardDescription className="text-sm">
            Configure Qdrant Cloud or local instance.
            <a
              href="https://cloud.qdrant.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
            >
              Get Qdrant Cloud <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!qdrantUrl || isQdrantEditing ? (
            <form
              onSubmit={qdrantForm.handleSubmit(handleSaveQdrantConfig)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="qdrant-url" className="text-sm">
                  Qdrant URL
                </Label>
                <div className="space-y-1">
                  <Input
                    id="qdrant-url"
                    type="url"
                    placeholder="https://your-cluster.qdrant.io or http://localhost:6333"
                    {...qdrantForm.register("qdrantUrl")}
                    className="text-sm"
                  />
                  {qdrantForm.formState.errors.qdrantUrl && (
                    <p className="text-xs text-destructive">
                      {qdrantForm.formState.errors.qdrantUrl.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qdrant-api-key" className="text-sm">
                  Qdrant API Key (optional for local)
                </Label>
                <div className="space-y-1">
                  <Input
                    id="qdrant-api-key"
                    type="password"
                    placeholder="Your Qdrant Cloud API key"
                    {...qdrantForm.register("qdrantApiKey")}
                    className="text-sm"
                  />
                  {qdrantForm.formState.errors.qdrantApiKey && (
                    <p className="text-xs text-destructive">
                      {qdrantForm.formState.errors.qdrantApiKey.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Save Configuration
                </Button>
                {isQdrantEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQdrantEditing(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Cloud className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono truncate">
                        {qdrantUrl}
                      </div>
                      {qdrantApiKey && (
                        <div className="text-xs font-mono truncate text-muted-foreground">
                          API Key:{" "}
                          {showQdrantKey
                            ? qdrantApiKey
                            : maskApiKey(qdrantApiKey)}
                        </div>
                      )}
                    </div>
                    {qdrantApiKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowQdrantKey(!showQdrantKey)}
                        className="shrink-0"
                      >
                        {showQdrantKey ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditQdrantConfig}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteQdrantConfig}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {qdrantUrl && !isQdrantEditing && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="h-4 w-4" />
              Qdrant configuration saved
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
