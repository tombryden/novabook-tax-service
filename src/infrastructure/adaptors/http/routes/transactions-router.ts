import { Router } from "express";
import { container } from "tsyringe";
import z from "zod";
import { AddTransactionEventUseCase } from "../../../../core/use-cases/add-transaction-event-use-case";

export const transactionsRouter = Router();

const transactionsBody = z.object({
  eventType: z.enum(["SALES", "TAX_PAYMENT"]),
  date: z.coerce.date(),
  invoiceId: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        cost: z.number(),
        taxRate: z.number(),
      })
    )
    .optional(),
  amount: z.number().optional(),
});
transactionsRouter.post("/", async (req, res) => {
  const body = req.body;
  const parsed = transactionsBody.parse(body);

  const addEventUseCase = container.resolve(AddTransactionEventUseCase);
  await addEventUseCase.execute({
    eventType: parsed.eventType,
    date: parsed.date,
    invoiceId: parsed.invoiceId,
    items: parsed.items,
    amount: parsed.amount,
  });

  return void res.status(202).send();
});
