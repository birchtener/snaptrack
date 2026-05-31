/// <reference types="@clerk/express/env" />

import * as express from "express";
import "multer";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      workspace?: {
        id: string;
        role: string;
      };
      file?: Multer.File;
      files?: Multer.File[];
    }
  }
}
