import { Router } from "express";
import { StudentController } from "./student.controller";
import { validate } from "../../middlewares/validate.middleware";
import { checkRole } from "../../middlewares/rbac.middleware";
import { Role } from "../../generated/prisma/client";
import {
  createStudentSchema,
  getStudentsQuerySchema,
  updateStudentSchema,
  getStudentByIdSchema,
} from "./student.validation";

export const router = Router();

router.get(
  "/",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  validate(getStudentsQuerySchema),
  StudentController.getStudents,
);

router.get(
  "/:student_id",
  checkRole([Role.owner, Role.admin, Role.scanner]),
  validate(getStudentByIdSchema),
  StudentController.getStudentById,
);

router.use(checkRole([Role.owner, Role.admin]));

router.patch(
  "/:student_id",
  validate(updateStudentSchema),
  StudentController.updateStudent,
);

router.post("/", validate(createStudentSchema), StudentController.addStudent);

router.delete(
  "/:student_id",
  validate(getStudentByIdSchema),
  StudentController.deleteStudent,
);

router.delete(
  "/",
  validate(getStudentsQuerySchema),
  StudentController.deleteAllStudents,
);

export default router;
