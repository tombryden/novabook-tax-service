import type { TaxPaymentEvent } from "../entities/tax-payment-event";

export interface TaxPaymentEventRepositoryPort {
  /**
   * Upserts a tax payment event
   */
  save(taxPaymentEvent: TaxPaymentEvent): Promise<TaxPaymentEvent>;

  /**
   * Finds total tax payment amounts before or equal to a date
   */
  findTotalTaxPaymentAmountsBeforeOrEqualToDate(date: Date): Promise<number>;
}
