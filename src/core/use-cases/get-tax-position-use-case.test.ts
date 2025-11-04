import "reflect-metadata";

import { container } from "tsyringe";
import type { SaleEventRepositoryPort } from "../ports/sale-event-repository-port";
import type { TaxPaymentEventRepositoryPort } from "../ports/tax-payment-event-repository";
import { DI } from "../../infrastructure/di/di-tokens";
import { GetTaxPositionUseCase } from "./get-tax-position-use-case";

describe("GetTaxPositionUseCase", () => {
  const childContainer = container.createChildContainer();

  // Container registration
  const mockSaleEventRepository: Partial<SaleEventRepositoryPort> = {
    findTotalSaleEventItemsTaxBeforeOrEqualToDate: jest
      .fn()
      .mockResolvedValue(2000),
  };
  const mockTaxPaymentEventRepository: Partial<TaxPaymentEventRepositoryPort> =
    {
      findTotalTaxPaymentAmountsBeforeOrEqualToDate: jest
        .fn()
        .mockResolvedValue(1000),
    };
  childContainer.register(DI.saleEventRepositoryPort, {
    useValue: mockSaleEventRepository,
  });
  childContainer.register(DI.taxPaymentEventRepositoryPort, {
    useValue: mockTaxPaymentEventRepository,
  });

  // Use Case
  const useCase = childContainer.resolve(GetTaxPositionUseCase);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct tax position", () => {
    expect(useCase.execute(new Date())).resolves.toBe(1000);
  });
});
