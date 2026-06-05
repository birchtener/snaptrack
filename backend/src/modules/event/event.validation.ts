import { z } from "zod";

export const createEventSchema = z
  .looseObject({
    body: z.object({
      name: z.string().min(1, "Event name is required").trim(),
      description: z.string().trim().optional(),
      startDate: z.iso.datetime("Invalid start date format"),
      endDate: z.iso.datetime("Invalid end date format").optional(),
      infinite: z.boolean().default(false),
      geofencingEnabled: z.boolean().default(false),
      radius: z.number().optional(),
      longitude: z.number().optional(),
      latitude: z.number().optional(),
    }),
  })
  .refine(
    (data) => {
      if (!data.body.infinite && !data.body.endDate) return false;
      return true;
    },
    {
      message: "End date is required for standard events",
      path: ["endDate"],
    },
  );

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
    startDate: z.iso.datetime("Invalid start date format").optional(),
    endDate: z.iso.datetime("Invalid end date format").optional(),
    infinite: z.boolean().default(false),
    geofencingEnabled: z.boolean().default(false),
    radius: z.number().optional(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
  }),
});

export const deleteEventSchema = z.looseObject({
  params: z.object({
    event_id: z.uuid("Invalid event ID format"),
  }),
});
