import { z } from "zod";

export const createEventSchema = z.looseObject({
  body: z.object({
    name: z.string().min(1, "Event name is required").trim(),
    description: z.string().trim().optional(),
  }),
});

export const getEventByIdSchema = z.looseObject({
  params: z.object({
    event_id: z.uuid("Invalid event ID format"),
  }),
});

export const updateEventSchema = z.looseObject({
  params: z.object({
    event_id: z.uuid("Invalid event ID format"),
  }),
  body: z.object({
    name: z.string().min(1, "Event name cannot be empty").trim().optional(),
    description: z.string().trim().optional(),
  }),
});

export const deleteEventSchema = z.looseObject({
  params: z.object({
    event_id: z.uuid("Invalid event ID format"),
  }),
});
