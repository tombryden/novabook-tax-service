import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { SaleEventItemORM } from "./sale-event-item-orm";
import { SaleEvent } from "../../../../../../core/entities/sale-event/sale-event";

@Entity({ name: "sale_events" })
export class SaleEventORM extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "invoice_id" })
  invoiceId!: string;

  @Column()
  date!: Date;

  // #region Relations
  @OneToMany(() => SaleEventItemORM, (item) => item.saleEventId, {
    cascade: ["insert", "remove", "update"],
  })
  items?: SaleEventItemORM[];
  // #endregion

  // #region Mappers
  static fromDomain(saleEvent: SaleEvent): SaleEventORM {
    return SaleEventORM.create({ ...saleEvent });
  }

  static toDomain(saleEventOrm: SaleEventORM): SaleEvent {
    return new SaleEvent(saleEventOrm);
  }
  // #endregion
}
