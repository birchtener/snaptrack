import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body || req.body;
      req.params = parsed.params || req.params;
      req.validatedQuery = parsed.query
        ? (parsed.query as Record<string, any>)
        : undefined;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
