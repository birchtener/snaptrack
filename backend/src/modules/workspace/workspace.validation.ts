import { z } from "zod";

export const createWorkspaceSchema = z.looseObject({
  body: z.object({
    name: z.string().min(1, "Workspace name is required").trim(),
  }),
});
