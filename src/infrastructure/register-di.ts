import { container } from "tsyringe";
import { SaleEventRepositoryORMAdaptor } from "./adaptors/persistence/typeorm/repositories/sale-event-repository-orm-adaptor";
import { dataSource } from "./adaptors/persistence/typeorm/data-source";
import { TaxPaymentEventRepositoryORMAdaptor } from "./adaptors/persistence/typeorm/repositories/tax-payment-event-repository-orm-adaptor";
import { DI } from "./di-tokens";

export const registerDi = () => {
  // Data source for repository ORM adaptors, so we can swap out db's by simply changing the typeorm data source
  container.register(DI.dataSource, { useValue: dataSource });

  // Repositories
  container.registerSingleton(
    DI.saleEventRepositoryPort,
    SaleEventRepositoryORMAdaptor
  );
  container.registerSingleton(
    DI.taxPaymentEventRepositoryPort,
    TaxPaymentEventRepositoryORMAdaptor
  );
};
