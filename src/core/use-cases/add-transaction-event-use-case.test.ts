import "reflect-metadata";

import { container } from "tsyringe";
import { AddTransactionEventUseCase } from "./add-transaction-event-use-case";
import type { SaleEventRepositoryPort } from "../ports/sale-event-repository-port";
import type { TaxPaymentEventRepositoryPort } from "../ports/tax-payment-event-repository";
import { DI } from "../../infrastructure/di/di-tokens";
import { initialiseTestLoggerDI } from "../../infrastructure/test-setup";

describe("AddTransactionEventUseCase", () => {
  initialiseTestLoggerDI();

  const childContainer = container.createChildContainer(); // so parallel running test files don't get their IoC container mixed up

  // Container registration
  const mockSaleEventRepository: Partial<SaleEventRepositoryPort> = {
    save: jest.fn(),
    existsByInvoiceId: jest.fn().mockResolvedValue(false),
  };
  const mockTaxPaymentEventRepository: Partial<TaxPaymentEventRepositoryPort> =
    {
      save: jest.fn(),
    };
  childContainer.register(DI.saleEventRepositoryPort, {
    useValue: mockSaleEventRepository,
  });
  childContainer.register(DI.taxPaymentEventRepositoryPort, {
    useValue: mockTaxPaymentEventRepository,
  });

  // Use Case
  const useCase = childContainer.resolve(AddTransactionEventUseCase);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("TAX_PAYMENT", () => {
    it("should save new tax payment event", async () => {
      await useCase.execute({
        eventType: "TAX_PAYMENT",
        date: new Date(),
        amount: 10,
      });

      expect(mockTaxPaymentEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should throw if no amount", () => {
      expect(
        useCase.execute({
          eventType: "TAX_PAYMENT",
          date: new Date(),
        })
      ).rejects.toThrow("You must supply an amount with a tax payment event");
      expect(mockTaxPaymentEventRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should throw if invoice id is passed", () => {
      expect(
        useCase.execute({
          eventType: "TAX_PAYMENT",
          date: new Date(),
          amount: 10,
          invoiceId: "123",
        })
      ).rejects.toThrow(
        "Tax payment event cannot accept an invoice id or items"
      );
      expect(mockTaxPaymentEventRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should throw if items are passed", () => {
      expect(
        useCase.execute({
          eventType: "TAX_PAYMENT",
          date: new Date(),
          amount: 10,
          items: [{ itemId: "123", cost: 10, taxRate: 0.2 }],
        })
      ).rejects.toThrow(
        "Tax payment event cannot accept an invoice id or items"
      );
      expect(mockTaxPaymentEventRepository.save).toHaveBeenCalledTimes(0);
    });
  });

  describe("SALES", () => {
    it("should save new sale event", async () => {
      await useCase.execute({
        eventType: "SALES",
        date: new Date(),
        invoiceId: "123",
        items: [{ itemId: "123", cost: 10, taxRate: 0.2 }],
      });

      expect(mockSaleEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should throw if no invoice id is passed", () => {
      expect(
        useCase.execute({
          eventType: "SALES",
          date: new Date(),
          items: [{ itemId: "123", cost: 10, taxRate: 0.2 }],
        })
      ).rejects.toThrow(
        "You must supply an invoiceId + item(s) with a sales event"
      );
      expect(mockSaleEventRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should throw if no items are passed", () => {
      expect(
        useCase.execute({
          eventType: "SALES",
          date: new Date(),
          invoiceId: "123",
        })
      ).rejects.toThrow(
        "You must supply an invoiceId + item(s) with a sales event"
      );
      expect(mockSaleEventRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should throw if empty items array is passed", () => {
      expect(
        useCase.execute({
          eventType: "SALES",
          date: new Date(),
          invoiceId: "123",
          items: [],
        })
      ).rejects.toThrow(
        "You must supply an invoiceId + item(s) with a sales event"
      );
      expect(mockSaleEventRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should throw if a sale event with the invoiceId already exists", () => {
      const container = childContainer.createChildContainer();
      const mockSaleEventRepositoryExistingInvoiceId: Partial<SaleEventRepositoryPort> =
        {
          existsByInvoiceId: jest.fn().mockResolvedValue(true),
        };
      container.register(DI.saleEventRepositoryPort, {
        useValue: mockSaleEventRepositoryExistingInvoiceId,
      });
      const alreadyExistsUseCase = container.resolve(
        AddTransactionEventUseCase
      );
      expect(
        alreadyExistsUseCase.execute({
          eventType: "SALES",
          date: new Date(),
          invoiceId: "123",
          items: [{ itemId: "1", cost: 100, taxRate: 0.2 }],
        })
      ).rejects.toThrow("Sale Event with invoiceId 123 already exists");
    });
  });
});
