import "reflect-metadata";

import { container } from "tsyringe";
import { DataSource } from "typeorm";
import { SaleEventAmendmentORM } from "./infrastructure/adaptors/persistence/typeorm/entities/sale-event/sale-event-amendment-orm";
import { SaleEventItemORM } from "./infrastructure/adaptors/persistence/typeorm/entities/sale-event/sale-event-item-orm";
import { SaleEventORM } from "./infrastructure/adaptors/persistence/typeorm/entities/sale-event/sale-event-orm";
import { TaxPaymentEventORM } from "./infrastructure/adaptors/persistence/typeorm/entities/tax-payment-event-orm";
import { SaleEventAmendmentRepositoryORMAdaptor } from "./infrastructure/adaptors/persistence/typeorm/repositories/sale-event-amendment-repository-orm-adaptor";
import { SaleEventRepositoryORMAdaptor } from "./infrastructure/adaptors/persistence/typeorm/repositories/sale-event-repository-orm-adaptor";
import { TaxPaymentEventRepositoryORMAdaptor } from "./infrastructure/adaptors/persistence/typeorm/repositories/tax-payment-event-repository-orm-adaptor";
import { DI } from "./infrastructure/di/di-tokens";
import { AddTransactionEventUseCase } from "./core/use-cases/add-transaction-event-use-case";
import { GetTaxPositionUseCase } from "./core/use-cases/get-tax-position-use-case";
import { UpsertAmendmentUseCase } from "./core/use-cases/upsert-amendment-use-case";
import { initialiseTestLoggerDI } from "./infrastructure/test-setup";

