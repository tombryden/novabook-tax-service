import type { DataSource, Repository } from "typeorm";
import { inject, injectable } from "tsyringe";
import { DI } from "../../../../di-tokens";
import type { TaxPaymentEventRepositoryPort } from "../../../../../core/ports/tax-payment-event-repository";
import { TaxPaymentEventORM } from "../entities/tax-payment-event-orm";
import type { TaxPaymentEvent } from "../../../../../core/entities/tax-payment-event";

@injectable()
export class TaxPaymentEventRepositoryORMAdaptor
  implements TaxPaymentEventRepositoryPort
{
  constructor(@inject(DI.dataSource) dataSource: DataSource) {
    this.taxPaymentEventRepository =
      dataSource.getRepository(TaxPaymentEventORM);
  }

  private taxPaymentEventRepository: Repository<TaxPaymentEventORM>;

  save(taxPaymentEvent: TaxPaymentEvent): Promise<TaxPaymentEvent> {
    return this.taxPaymentEventRepository.save(
      TaxPaymentEventORM.fromDomain(taxPaymentEvent)
    );
  }
}
