import type { SaleEventAmendment } from "../../../../../core/entities/sale-event/sale-event-amendment";
import type { SaleEventAmendmentRepositoryPort } from "../../../../../core/ports/sale-event-amendment-repository-port";
import { SaleEventAmendmentORM } from "../entities/sale-event/sale-event-amendment-orm";

export class SaleEventAmendmentRepositoryORMAdaptor
  implements SaleEventAmendmentRepositoryPort
{
  async save(amendment: SaleEventAmendment): Promise<SaleEventAmendment> {
    const resp = await SaleEventAmendmentORM.save(
      SaleEventAmendmentORM.fromDomain(amendment)
    );

    return SaleEventAmendmentORM.toDomain(resp);
  }

  async findOneByInvoiceIdDateAndItemId(
    invoiceId: string,
    date: Date,
    itemId: string
  ): Promise<SaleEventAmendment | null> {
    const resp = await SaleEventAmendmentORM.findOneBy({
      invoiceId,
      date,
      itemId,
    });
    if (!resp) {
      return null;
    }
    return SaleEventAmendmentORM.toDomain(resp);
  }
}
