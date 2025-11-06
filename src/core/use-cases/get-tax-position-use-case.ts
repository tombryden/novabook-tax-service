import { inject, injectable } from "tsyringe";
import type { SaleEventRepositoryPort } from "../ports/sale-event-repository-port";
import type { TaxPaymentEventRepositoryPort } from "../ports/tax-payment-event-repository";
import type { LoggerPort } from "../ports/logger-port";
import { DI } from "../../infrastructure/di/di-tokens";

/**
 * Finds current tax position on a given date.
 *
 * Tax position = total tax of sale event items - total tax payment event amounts
 */
@injectable()
export class GetTaxPositionUseCase {
  constructor(
    @inject(DI.saleEventRepositoryPort)
    private readonly saleEventRepository: SaleEventRepositoryPort,
    @inject(DI.taxPaymentEventRepositoryPort)
    private readonly taxPaymentEventRepository: TaxPaymentEventRepositoryPort,
    @inject(DI.loggerPort)
    private readonly logger: LoggerPort
  ) {}

  async execute(date: Date) {
    this.logger.info("Calculating tax position", {
      date: date.toISOString(),
    });

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

    this.logger.info("Tax position calculated", {
      date: date.toISOString(),
      totalSalesTax: totalSaleEventItemsTax,
      totalPayments: totalTaxPaymentAmounts,
      taxPosition,
    });

    return taxPosition;
  }
}
