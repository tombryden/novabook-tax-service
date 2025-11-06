import { SaleEvent } from "../entities/sale-event/sale-event";
import { TaxPaymentEvent } from "../entities/tax-payment-event";
import type { SaleEventRepositoryPort } from "../ports/sale-event-repository-port";
import { inject, injectable } from "tsyringe";
import type { TaxPaymentEventRepositoryPort } from "../ports/tax-payment-event-repository";
import type { LoggerPort } from "../ports/logger-port";
import { DI } from "../../infrastructure/di/di-tokens";

type EventType = "SALES" | "TAX_PAYMENT";

interface AddSaleEventItem {
  itemId: string;
  cost: number;
  taxRate: number;
}

interface AddTransactionEventUseCaseParams {
  eventType: EventType;
  date: Date;
  invoiceId?: string; // does nothing if event is TAX_PAYMENT
  items?: AddSaleEventItem[]; // does nothing if event is TAX_PAYMENT
  amount?: number; // does nothing if event is SALE
}

/**
 * Adds a transaction event (SALES or TAX_PAYMENT)
 */
@injectable()
export class AddTransactionEventUseCase {
  constructor(
    @inject(DI.saleEventRepositoryPort)
    private readonly saleEventRepository: SaleEventRepositoryPort,
    @inject(DI.taxPaymentEventRepositoryPort)
    private readonly taxPaymentEventRepository: TaxPaymentEventRepositoryPort,
    @inject(DI.loggerPort)
    private readonly logger: LoggerPort
  ) {}

  async execute({
    eventType,
    date,
    invoiceId,
    items,
    amount,
  }: AddTransactionEventUseCaseParams): Promise<string> {
    this.logger.info("Adding transaction event", {
      eventType,
      date: date.toISOString(),
      invoiceId,
      itemCount: items?.length,
      amount,
    });

    if (eventType === "SALES") {
      // SALE EVENT
      if (!invoiceId || !items || items.length === 0) {
        this.logger.warn("Invalid sale event parameters", {
          hasInvoiceId: !!invoiceId,
          itemCount: items?.length || 0,
        });
        throw new Error(
          "You must supply an invoiceId + item(s) with a sales event"
        );
      }

      // Ensure that the invoiceId doesn't already have a sale event
      const existingSaleEvent =
        await this.saleEventRepository.existsByInvoiceId(invoiceId);
      if (existingSaleEvent) {
        this.logger.warn("Duplicate sale event attempt", { invoiceId });
        throw new Error(
          `Sale Event with invoiceId ${invoiceId} already exists`
        );
      }

      const saleEvent = new SaleEvent({ invoiceId, date, items });

      await this.saleEventRepository.save(saleEvent);
      this.logger.info("Sale event created", {
        invoiceId,
        itemCount: items.length,
        date: date.toISOString(),
      });
    } else {
      // TAX PAYMENT
      if (!amount) {
        this.logger.warn("Invalid tax payment event parameters", {
          hasAmount: !!amount,
        });
        throw new Error("You must supply an amount with a tax payment event");
      }

      if (invoiceId || items) {
        this.logger.warn("Invalid tax payment event parameters", {
          hasInvoiceId: !!invoiceId,
          hasItems: !!items,
        });
        throw new Error(
          "Tax payment event cannot accept an invoice id or items"
        );
      }

      const taxPaymentEvent = new TaxPaymentEvent({ date, amount });
      await this.taxPaymentEventRepository.save(taxPaymentEvent);
      this.logger.info("Tax payment event created", {
        amount,
        date: date.toISOString(),
      });
    }

    return "Event added successfully";
  }
}
