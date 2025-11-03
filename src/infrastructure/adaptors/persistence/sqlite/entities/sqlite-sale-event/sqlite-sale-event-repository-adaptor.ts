import type { SaleEvent } from "../../../../../../core/entities/sale-event/sale-event";
import type { SaleEventRepositoryPort } from "../../../../../../core/ports/sale-event-repository-port";

export class SQLiteSaleEventRepositoryAdaptor
  implements SaleEventRepositoryPort
{
  save(saleEvent: SaleEvent): Promise<SaleEvent> {}
}
