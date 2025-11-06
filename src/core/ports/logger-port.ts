export interface LoggerPort {
  /**
   * Logs an informational message with optional context
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a warning message with optional context
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an error message with error object and optional context
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ): void;

  /**
   * Logs a debug message with optional context
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Creates a child logger with additional context
   */
  child(bindings: Record<string, unknown>): LoggerPort;
}
