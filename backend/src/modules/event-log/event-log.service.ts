import { prisma } from "../../config/db";
import { Prisma, SystemAction, LogType } from "../../generated/prisma/client";
import { AppError } from "../../utils/app.error";

interface GetAttendanceFilters {
  eventId: string;
  page?: number;
  limit: number;
  cursor?: string;
}

export class EventLogService {
  static async logEvent(
    workspaceId: string,
    userId: string,
    eventId: string,
    studentId: string,
    type: LogType,
  ) {
    try {
      const eventWithLatestLog = await prisma.event.findFirst({
        where: {
          id: eventId,
          workspace_id: workspaceId,
        },
        select: {
          id: true,
          logs: {
            where: { student_id: studentId },
            orderBy: { timestamp: "desc" },
            take: 1,
            select: {
              type: true,
              timestamp: true,
            },
          },
        },
      });

      if (!eventWithLatestLog) {
        throw new AppError(
          "The target tracking event does not exist within this workspace context.",
          404,
        );
      }

      const latestLog = eventWithLatestLog.logs[0];

      if (latestLog && latestLog.type === type) {
        return {
          success: false,
          conflict: true,
          reason: "DUPLICATE_STATE",
          message: `Student is already marked as ${type}.`,
          lastActionAt: latestLog.timestamp,
          currentState: latestLog.type,
        };
      }

      const newLog = await prisma.eventLog.create({
        data: {
          workspace_id: workspaceId,
          event_id: eventId,
          student_id: studentId,
          scanned_by: userId,
          type: type,
        },
      });

      return {
        success: true,
        conflict: false,
        data: newLog,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Critical error recording scan log:", error);
      }
      throw new AppError("Failed to process scanning event entry.", 500);
    }
  }

  static async getEventAttendance(
    workspaceId: string,
    options: GetAttendanceFilters,
  ) {
    try {
      const { eventId, page, limit, cursor } = options;

      const queryOptions: Prisma.StudentFindManyArgs = {
        where: {
          workspace_id: workspaceId,
        },
        orderBy: {
          id_card_code: "desc",
        },
        include: {
          logs: {
            where: {
              event_id: eventId,
            },
            orderBy: {
              timestamp: "desc",
            },
            take: 1,
          },
        },
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
        console.error(
          "Error fetching live event attendance collection:",
          error,
        );
      }
      throw new AppError("Failed to compile event attendance logs array.", 500);
    }
  }

  static async getStudentEventLogs(
    workspaceId: string,
    eventId: string,
    studentId: string,
  ) {
    try {
      const logs = await prisma.eventLog.findMany({
        where: {
          workspace_id: workspaceId,
          event_id: eventId,
          student_id: studentId,
        },
        orderBy: {
          timestamp: "desc",
        },
        include: {
          scanner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return logs;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching student event logs:", error);
      }
      throw new AppError("Failed to fetch student event logs.", 500);
    }
  }
}