describe("E2E Tests (SQLite In Memory DB)", () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [
        SaleEventORM,
        SaleEventItemORM,
        SaleEventAmendmentORM,
        TaxPaymentEventORM,
      ],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterEach(async () => {
    await dataSource.synchronize(true);
  });

  // Register IoC container with real adaptors
  initialiseTestLoggerDI();
  const childContainer = container.createChildContainer();
  childContainer.registerSingleton(
    DI.saleEventRepositoryPort,
    SaleEventRepositoryORMAdaptor
  );
  childContainer.registerSingleton(
    DI.saleEventAmendmentRepositoryPort,
    SaleEventAmendmentRepositoryORMAdaptor
  );
  childContainer.registerSingleton(
    DI.taxPaymentEventRepositoryPort,
    TaxPaymentEventRepositoryORMAdaptor
  );

  const addTransactionEventUseCase = childContainer.resolve(
    AddTransactionEventUseCase
  );
  const getTaxPositionUseCase = childContainer.resolve(GetTaxPositionUseCase);
  const amendSaleUseCase = childContainer.resolve(UpsertAmendmentUseCase);

  it("should correctly calculate tax position with 2x sales, one payment, and 2x amendments", async () => {
    // Sale 1: Nov 1 - Invoice INV-001 (2 items)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-01"),
      invoiceId: "INV-001",
      items: [
        { itemId: "ITEM-A", cost: 1000, taxRate: 0.2 }, // Tax: 200
        { itemId: "ITEM-B", cost: 500, taxRate: 0.15 }, // Tax: 75
      ],
    });

    // Sale 2: Nov 7 - Invoice INV-002 (1 item)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-07"),
      invoiceId: "INV-002",
      items: [
        { itemId: "ITEM-C", cost: 2000, taxRate: 0.2 }, // Tax: 400
      ],
    });
    const pos1 = await getTaxPositionUseCase.execute(new Date("2025-11-07"));
    expect(pos1).toBe(675);

    // Payment 1: Nov 5 (after Sale 1)
    await addTransactionEventUseCase.execute({
      eventType: "TAX_PAYMENT",
      date: new Date("2025-11-05"),
      amount: 200,
    });
    const pos2 = await getTaxPositionUseCase.execute(new Date("2025-11-07"));
    expect(pos2).toBe(475);

    // Amendment 1: Price correction to ITEM-A on Nov 3
    await amendSaleUseCase.execute(
      new Date("2025-11-03"),
      "INV-001",
      "ITEM-A",
      1200, // Changed from 1000
      0.2 // Same tax rate - Tax becomes: 240 (was 200)
    );

    // Position on Nov 6: Sale 1 (with ITEM-A amendment applied) + Sale 2, Payment 1
    // Sales tax: ITEM-A (1200*0.2=240) + ITEM-B (500*0.15=75) + ITEM-C (2000*0.2=400) = 715
    // Payments: 200
    // Expected: 515
    const positionNov6 = await getTaxPositionUseCase.execute(
      new Date("2025-11-07")
    );
    expect(positionNov6).toBe(515);
  });

  it("should successfully add 5 sale events over the span of one month, send tax payments progressively, with complex item amendments ensuring the tax position calculation is correct", async () => {
    // ===== STEP 1: CREATE 5 SALE EVENTS OVER ONE MONTH =====

    // Sale 1: Nov 1 - Invoice INV-001 (2 items)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-01"),
      invoiceId: "INV-001",
      items: [
        { itemId: "ITEM-A", cost: 1000, taxRate: 0.2 }, // Tax: 200
        { itemId: "ITEM-B", cost: 500, taxRate: 0.15 }, // Tax: 75
      ],
    });
    // Expected tax from Sale 1: 275

    // Sale 2: Nov 7 - Invoice INV-002 (1 item, reuses ITEM-A)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-07"),
      invoiceId: "INV-002",
      items: [
        { itemId: "ITEM-A", cost: 2000, taxRate: 0.2 }, // Tax: 400
      ],
    });
    // Expected cumulative tax: 675

    // Sale 3: Nov 14 - Invoice INV-003 (2 items)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-14"),
      invoiceId: "INV-003",
      items: [
        { itemId: "ITEM-D", cost: 1500, taxRate: 0.1 }, // Tax: 150
        { itemId: "ITEM-E", cost: 800, taxRate: 0.2 }, // Tax: 160
      ],
    });
    // Expected cumulative tax: 985

    // Sale 4: Nov 21 - Invoice INV-004 (1 item)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-21"),
      invoiceId: "INV-004",
      items: [
        { itemId: "ITEM-F", cost: 3000, taxRate: 0.2 }, // Tax: 600
      ],
    });
    // Expected cumulative tax: 1585

    // Sale 5: Nov 28 - Invoice INV-005 (2 items)
    await addTransactionEventUseCase.execute({
      eventType: "SALES",
      date: new Date("2025-11-28"),
      invoiceId: "INV-005",
      items: [
        { itemId: "ITEM-G", cost: 1200, taxRate: 0.15 }, // Tax: 180
        { itemId: "ITEM-H", cost: 900, taxRate: 0.2 }, // Tax: 180
      ],
    });
    // Expected total tax (before amendments): 1945

    // ===== STEP 2: SEND PROGRESSIVE TAX PAYMENTS =====

    // Payment 1: Nov 5 (after Sale 1)
    await addTransactionEventUseCase.execute({
      eventType: "TAX_PAYMENT",
      date: new Date("2025-11-05"),
      amount: 200,
    });

    // Payment 2: Nov 12 (after Sale 2)
    await addTransactionEventUseCase.execute({
      eventType: "TAX_PAYMENT",
      date: new Date("2025-11-12"),
      amount: 300,
    });

    // Payment 3: Nov 19 (after Sale 3)
    await addTransactionEventUseCase.execute({
      eventType: "TAX_PAYMENT",
      date: new Date("2025-11-19"),
      amount: 400,
    });

    // Payment 4: Nov 26 (after Sale 4)
    await addTransactionEventUseCase.execute({
      eventType: "TAX_PAYMENT",
      date: new Date("2025-11-26"),
      amount: 500,
    });
    // Total payments: 1400

    // ===== STEP 3: APPLY AMENDMENTS =====

    // Amendment 1: Simple price correction to ITEM-A (Nov 3)
    // Changes cost from 1000 to 1200
    await amendSaleUseCase.execute(
      new Date("2025-11-03"),
      "INV-001",
      "ITEM-A",
      1200, // New cost
      0.2 // Same tax rate - Tax becomes: 240 (was 200)
    );

    // Amendment 2: Tax rate change to ITEM-A in INV-002 (Nov 10)
    // Changes tax rate from 20% to 15%
    await amendSaleUseCase.execute(
      new Date("2025-11-10"),
      "INV-002",
      "ITEM-A",
      2000, // Same cost
      0.15 // New tax rate - Tax becomes: 300 (was 400)
    );

    // Amendment 3a: First amendment to ITEM-D (Nov 16)
    // Changes cost from 1500 to 1600
    await amendSaleUseCase.execute(
      new Date("2025-11-16"),
      "INV-003",
      "ITEM-D",
      1600, // New cost
      0.1 // Same tax rate - Tax becomes: 160 (was 150)
    );

    // Amendment 3b: Second amendment to ITEM-D (Nov 23)
    // Latest amendment wins for dates >= Nov 23
    await amendSaleUseCase.execute(
      new Date("2025-11-23"),
      "INV-003",
      "ITEM-D",
      1800, // New cost
      0.1 // Same tax rate - Tax becomes: 180 (was 160)
    );

    // Amendment 4: Edge case - Amendment before sale date (should be IGNORED)
    // ITEM-F sale is on Nov 21, this amendment is Nov 20
    await amendSaleUseCase.execute(
      new Date("2025-11-20"),
      "INV-004",
      "ITEM-F",
      3500, // This should NOT be applied
      0.2
    );

    // ===== STEP 4: VERIFY TAX POSITION AT MULTIPLE POINTS =====

    /* COMPLETE TIMELINE OF SEEDED DATA:
     *
     * Nov 1:  Sale 1 (INV-001) - ITEM-A: 1000@20%=200, ITEM-B: 500@15%=75
     * Nov 3:  Amendment - INV-001/ITEM-A: 1200@20%=240 (corrected from 200)
     * Nov 5:  Payment 1 - 200
     * Nov 7:  Sale 2 (INV-002) - ITEM-A: 2000@20%=400 (same item, different invoice)
     * Nov 10: Amendment - INV-002/ITEM-A: 2000@15%=300 (tax rate changed, was 400)
     * Nov 12: Payment 2 - 300
     * Nov 14: Sale 3 (INV-003) - ITEM-D: 1500@10%=150, ITEM-E: 800@20%=160
     * Nov 16: Amendment - INV-003/ITEM-D: 1600@10%=160 (first amendment, was 150)
     * Nov 19: Payment 3 - 400
     * Nov 20: Amendment - INV-004/ITEM-F: 3500@20%=700 (IGNORED - before sale date)
     * Nov 21: Sale 4 (INV-004) - ITEM-F: 3000@20%=600
     * Nov 23: Amendment - INV-003/ITEM-D: 1800@10%=180 (second amendment, was 160)
     * Nov 26: Payment 4 - 500
     * Nov 28: Sale 5 (INV-005) - ITEM-G: 1200@15%=180, ITEM-H: 900@20%=180
     *
     * Total Sales Tax (with amendments): 1915
     * Total Payments: 1400
     * Final Position: 515
     */

    // Position on Nov 2: Only Sale 1, no payments yet
    // Sales tax: ITEM-A (1000*0.2=200) + ITEM-B (500*0.15=75) = 275
    // Payments: 0
    // Expected: 275
    const positionNov2 = await getTaxPositionUseCase.execute(
      new Date("2025-11-02")
    );
    expect(positionNov2).toBe(275);

    // Position on Nov 6: Only Sale 1, Payment 1
    // Sales tax: ITEM-A (1200*0.2=240) + ITEM-B (500*0.15=75) = 315
    // Payments: 200
    // Expected: 115
    const positionNov6 = await getTaxPositionUseCase.execute(
      new Date("2025-11-06")
    );
    expect(positionNov6).toBe(115);

    // Position on Nov 13: Sales 1-2, Payments 1-2
    // Both ITEM-A amendments applied (INV-001 and INV-002)
    // Sales tax: INV-001/ITEM-A (240) + ITEM-B (75) + INV-002/ITEM-A (300) = 615
    // Payments: 200 + 300 = 500
    // Expected: 115
    const positionNov13 = await getTaxPositionUseCase.execute(
      new Date("2025-11-13")
    );
    expect(positionNov13).toBe(115);

    // Position on Nov 20: Sales 1-3, Payments 1-3
    // Both ITEM-A amendments + ITEM-D first amendment applied
    // Sales tax: INV-001/ITEM-A (240) + ITEM-B (75) + INV-002/ITEM-A (300) + ITEM-D (160) + ITEM-E (160) = 935
    // Payments: 200 + 300 + 400 = 900
    // Expected: 35
    const positionNov20 = await getTaxPositionUseCase.execute(
      new Date("2025-11-20")
    );
    expect(positionNov20).toBe(35);

    // Position on Nov 25: Sales 1-4, Payments 1-3
    // Both ITEM-A amendments + ITEM-D second amendment applied
    // ITEM-F amendment still ignored
    // Sales tax: INV-001/ITEM-A (240) + ITEM-B (75) + INV-002/ITEM-A (300) + ITEM-D (180) + ITEM-E (160) + ITEM-F (600) = 1555
    // Payments: 200 + 300 + 400 = 900
    // Expected: 655
    const positionNov25 = await getTaxPositionUseCase.execute(
      new Date("2025-11-25")
    );
    expect(positionNov25).toBe(655);

    // Position on Nov 30: All sales, all payments, all amendments
    // Sales tax: INV-001/ITEM-A (240) + ITEM-B (75) + INV-002/ITEM-A (300) + ITEM-D (180) + ITEM-E (160) +
    //            ITEM-F (600) + ITEM-G (180) + ITEM-H (180) = 1915
    // Payments: 1400
    // Expected: 515
    const positionNov30 = await getTaxPositionUseCase.execute(
      new Date("2025-11-30")
    );
    expect(positionNov30).toBe(515);
  });
});
