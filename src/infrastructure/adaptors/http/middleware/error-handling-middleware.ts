import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const createErrorHandlingMiddleware =
  () =>
  // 4 params for express to know this is error middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestLogger = req.logger;

    if (err instanceof ZodError) {
      requestLogger.warn("Validation error", {
        error: err.issues,
        path: req.path,
        method: req.method,
      });

      return res.status(400).json({
        error: "Validation failed",
        details: err.issues,
      });
    }

    // Log unexpected errors
    requestLogger.error("Request error", err, {
      path: req.path,
      method: req.method,
    });

    return res.status(500).json({
      error: "Internal server error",
      requestId: req.requestId,
    });
  };
