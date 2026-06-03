import { Request, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
export class UserController {
  static getUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await UserService.getUser(userId);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        createdAt: user.created_at,
      },
    });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const deletedUser = await UserService.deleteUser(userId as string);

    return res.status(200).json({ success: true, user: deletedUser });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { firstName, lastName, password } = req.body;

    const updatedUser = await UserService.updateUser(
      userId as string,
      { firstName, lastName, password },
      req.file?.buffer,
      req.file?.mimetype,
      req.file?.originalname,
    );

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        imageUrl: updatedUser.image_url,
        createdAt: updatedUser.created_at,
      },
    });
  });
}
