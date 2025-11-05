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

      // Ensure that the same itemId can only appear once in the same sale event (in README.md assumptions)
      const existingItemIds = new Set<string>();

      for (const item of items) {
        if (existingItemIds.has(item.itemId))
          throw new Error(
            `A sale event can only have unique itemIds. ${item.itemId} appears more than once.`
          );

        existingItemIds.add(item.itemId);

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
