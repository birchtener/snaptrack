import { Router } from "express";
import { EventController } from "./event.controller";
import { validate } from "../../middlewares/validate.middleware";
import {
  createEventSchema,
  getEventByIdSchema,
  updateEventSchema,
  deleteEventSchema,
} from "./event.validation";
import { checkRole } from "../../middlewares/rbac.middleware";
import { Role } from "../../generated/prisma/client";

const router = Router({
  mergeParams: true,
});

router.get(
  "/",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  EventController.getEvents,
);
router.get(
  "/:event_id",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  validate(getEventByIdSchema),
  EventController.getEventById,
);

router.use(checkRole([Role.owner, Role.admin]));

router.post("/", validate(createEventSchema), EventController.createEvent);
router.patch(
  "/:event_id",
  validate(updateEventSchema),
  EventController.updateEvent,
);
router.delete(
  "/:event_id",
  validate(deleteEventSchema),
  EventController.deleteEvent,
);

export default router;
