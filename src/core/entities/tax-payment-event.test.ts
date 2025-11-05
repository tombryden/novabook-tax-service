import { TaxPaymentEvent } from "./tax-payment-event";

describe("TaxPaymentEvent Domain Entity", () => {
  describe("validation", () => {
    it("should pass validation", () => {
      new TaxPaymentEvent({
        date: new Date(),
        amount: 10,
      });
    });

    it("should throw if amount is not above 0", () => {
      expect(() => {
        new TaxPaymentEvent({
          date: new Date(),
          amount: 0,
        });
      }).toThrow("Tax payment amount must be more than 0");
    });
  });
});
