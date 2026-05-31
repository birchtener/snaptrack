import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../config/db";
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ error: "Unauthenticated execution attempt" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(401).json({ error: "Unauthenticated execution attempt" });
  }

  req.user = {
    id: userId,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };

  return next();
};
