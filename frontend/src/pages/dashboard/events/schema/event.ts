import * as z from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").trim(),
  description: z.string().optional(),
  infinite: z.boolean().default(false),
  geofencingEnabled: z.boolean().default(false),
  radius: z.number().default(100),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  dateConfig: z
    .object({
      type: z.enum(["single", "range"]),
      singleDate: z.date().optional(),
      rangeDates: z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
    })
    .default({ type: "single", singleDate: new Date() }),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
