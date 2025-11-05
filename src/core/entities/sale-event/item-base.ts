import { generateId } from "../../../infrastructure/utils";

export interface ItemBaseConstructor {
  id?: string;
  itemId: string;
  cost: number;
  taxRate: number;
}

/**
 * Abstract base for an item - used by:
 * - the actual sale event items
 * - amendments
 *
 * Ensures any domain validation logic remains centralised (e.g. don't allow items <= 0 cost)
 */
export abstract class ItemBase {
  constructor({ id, itemId, cost, taxRate }: ItemBaseConstructor) {
    this.id = id ?? generateId();

    this.itemId = itemId;

    if (cost <= 0) {
      throw new Error("Item cost must be more than 0");
    }
    this.cost = cost;

    this.taxRate = taxRate;
  }

  id: string;

  /**
   * Presuming here an itemId correlates to a product, like itemId 123 = 'Evian Water 500ml'
   */
  itemId: string;

  cost: number;

  taxRate: number;
}
