import type { Logger as PinoLogger } from "pino";
import type { LoggerPort } from "../../../core/ports/logger-port";

export class LoggerPinoAdaptor implements LoggerPort {
  constructor(private readonly pinoLogger: PinoLogger) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.pinoLogger.info(context, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.pinoLogger.warn(context, message);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ): void {
    if (error) {
      this.pinoLogger.error({ ...context, err: error }, message);
    } else {
      this.pinoLogger.error(context, message);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.pinoLogger.debug(context, message);
  }

  child(bindings: Record<string, unknown>): LoggerPort {
    return new LoggerPinoAdaptor(this.pinoLogger.child(bindings));
  }
}
