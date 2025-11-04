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
}
