import { z } from "zod";

export const logEventSchema = z.looseObject({
  params: z.object({
    event_id: z.uuid("Event ID must be a valid UUID."),
    student_id: z.uuid("Student ID must be a valid UUID."),
  }),
  body: z.object({
    type: z.enum(["in", "out"], {
      error: "Log type must be either 'in' or 'out'.",
    }),
  }),
});

export const getEventAttendanceQuerySchema = z.looseObject({
  query: z.object({
    page: z.coerce
      .number()
      .int("Page number must be an integer.")
      .positive("Page number must be a positive integer.")
      .optional(),
    limit: z.coerce
      .number()
      .int("Limit must be an integer.")
      .positive("Limit must be a positive integer.")
      .optional(),
    cursor: z.string().optional(),
  }),
  params: z.object({
    event_id: z.uuid("Event ID must be a valid UUID."),
  }),
});

export const getStudentEventLogsSchema = z.looseObject({
  params: z.object({
    student_id: z.uuid("Student ID must be a valid UUID."),
    event_id: z.uuid("Event ID must be a valid UUID."),
  }),
});
