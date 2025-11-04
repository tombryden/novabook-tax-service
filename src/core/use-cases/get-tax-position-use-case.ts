import { inject, injectable } from "tsyringe";
import type { SaleEventRepositoryPort } from "../ports/sale-event-repository-port";
import type { TaxPaymentEventRepositoryPort } from "../ports/tax-payment-event-repository";

/**
 * Finds current tax position on a given date.
 *
 * Tax position = total tax of sale event items - total tax payment event amounts
 */
@injectable()
export class GetTaxPositionUseCase {
  constructor(
    @inject("SaleEventRepositoryPort")
    private readonly saleEventRepository: SaleEventRepositoryPort,
    @inject("TaxPaymentEventRepositoryPort")
    private readonly taxPaymentEventRepository: TaxPaymentEventRepositoryPort
  ) {}

  async execute(date: Date) {
    const totalSaleEventItemsTax =
      await this.saleEventRepository.findTotalSaleEventItemsTaxBeforeOrEqualToDate(
        date
      );
    const totalTaxPaymentAmounts =
      await this.taxPaymentEventRepository.findTotalTaxPaymentAmountsBeforeOrEqualToDate(
        date
      );

    // Tax position = total tax of sale event items - total tax payment amounts
    const taxPosition = totalSaleEventItemsTax - totalTaxPaymentAmounts;

    return taxPosition;
  }
}
