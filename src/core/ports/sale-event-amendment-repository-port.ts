import type { SaleEventAmendment } from "../entities/sale-event/sale-event-amendment";

export interface SaleEventAmendmentRepositoryPort {
  /**
   * Finds an amendment by invoiceId + date + itemId
   */
  findOneByInvoiceIdDateAndItemId(
    invoiceId: string,
    date: Date,
    itemId: string
  ): Promise<SaleEventAmendment | null>;

  /**
   * Upserts an amendment
   */
  save(amendment: SaleEventAmendment): Promise<SaleEventAmendment>;
}
