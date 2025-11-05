import { DataSource } from "typeorm";
import { TaxPaymentEventORM } from "./entities/tax-payment-event-orm";
import { SaleEventORM } from "./entities/sale-event/sale-event-orm";
import { SaleEventItemORM } from "./entities/sale-event/sale-event-item-orm";
import { SaleEventAmendmentORM } from "./entities/sale-event/sale-event-amendment-orm";

export const dataSource = new DataSource({
  type: "sqlite",
  // database: ":memory:",
  database: "tax-service.sqlite",
  entities: [
    SaleEventORM,
    SaleEventItemORM,
    SaleEventAmendmentORM,
    TaxPaymentEventORM,
  ],
  synchronize: true,
});
