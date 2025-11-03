import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { SQLiteSaleEventItem } from "./sqlite-sale-event-item";

@Entity({ name: "sale_events" })
export class SQLiteSaleEvent {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "invoice_id" })
  invoiceId!: string;

  @Column()
  date!: Date;

  // #region Relations
  @OneToMany(() => SQLiteSaleEventItem, (item) => item.saleEventId)
  items?: SQLiteSaleEventItem[];
  // #endregion
}
