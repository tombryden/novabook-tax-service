import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { SaleEventORM } from "./sale-event-orm";

@Entity({ name: "sale_event_items" })
export class SaleEventItemORM extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "sale_event_id" })
  saleEventId!: string;

  @Column({ name: "item_id" })
  itemId!: string;

  @Column()
  cost!: number;

  @Column()
  taxRate!: number;

  // #region Relations
  @ManyToOne(() => SaleEventORM, (event) => event.items)
  @JoinColumn({ name: "sale_event_id" })
  saleEvent?: SaleEventORM;
  // #endregion
}
