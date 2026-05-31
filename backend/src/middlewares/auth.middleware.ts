import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../config/db";
import { AppError } from "../utils/app.error";
import { catchAsync } from "../utils/catchAsync";
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated || !userId) {
      throw new AppError("Unauthenticated execution attempt", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    req.user = {
      id: userId,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

    return next();
  },
);
