import { generateId } from "../../../infrastructure/utils";
import type { SaleEventItem } from "./sale-event-item";

export class SaleEvent {
  constructor({
    id,
    invoiceId,
    date,
  }: {
    id?: string;
    invoiceId: string;
    date: Date;
  }) {
    this.id = id ?? generateId();
    this.invoiceId = invoiceId;
    this.date = date;
  }

  id: string;

  invoiceId: string;

  date: Date;

  /**
   * Lazily loaded items for this sales event
   */
  items?: SaleEventItem[];
}
