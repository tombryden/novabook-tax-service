import { inject, injectable } from "tsyringe";
import { DI } from "../../infrastructure/di/di-tokens";
import type { SaleEventAmendmentRepositoryPort } from "../ports/sale-event-amendment-repository-port";
import { SaleEventAmendment } from "../entities/sale-event/sale-event-amendment";
import type { LoggerPort } from "../ports/logger-port";

/**
 * Creates (or updates if matching date + invoice + item) an amendment
 */
@injectable()
export class UpsertAmendmentUseCase {
  constructor(
    @inject(DI.saleEventAmendmentRepositoryPort)
    private readonly saleEventAmendmentRepository: SaleEventAmendmentRepositoryPort,
    @inject(DI.loggerPort)
    private readonly logger: LoggerPort
  ) {}

  async execute(
    date: Date,
    invoiceId: string,
    itemId: string,
    cost: number,
    taxRate: number
  ) {
    this.logger.info("Upserting amendment", {
      date: date.toISOString(),
      invoiceId,
      itemId,
      cost,
      taxRate,
    });

    // Find existing, if found, update existing amendment, if not create new
    let amendment =
      await this.saleEventAmendmentRepository.findOneByInvoiceIdDateAndItemId(
        invoiceId,
        date,
        itemId
      );

    const isNewAmendment = !amendment;

    if (!amendment) {
      amendment = new SaleEventAmendment({
        date,
        invoiceId,
        itemId,
        cost,
        taxRate,
      });
    }

    amendment.invoiceId = invoiceId;
    amendment.itemId = itemId;
    amendment.cost = cost;
    amendment.taxRate = taxRate;

    const result = await this.saleEventAmendmentRepository.save(amendment);

    this.logger.info(
      isNewAmendment ? "Amendment created" : "Amendment updated",
      {
        invoiceId,
        itemId,
        cost,
        taxRate,
        date: date.toISOString(),
      }
    );

    return result;
  }
}
