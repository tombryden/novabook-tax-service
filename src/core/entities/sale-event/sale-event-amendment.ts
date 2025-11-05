import { ItemBase, type ItemBaseConstructor } from "./item-base";

export class SaleEventAmendment extends ItemBase {
  constructor({
    date,
    invoiceId,
    ...base
  }: ItemBaseConstructor & { date: Date; invoiceId: string }) {
    super(base);
    this.date = date;
    this.invoiceId = invoiceId;
  }

  date: Date;

  invoiceId: string;
}
