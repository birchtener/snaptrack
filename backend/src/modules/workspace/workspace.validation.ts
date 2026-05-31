import { z } from "zod";

export const fieldDefinitionSchema = z.object({
  key: z
    .string()
    .min(1, "Field key is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Field key must be alphanumeric with underscores")
    .trim(),
  label: z.string().min(1, "Field label is required").trim(),
  type: z.enum(["text", "number", "boolean", "date"]),
  required: z.boolean().default(false),
});

export const createWorkspaceSchema = z.looseObject({
  body: z.object({
    name: z.string().min(1, "Workspace name is required").trim(),
    fieldDefinitions: z.array(fieldDefinitionSchema).optional(),
  }),
});

export const updateWorkspaceSchema = z.looseObject({
  body: z.object({
    name: z.string().min(1, "Workspace name is required").trim(),
    fieldDefinitions: z.array(fieldDefinitionSchema).optional(),
  }),
});
