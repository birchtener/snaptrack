import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { StudentService } from "./student.service";

interface GetStudentsRequest extends Request {
  validatedQuery: {
    page?: number;
    limit: number;
    cursor?: string;
  };
}

export class StudentController {
  static addStudent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const { firstName, lastName, idCardCode, metadata } = req.body;

    const newStudent = await StudentService.addStudent(
      workspaceId,
      userId,
      idCardCode,
      firstName,
      lastName,
      metadata,
    );

    res.status(201).json({
      success: true,
      data: newStudent,
    });
  });

  static getStudents = catchAsync(
    async (req: GetStudentsRequest, res: Response) => {
      const workspaceId = req.workspace!.id;
      const { page, limit, cursor } = req.validatedQuery;

      const paginationEnvelope = await StudentService.getStudents(workspaceId, {
        page,
        limit,
        cursor,
      });

      return res.status(200).json({
        success: true,
        ...paginationEnvelope,
      });
    },
  );

  static getStudentById = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const studentId = req.params.student_id as string;

    const student = await StudentService.getStudentById(workspaceId, studentId);

    res.status(200).json({
      success: true,
      data: student,
    });
  });

  static updateStudent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const studentId = req.params.student_id as string;
    const { firstName, lastName, idCardCode, metadata } = req.body;

    const updatedStudent = await StudentService.updateStudent(
      workspaceId,
      userId,
      {
        studentId,
        idCardCode,
        firstName,
        lastName,
        metadata,
      },
    );

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  });

  static deleteStudent = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;
    const studentId = req.params.student_id as string;

    const deletedStudent = await StudentService.deleteStudent(
      workspaceId,
      userId,
      studentId,
    );

    res.status(204).send({
      success: true,
      data: deletedStudent,
    });
  });

  static deleteAllStudents = catchAsync(async (req: Request, res: Response) => {
    const workspaceId = req.workspace!.id;
    const userId = req.user!.id;

    await StudentService.deleteAllStudents(workspaceId, userId);

    res.status(204).send({
      success: true,
    });
  });
}
