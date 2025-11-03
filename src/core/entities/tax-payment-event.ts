import { generateId } from "../../infrastructure/utils";

export class TaxPaymentEvent {
  constructor({
    id,
    date,
    amount,
  }: {
    id?: string;
    date: Date;
    amount: number;
  }) {
    this.id = id ?? generateId();
    this.date = date;

    if (amount <= 0) {
      throw new Error("Tax payment amount must be more than 0");
    }
    this.amount = amount;
  }

  id: string;

  date: Date;

  amount: number;
}
