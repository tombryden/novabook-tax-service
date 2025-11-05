import { SaleEvent } from "./sale-event";

describe("SaleEvent Domain Entity", () => {
  describe("validation", () => {
    it("should pass validation", () => {
      new SaleEvent({
        date: new Date(),
        invoiceId: "123",
        items: [
          { taxRate: 0.2, cost: 1000, itemId: "123" },
          { taxRate: 0.2, cost: 1000, itemId: "1234" },
        ],
      });
    });

    it("should throw if there are multiple of the same itemIds", () => {
      expect(() => {
        new SaleEvent({
          date: new Date(),
          invoiceId: "123",
          items: [
            { taxRate: 0.2, cost: 1000, itemId: "123" },
            { taxRate: 0.2, cost: 1000, itemId: "123" },
          ],
        });
      }).toThrow(
        "A sale event can only have unique itemIds. 123 appears more than once."
      );
    });
  });
});
