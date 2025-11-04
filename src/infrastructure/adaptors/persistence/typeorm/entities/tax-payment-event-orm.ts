import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { TaxPaymentEvent } from "../../../../../core/entities/tax-payment-event";

@Entity({ name: "tax_payment_events" })
export class TaxPaymentEventORM extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  date!: Date;

  @Column()
  amount!: number;

  // #region Mappers
  static fromDomain(taxPaymentEvent: TaxPaymentEvent): TaxPaymentEventORM {
    return TaxPaymentEventORM.create({ ...taxPaymentEvent });
  }

  static toDomain(taxPaymentEventOrm: TaxPaymentEventORM): TaxPaymentEvent {
    return new TaxPaymentEvent(taxPaymentEventOrm);
  }
  // #endregion
}
