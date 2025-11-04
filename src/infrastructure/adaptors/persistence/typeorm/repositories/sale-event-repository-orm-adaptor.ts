import type { SaleEvent } from "../../../../../core/entities/sale-event/sale-event";
import type { SaleEventRepositoryPort } from "../../../../../core/ports/sale-event-repository-port";
import { SaleEventORM } from "../entities/sale-event/sale-event-orm";
import type { DataSource, Repository } from "typeorm";
import { inject, injectable } from "tsyringe";
import { DI } from "../../../../di-tokens";

@injectable()
export class SaleEventRepositoryORMAdaptor implements SaleEventRepositoryPort {
  constructor(@inject(DI.dataSource) dataSource: DataSource) {
    this.saleEventRepository = dataSource.getRepository(SaleEventORM);
  }

  private saleEventRepository: Repository<SaleEventORM>;

  async save(saleEvent: SaleEvent): Promise<SaleEvent> {
    const resp = await this.saleEventRepository.save(
      SaleEventORM.fromDomain(saleEvent)
    );

    return SaleEventORM.toDomain(resp);
  }
}
