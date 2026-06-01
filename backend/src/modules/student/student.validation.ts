import { z } from "zod";

export const createStudentSchema = z.looseObject({
  body: z.object({
    firstName: z
      .string({ error: "First name is a required field." })
      .trim()
      .min(1, "First name cannot be empty."),
    lastName: z
      .string({ error: "Last name is a required field." })
      .trim()
      .min(1, "Last name cannot be empty."),
    idCardCode: z
      .string({ error: "ID card scanning code or barcode is required." })
      .trim()
      .min(1, "ID card scanning code cannot be empty."),
    metadata: z
      .record(z.string(), z.unknown(), {
        error:
          "Student metadata property must be a valid key-value JSON object block.",
      })
      .optional()
      .default({}),
  }),
});

export const updateStudentSchema = z.looseObject({
  params: z.object({
    student_id: z.uuid(
      "Target student lookup identification key must be a valid UUID.",
    ),
  }),
  body: z.object({
    firstName: z
      .string({ error: "First name is a required field." })
      .trim()
      .min(1)
      .optional(),
    lastName: z
      .string({ error: "Last name is a required field." })
      .trim()
      .min(1)
      .optional(),
    idCardCode: z
      .string({ error: "ID card scanning code or barcode is required." })
      .trim()
      .min(1)
      .optional(),
    metadata: z
      .record(z.string(), z.unknown(), {
        error:
          "Student metadata property must be a valid key-value JSON object block.",
      })
      .optional(),
  }),
});

export const getStudentsQuerySchema = z.looseObject({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : undefined)),
    limit: z
      .string()
      .optional()
      .transform((val) =>
        val ? Math.max(1, Math.min(100, parseInt(val, 10))) : 10,
      ),
    cursor: z.string().optional(),
  }),
});

export const getStudentByIdSchema = z.looseObject({
  params: z.object({
    student_id: z.uuid("Student ID must be a valid UUID string."),
  }),
});
