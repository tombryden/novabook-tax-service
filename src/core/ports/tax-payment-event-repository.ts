import type { TaxPaymentEvent } from "../entities/tax-payment-event";

export interface TaxPaymentEventRepositoryPort {
  /**
   * Upserts a tax payment event
   */
  save(taxPaymentEvent: TaxPaymentEvent): Promise<TaxPaymentEvent>;
}
