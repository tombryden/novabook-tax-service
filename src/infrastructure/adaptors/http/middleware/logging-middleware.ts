import type { Request, Response, NextFunction } from "express";
import type { LoggerPort } from "../../../../core/ports/logger-port";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
      logger: LoggerPort;
    }
  }
}

export const createLoggingMiddleware =
  (logger: LoggerPort) => (req: Request, res: Response, next: NextFunction) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    // Create child logger with request context
    req.requestId = requestId;
    req.logger = logger.child({ requestId });

    // Log incoming request
    req.logger.info("Incoming request", {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
    });

    // Log response when finished
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? "warn" : "info";

      req.logger![logLevel]("Request completed", {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    });

    next();
  };
