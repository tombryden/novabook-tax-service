import { SaleEventItem } from "./sale-event-item";

describe("SaleEventItem Domain Entity", () => {
  describe("validation", () => {
    it("should pass validation", () => {
      new SaleEventItem({
        itemId: "123",
        cost: 10,
        taxRate: 0.2,
        saleEventId: "123",
      });
    });

    it("should throw if cost is not above 0", () => {
      expect(() => {
        new SaleEventItem({
          itemId: "123",
          cost: 0,
          taxRate: 0.2,
          saleEventId: "123",
        });
      }).toThrow("Item cost must be more than 0");
    });
  });
});
