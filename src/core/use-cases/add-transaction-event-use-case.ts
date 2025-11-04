import { SaleEvent } from "../entities/sale-event/sale-event";
import { TaxPaymentEvent } from "../entities/tax-payment-event";
import type { SaleEventRepositoryPort } from "../ports/sale-event-repository-port";
import { inject, injectable } from "tsyringe";
import type { TaxPaymentEventRepositoryPort } from "../ports/tax-payment-event-repository";

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
    @inject("SaleEventRepositoryPort")
    private readonly saleEventRepository: SaleEventRepositoryPort,
    @inject("TaxPaymentEventRepositoryPort")
    private readonly taxPaymentEventRepository: TaxPaymentEventRepositoryPort
  ) {}

  async execute({
    eventType,
    date,
    invoiceId,
    items,
    amount,
  }: AddTransactionEventUseCaseParams): Promise<string> {
    if (eventType === "SALES") {
      if (!invoiceId || !items || items.length === 0) {
        throw new Error(
          "You must supply an invoiceId + item(s) with a sales event"
        );
      }

      const saleEvent = new SaleEvent({ invoiceId, date, items });

      await this.saleEventRepository.save(saleEvent);
    } else {
      if (!amount) {
        throw new Error("You must supply an amount with a tax payment event");
      }

      if (invoiceId || items) {
        throw new Error(
          "Tax payment event cannot accept an invoice id or items"
        );
      }

      const taxPaymentEvent = new TaxPaymentEvent({ date, amount });
      await this.taxPaymentEventRepository.save(taxPaymentEvent);
    }

    return "Event added successfully";
  }
}
