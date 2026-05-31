import { SystemAction } from "../../generated/prisma/client";
import { prisma } from "../../config/db";

export interface StudentLogDetails {
  student_id: string;
  first_name?: string;
  last_name?: string;
  reason?: string;
}

export interface EventLogDetails {
  event_id: string;
  event_title?: string;
  status_change?: string;
}

export interface MembershipLogDetails {
  target_user_id: string;
  action_performed: "add_member" | "remove_member" | "change_role";
  old_role?: string;
  new_role?: string;
}

type LogDetailsPayload =
  | StudentLogDetails
  | EventLogDetails
  | MembershipLogDetails
  | Record<string, any>;

export class SystemLogService {
  static async createLog(
    workspaceId: string,
    userId: string,
    action: SystemAction,
    details: LogDetailsPayload = {},
  ) {
    try {
      const logEntry = await prisma.systemLog.create({
        data: {
          workspace_id: workspaceId,
          created_by: userId,
          action,
          details: details as any,
        },
      });

      return logEntry;
    } catch (error) {
      console.error(
        `CRITICAL FAILURE: Audit trail system failed to compile for action [${action}]:`,
        error,
      );
    }
  }
}
