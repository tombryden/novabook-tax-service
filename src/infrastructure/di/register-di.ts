import { container } from "tsyringe";
import pino from "pino";
import { SaleEventRepositoryORMAdaptor } from "../adaptors/persistence/typeorm/repositories/sale-event-repository-orm-adaptor";
import { TaxPaymentEventRepositoryORMAdaptor } from "../adaptors/persistence/typeorm/repositories/tax-payment-event-repository-orm-adaptor";
import { DI } from "./di-tokens";
import { SaleEventAmendmentRepositoryORMAdaptor } from "../adaptors/persistence/typeorm/repositories/sale-event-amendment-repository-orm-adaptor";
import { LoggerPinoAdaptor } from "../adaptors/logging/logger-pino-adaptor";

export const registerDi = () => {
  // Logger
  const pinoLogger = pino({
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  });

  container.registerInstance(DI.loggerPort, new LoggerPinoAdaptor(pinoLogger));

  // Repositories
  container.registerSingleton(
    DI.saleEventRepositoryPort,
    SaleEventRepositoryORMAdaptor
  );
  container.registerSingleton(
    DI.saleEventAmendmentRepositoryPort,
    SaleEventAmendmentRepositoryORMAdaptor
  );
  container.registerSingleton(
    DI.taxPaymentEventRepositoryPort,
    TaxPaymentEventRepositoryORMAdaptor
  );
};
