import { Router } from "express";
import { EventLogController } from "./event-log.controller";
import { validate } from "../../middlewares/validate.middleware";
import { checkRole } from "../../middlewares/rbac.middleware";
import { Role } from "../../generated/prisma/client";
import {
  logEventSchema,
  getEventAttendanceQuerySchema,
  getStudentEventLogsSchema,
} from "./event-log.validation";

const router = Router({
  mergeParams: true,
});

router.post(
  "/:event_id/students/:student_id",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  validate(logEventSchema),
  EventLogController.logEvent,
);

router.get(
  "/students/:student_id/events/:event_id",
  checkRole([Role.owner, Role.admin]),
  validate(getStudentEventLogsSchema),
  EventLogController.getStudentEventLogs,
);
router.get(
  "/events/:event_id",
  checkRole([Role.owner, Role.admin]),
  validate(getEventAttendanceQuerySchema),
  EventLogController.getEventAttendance,
);

export default router;
