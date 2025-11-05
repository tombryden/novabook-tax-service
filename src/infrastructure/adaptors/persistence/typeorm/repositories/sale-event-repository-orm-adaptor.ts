import type { SaleEvent } from "../../../../../core/entities/sale-event/sale-event";
import type { SaleEventRepositoryPort } from "../../../../../core/ports/sale-event-repository-port";
import { SaleEventORM } from "../entities/sale-event/sale-event-orm";

export class SaleEventRepositoryORMAdaptor implements SaleEventRepositoryPort {
  async save(saleEvent: SaleEvent): Promise<SaleEvent> {
    const resp = await SaleEventORM.save(SaleEventORM.fromDomain(saleEvent));

    return SaleEventORM.toDomain(resp);
  }

  async findTotalSaleEventItemsTaxBeforeOrEqualToDate(
    date: Date
  ): Promise<number> {
    // Intentional aggregation query here instead of calculating with much less efficiency at scale with node.js
    const result = await SaleEventORM.createQueryBuilder("saleEvent")
      .innerJoin("saleEvent.items", "item")
      .select("SUM(item.cost * item.taxRate)", "totalTax")
      .where("saleEvent.date <= :date", { date })
      .getRawOne<{ totalTax: number | null }>();

    return result?.totalTax ?? 0;
  }

  existsByInvoiceId(invoiceId: string): Promise<boolean> {
    return SaleEventORM.existsBy({ invoiceId });
  }
}
