import type { SaleEvent } from "../../../../../core/entities/sale-event/sale-event";
import type { SaleEventRepositoryPort } from "../../../../../core/ports/sale-event-repository-port";
import { SaleEventORM } from "../entities/sale-event/sale-event-orm";
import { SaleEventAmendmentORM } from "../entities/sale-event/sale-event-amendment-orm";
import { LessThanOrEqual, In } from "typeorm";

export class SaleEventRepositoryORMAdaptor implements SaleEventRepositoryPort {
  async save(saleEvent: SaleEvent): Promise<SaleEvent> {
    const resp = await SaleEventORM.save(SaleEventORM.fromDomain(saleEvent));

    return SaleEventORM.toDomain(resp);
  }

  async findTotalSaleEventItemsTaxBeforeOrEqualToDate(
    date: Date
  ): Promise<number> {
    // This could be optimised further by moving to a pure sql aggregation query - but for readability I'm using TypeScript

    // Pull all sale events, and amendments before the query date that have a matching sale event invoice
    const saleEvents = await SaleEventORM.find({
      where: {
        date: LessThanOrEqual(date),
      },
      relations: {
        items: true,
      },
    });
    const amendmentsWithSaleEvents = await SaleEventAmendmentORM.find({
      where: {
        invoiceId: In(saleEvents.map((se) => se.invoiceId)),
        date: LessThanOrEqual(date),
      },
    });

    // Create map of invoice id + item id -> latest amendment for o(1) lookup
    const getAmendmentMapKey = (invoiceId: string, itemId: string) =>
      `${invoiceId}_${itemId}`;

    const amendmentsMap = new Map<string, SaleEventAmendmentORM>();
    for (const amendment of amendmentsWithSaleEvents) {
      const key = getAmendmentMapKey(amendment.invoiceId, amendment.itemId);

      const currentAmendment = amendmentsMap.get(key);
      if (!currentAmendment) {
        amendmentsMap.set(key, amendment);
        continue;
      }

      // Check if amendment has a later date than the current in the map key
      if (amendment.date > currentAmendment.date)
        amendmentsMap.set(key, amendment);
    }

    // 1. Loop through sale events + their items
    // 2. check if any amendments exist for the item
    // 3. use the amendment for the item tax calculation if its date >= sale event date (ignores amendments dated before the sale event date)
    let totalTax = 0;
    for (const saleEvent of saleEvents) {
      for (const item of saleEvent.items!) {
        const latestAmendment = amendmentsMap.get(
          getAmendmentMapKey(saleEvent.invoiceId, item.itemId)
        );

        // Only apply the amendment if its dated >= to the sale event date
        if (latestAmendment && latestAmendment.date >= saleEvent.date) {
          totalTax += latestAmendment.cost * latestAmendment.taxRate;
        } else {
          // No amendments, add to tax
          totalTax += item.cost * item.taxRate;
        }
      }
    }

    return totalTax;
  }

  existsByInvoiceId(invoiceId: string): Promise<boolean> {
    return SaleEventORM.existsBy({ invoiceId });
  }
}
