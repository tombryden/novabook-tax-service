import { inject, injectable } from "tsyringe";
import { DI } from "../../infrastructure/di/di-tokens";
import type { SaleEventAmendmentRepositoryPort } from "../ports/sale-event-amendment-repository-port";
import { SaleEventAmendment } from "../entities/sale-event/sale-event-amendment";

/**
 * Creates (or updates if matching date + invoice + item) an amendment
 */
@injectable()
export class UpsertAmendmentUseCase {
  constructor(
    @inject(DI.saleEventAmendmentRepositoryPort)
    private readonly saleEventAmendmentRepository: SaleEventAmendmentRepositoryPort
  ) {}

  async execute(
    date: Date,
    invoiceId: string,
    itemId: string,
    cost: number,
    taxRate: number
  ) {
    // Find existing, if found, update existing amendment, if not create new
    let amendment =
      await this.saleEventAmendmentRepository.findOneByInvoiceIdDateAndItemId(
        invoiceId,
        date,
        itemId
      );
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

    return this.saleEventAmendmentRepository.save(amendment);
  }
}
