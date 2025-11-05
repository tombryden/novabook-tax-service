import { ItemBase, type ItemBaseConstructor } from "./item-base";

export class SaleEventItem extends ItemBase {
  constructor({
    saleEventId,
    ...base
  }: ItemBaseConstructor & { saleEventId: string }) {
    super(base);
    this.saleEventId = saleEventId;
  }

  /**
   * Which sale event this item relates to
   */
  saleEventId: string;
}
