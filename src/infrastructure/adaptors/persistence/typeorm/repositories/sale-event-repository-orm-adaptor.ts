import type { SaleEvent } from "../../../../../core/entities/sale-event/sale-event";
import type { SaleEventRepositoryPort } from "../../../../../core/ports/sale-event-repository-port";
import { SaleEventORM } from "../entities/sale-event/sale-event-orm";

export class SaleEventRepositoryORMAdaptor implements SaleEventRepositoryPort {
  async save(saleEvent: SaleEvent): Promise<SaleEvent> {
    const resp = await SaleEventORM.save(SaleEventORM.fromDomain(saleEvent));

    return SaleEventORM.toDomain(resp);
  }
}
