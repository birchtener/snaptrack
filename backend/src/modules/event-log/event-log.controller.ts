import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { EventLogService } from "./event-log.service";
import { LogType } from "../../generated/prisma/browser";

interface GetStudentsRequest extends Request {
  validatedQuery: {
    page?: number;
    limit: number;
    cursor?: string;
  };
}

export class EventLogController {
  static logEvent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const eventId = req.params.event_id as string;
    const studentId = req.params.student_id as string;
    const { type } = req.body as { type: LogType };

    const logResult = await EventLogService.logEvent(
      workspaceId,
      userId,
      eventId,
      studentId,
      type,
    );

    if (!logResult.success && logResult.conflict) {
      return res.status(409).json({
        success: false,
        reason: logResult.reason,
        message: logResult.message,
        lastActionAt: logResult.lastActionAt,
        currentState: logResult.currentState,
      });
    }

    res.status(201).json({
      success: true,
      data: logResult.data,
    });
  });

  static getEventAttendance = catchAsync(
    async (req: GetStudentsRequest, res: Response) => {
      const workspaceId = req.workspace!.id;
      const eventId = req.params.event_id as string;
      const { page, limit, cursor } = req.validatedQuery;

      const attendanceData = await EventLogService.getEventAttendance(
        workspaceId,
        {
          eventId,
          page: page,
          limit: limit,
          cursor: cursor,
        },
      );

      return res.status(200).json({
        success: true,
        ...attendanceData,
      });
    },
  );

  static getStudentEventLogs = catchAsync(
    async (req: Request, res: Response) => {
      const workspaceId = req.workspace!.id;
      const studentId = req.params.student_id as string;
      const eventId = req.params.event_id as string;

      const logs = await EventLogService.getStudentEventLogs(
        workspaceId,
        studentId,
        eventId,
      );

      return res.status(200).json({
        success: true,
        data: logs,
      });
    },
  );
}
