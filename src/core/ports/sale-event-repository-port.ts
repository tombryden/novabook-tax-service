import type { SaleEvent } from "../entities/sale-event/sale-event";

export interface SaleEventRepositoryPort {
  /**
   * Upserts a sale event
   */
  save(saleEvent: SaleEvent): Promise<SaleEvent>;
}
