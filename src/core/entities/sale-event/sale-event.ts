import { generateId } from "../../../infrastructure/utils";
import { SaleEventItem } from "./sale-event-item";

export class SaleEvent {
  constructor({
    id,
    invoiceId,
    date,
    items,
  }: {
    id?: string;
    invoiceId: string;
    date: Date;
    items?: Omit<
      ConstructorParameters<typeof SaleEventItem>[0],
      "saleEventId"
    >[];
  }) {
    this.id = id ?? generateId();
    this.invoiceId = invoiceId;
    this.date = date;
    if (items) {
      this.items = [];
      for (const item of items) {
        this.items.push(new SaleEventItem({ ...item, saleEventId: this.id }));
      }
    }
  }

  id: string;

  invoiceId: string;

  date: Date;

  /**
   * Lazily loaded items for this sales event
   */
  items?: SaleEventItem[];
}
