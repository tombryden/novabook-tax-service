import type { TaxPaymentEventRepositoryPort } from "../../../../../core/ports/tax-payment-event-repository";
import { TaxPaymentEventORM } from "../entities/tax-payment-event-orm";
import type { TaxPaymentEvent } from "../../../../../core/entities/tax-payment-event";

export class TaxPaymentEventRepositoryORMAdaptor
  implements TaxPaymentEventRepositoryPort
{
  save(taxPaymentEvent: TaxPaymentEvent): Promise<TaxPaymentEvent> {
    return TaxPaymentEventORM.save(
      TaxPaymentEventORM.fromDomain(taxPaymentEvent)
    );
  }

  async findTotalTaxPaymentAmountsBeforeOrEqualToDate(
    date: Date
  ): Promise<number> {
    // Intentional aggregation query here instead of calculating with much less efficiency at scale with node.js
    const result = await TaxPaymentEventORM.createQueryBuilder(
      "taxPaymentEvent"
    )
      .select("SUM(taxPaymentEvent.amount)", "totalTaxPaid")
      .where("taxPaymentEvent.date <= :date", { date })
      .getRawOne<{ totalTaxPaid: number | null }>();

    return result?.totalTaxPaid ?? 0;
  }
}
