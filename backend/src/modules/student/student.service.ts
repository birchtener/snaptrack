import { prisma } from "../../config/db";
import { Prisma, SystemAction } from "../../generated/prisma/client";
import { AppError } from "../../utils/app.error";
import { SystemLogService } from "../system-log/system-log.service";

interface GetStudentsFilters {
  page?: number;
  limit: number;
  cursor?: string;
}

export class StudentService {
  private static async validateCustomMetadata(
    workspaceId: string,
    incomingMetadata: Record<string, any>,
    isUpdate = false,
  ) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { student_metadata_schema: true },
    });

    if (!workspace)
      throw new AppError(
        "Target workspace environment context not found.",
        404,
      );

    const schemaTemplate = (workspace.student_metadata_schema || []) as any[];
    const validatedMetadata: Record<string, any> = {};

    for (const field of schemaTemplate) {
      const value = incomingMetadata[field.key];

      if (isUpdate && value === undefined) continue;

      if (
        !isUpdate &&
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        throw new AppError(
          `Validation Failure: The custom field '${field.label}' is required.`,
          400,
        );
      }

      if (value !== undefined && value !== null) {
        if (field.type === "number" && typeof value !== "number") {
          throw new AppError(
            `Validation Failure: '${field.label}' must be a valid number.`,
            400,
          );
        }
        if (field.type === "boolean" && typeof value !== "boolean") {
          throw new AppError(
            `Validation Failure: '${field.label}' must be a true/false flag.`,
            400,
          );
        }
        if (field.type === "text" && typeof value !== "string") {
          throw new AppError(
            `Validation Failure: '${field.label}' must be a standard text string.`,
            400,
          );
        }
        validatedMetadata[field.key] = value;
      }
    }
    return validatedMetadata;
  }

  static async addStudent(
    workspaceId: string,
    userId: string,
    idCardCode: string,
    firstName: string,
    lastName: string,
    metadata: Record<string, any>,
  ) {
    try {
      const cleanMetadata = await this.validateCustomMetadata(
        workspaceId,
        metadata,
        false,
      );

      return await prisma.student.create({
        data: {
          workspace_id: workspaceId,
          id_card_code: idCardCode.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          added_by: userId,
          metadata: cleanMetadata,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "A student with this ID card code already exists in this workspace.",
          400,
        );
      }
      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Error adding student:", error);
      throw new AppError("Failed to add student record.", 500);
    }
  }

  static async getStudents(workspaceId: string, options: GetStudentsFilters) {
    try {
      const { page, limit, cursor } = options;

      const queryOptions: Prisma.StudentFindManyArgs = {
        where: { workspace_id: workspaceId },
        orderBy: { id_card_code: "desc" },
      };

      const isCursorStrategy = !!cursor || !page;

      if (isCursorStrategy) {
        queryOptions.take = limit + 1;

        if (cursor) {
          queryOptions.cursor = {
            workspace_id_id_card_code: {
              workspace_id: workspaceId,
              id_card_code: cursor,
            },
          };
          queryOptions.skip = 1;
        }
      } else {
        queryOptions.take = limit;
        queryOptions.skip = (page - 1) * limit;
      }

      const results = await prisma.student.findMany(queryOptions);

      if (isCursorStrategy) {
        const hasNextPage = results.length > limit;
        const data = hasNextPage ? results.slice(0, limit) : results;
        const nextCursor = hasNextPage
          ? data[data.length - 1].id_card_code
          : null;

        return {
          data,
          meta: { type: "cursor", limit, hasNextPage, nextCursor },
        };
      } else {
        const totalItems = await prisma.student.count({
          where: queryOptions.where,
        });
        const totalPages = Math.ceil(totalItems / limit);

        return {
          data: results,
          meta: {
            type: "offset",
            page: page!,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page! < totalPages,
            hasPreviousPage: page! > 1,
          },
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching students:", error);
      }
      throw new AppError("Failed to fetch paginated students pool.", 500);
    }
  }

  static async getStudentById(workspaceId: string, studentId: string) {
    try {
      const student = await prisma.student.findFirst({
        where: { id: studentId, workspace_id: workspaceId, deleted_at: null },
      });

      if (!student)
        throw new AppError(
          "Student profile could not be found within this workspace.",
          404,
        );
      return student;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Error fetching student:", error);
      throw new AppError("Failed to fetch student record details.", 500);
    }
  }

  static async updateStudent(
    workspaceId: string,
    userId: string,
    updates: {
      studentId: string;
      idCardCode?: string;
      firstName?: string;
      lastName?: string;
      metadata?: Record<string, any>;
    },
  ) {
    try {
      const { studentId, idCardCode, firstName, lastName, metadata } = updates;

      const student = await prisma.student.findFirst({
        where: { id: studentId, workspace_id: workspaceId, deleted_at: null },
      });

      if (!student)
        throw new AppError(
          "Student profile not found within this workspace.",
          404,
        );

      let finalMetadata = student.metadata as Record<string, any>;
      if (metadata) {
        const cleanUpdateMetadata = await this.validateCustomMetadata(
          workspaceId,
          metadata,
          true,
        );
        finalMetadata = { ...finalMetadata, ...cleanUpdateMetadata };
      }

      return await prisma.$transaction(async (tx) => {
        await SystemLogService.createLog(
          workspaceId,
          userId,
          SystemAction.update_student,
          {
            student_id: studentId,
            changes: {
              id_card_code: idCardCode && {
                from: student.id_card_code,
                to: idCardCode,
              },
              first_name: firstName && {
                from: student.first_name,
                to: firstName,
              },
              last_name: lastName && { from: student.last_name, to: lastName },
              metadata: metadata && {
                from: student.metadata,
                to: finalMetadata,
              },
            },
          },
        );

        return await tx.student.update({
          where: { id: studentId },
          data: {
            id_card_code: idCardCode?.trim(),
            first_name: firstName?.trim(),
            last_name: lastName?.trim(),
            metadata: finalMetadata,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          "A student with this ID card code already exists in this workspace.",
          400,
        );
      }
      if (error instanceof AppError) throw error;

      if (process.env.NODE_ENV === "development")
        console.error("Error updating student:", error);
      throw new AppError("Failed to save student profile modifications.", 500);
    }
  }

  static async deleteStudent(
    workspaceId: string,
    userId: string,
    studentId: string,
  ) {
    try {
      const student = await prisma.student.findFirst({
        where: { id: studentId, workspace_id: workspaceId },
      });

      if (!student)
        throw new AppError(
          "Student record not found within this workspace.",
          404,
        );

      return await prisma.$transaction(async (tx) => {
        await SystemLogService.createLog(
          workspaceId,
          userId,
          SystemAction.delete_student,
          {
            student_id: studentId,
            student_name: `${student.first_name} ${student.last_name}`,
            id_card_code: student.id_card_code,
          },
        );

        return await tx.student.delete({
          where: { id: studentId },
        });
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (process.env.NODE_ENV === "development")
        console.error("Error deleting student:", error);
      throw new AppError("Failed to permanently delete student record.", 500);
    }
  }

  static async deleteAllStudents(workspaceId: string, userId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        await tx.eventLog.deleteMany({
          where: {
            workspace_id: workspaceId,
          },
        });

        const purgeResult = await tx.student.deleteMany({
          where: { workspace_id: workspaceId },
        });

        void SystemLogService.createLog(
          workspaceId,
          userId,
          SystemAction.delete_student,
          {
            mass_delete: true,
            deleted_count: purgeResult.count,
          },
        );

        return purgeResult;
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Critical error during workspace students bulk purge:",
          error,
        );
      }

      throw new AppError(
        "An unexpected database exception occurred while executing the bulk student record purge.",
        500,
      );
    }
  }
}
