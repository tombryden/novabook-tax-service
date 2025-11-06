import "reflect-metadata";

import { registerDi } from "./infrastructure/di/register-di";
registerDi();

import express from "express";
import { container } from "tsyringe";
import { dataSource } from "./infrastructure/adaptors/persistence/typeorm/data-source";
import { createLoggingMiddleware } from "./infrastructure/adaptors/http/middleware/logging-middleware";
import { createErrorHandlingMiddleware } from "./infrastructure/adaptors/http/middleware/error-handling-middleware";
import type { LoggerPort } from "./core/ports/logger-port";
import { DI } from "./infrastructure/di/di-tokens";
import { transactionsRouter } from "./infrastructure/adaptors/http/routes/transactions-router";
import { taxPositionRouter } from "./infrastructure/adaptors/http/routes/tax-position-router";
import { saleRouter } from "./infrastructure/adaptors/http/routes/sale-router";

const init = async () => {
  const logger = container.resolve<LoggerPort>(DI.loggerPort);

  logger.info("Initializing database connection");
  await dataSource.initialize();
  logger.info("Database connection established");

  const app = express();
  app.use(express.json());
  app.use(createLoggingMiddleware(logger));

  const port = 4000;

  app.use("/transactions", transactionsRouter);
  app.use("/tax-position", taxPositionRouter);
  app.use("/sale", saleRouter);

  // Error handling middleware must be last (https://expressjs.com/en/guide/error-handling.html)
  app.use(createErrorHandlingMiddleware());

  app.listen(port, () => {
    logger.info("Tax service started", { port });
  });
};

init();
