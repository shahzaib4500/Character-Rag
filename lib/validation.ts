import { z } from "zod";

export const textFormSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .min(10, "Text must be at least 10 characters"),
});

export const websiteFormSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const apiKeyFormSchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .regex(/^sk-/, "API key must start with 'sk-'"),
});

export const qdrantConfigSchema = z.object({
  qdrantUrl: z
    .string()
    .min(1, "Qdrant URL is required")
    .url("Please enter a valid URL"),
  qdrantApiKey: z.string().optional(),
});

export type TextFormData = z.infer<typeof textFormSchema>;
export type WebsiteFormData = z.infer<typeof websiteFormSchema>;
export type ApiKeyFormData = z.infer<typeof apiKeyFormSchema>;
export type QdrantConfigData = z.infer<typeof qdrantConfigSchema>;
