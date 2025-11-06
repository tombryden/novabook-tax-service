import { container } from "tsyringe";
import type { LoggerPort } from "../core/ports/logger-port";
import { DI } from "./di/di-tokens";

/**
 * Mocks the logger in IoC for tests
 */
export const initialiseTestLoggerDI = () => {
  const mockLogger: LoggerPort = {
    debug: jest.fn(),
    child: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  container.register(DI.loggerPort, { useValue: mockLogger });
};
