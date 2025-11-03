import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { SQLiteSaleEvent } from "./sqlite-sale-event";

@Entity({ name: "sale_event_items" })
export class SQLiteSaleEventItem {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "sale_event_id" })
  saleEventId!: string;

  @Column({ name: "item_id" })
  itemId!: string;

  @Column()
  cost!: number;

  @Column({ name: "cost" })
  taxRate!: number;

  // #region Relations
  @ManyToOne(() => SQLiteSaleEvent, (event) => event.items)
  @JoinColumn({ name: "sale_event_id" })
  saleEvent?: SQLiteSaleEventItem;
  // #endregion
}
