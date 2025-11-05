import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { SaleEventAmendment } from "../../../../../../core/entities/sale-event/sale-event-amendment";

@Entity({ name: "sale_event_amendments" })
export class SaleEventAmendmentORM extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  date!: Date;

  @Column({ name: "invoice_id" })
  invoiceId!: string;

  @Column({ name: "item_id" })
  itemId!: string;

  @Column()
  cost!: number;

  @Column({ type: "real" })
  taxRate!: number;

  // #region Mappers
  static fromDomain(amendment: SaleEventAmendment): SaleEventAmendmentORM {
    return SaleEventAmendmentORM.create({ ...amendment });
  }

  static toDomain(amendmentOrm: SaleEventAmendmentORM): SaleEventAmendment {
    return new SaleEventAmendment(amendmentOrm);
  }
  // #endregion
}
