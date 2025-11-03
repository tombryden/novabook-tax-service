import { generateId } from "../../../infrastructure/utils";

export class SaleEventItem {
  constructor({
    id,
    itemId,
    cost,
    taxRate,
    saleEventId,
  }: {
    id?: string;
    itemId: string;
    cost: number;
    taxRate: number;
    saleEventId: string;
  }) {
    this.id = id ?? generateId();

    this.itemId = itemId;

    if (cost <= 0) {
      throw new Error("Item cost must be more than 0");
    }
    this.cost = cost;

    this.taxRate = taxRate;

    this.saleEventId = saleEventId;
  }

  id: string;

  /**
   * Which sale event this item relates to
   */
  saleEventId: string;

  /**
   * Presuming here an itemId correlates to a product, like itemId 123 = 'Evian Water 500ml'
   */
  itemId: string;

  cost: number;

  taxRate: number;
}
