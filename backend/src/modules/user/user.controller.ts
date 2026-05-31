import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
export class UserController {
  static getUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthenticated: Missing user identification token.",
      });
    }

    const user = await UserService.getUser(userId);

    return res.status(200).json({ user });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthenticated: Missing user identification token.",
      });
    }

    const deletedUser = await UserService.deleteUser(userId as string);

    return res.status(200).json({ user: deletedUser });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const { firstName, lastName, password } = req.body;

    const updatedUser = await UserService.updateUser(
      userId as string,
      { firstName, lastName, password },
      req.file?.buffer,
      req.file?.mimetype,
      req.file?.originalname,
    );

    return res.status(200).json({ user: updatedUser });
  });
}
