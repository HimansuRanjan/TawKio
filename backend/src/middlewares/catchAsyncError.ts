import { Request, Response, NextFunction, RequestHandler } from "express";

export const catchAsyncErrors = (
  theFunction: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(theFunction(req, res, next)).catch(next);
  };
};