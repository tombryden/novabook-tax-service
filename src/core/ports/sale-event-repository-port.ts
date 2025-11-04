import type { SaleEvent } from "../entities/sale-event/sale-event";

export interface SaleEventRepositoryPort {
  /**
   * Upserts a sale event
   */
  save(saleEvent: SaleEvent): Promise<SaleEvent>;

  /**
   * Finds total tax of all sale event items before or equal to a date
   */
  findTotalSaleEventItemsTaxBeforeOrEqualToDate(date: Date): Promise<number>;
}
