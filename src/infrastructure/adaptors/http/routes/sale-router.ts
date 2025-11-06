import { Router } from "express";
import { container } from "tsyringe";
import z from "zod";
import { UpsertAmendmentUseCase } from "../../../../core/use-cases/upsert-amendment-use-case";

export const saleRouter = Router();

const saleBody = z.object({
  date: z.coerce.date(),
  invoiceId: z.string(),
  itemId: z.string(),
  cost: z.number(),
  taxRate: z.number(),
});
saleRouter.patch("/", async (req, res) => {
  const { date, cost, invoiceId, itemId, taxRate } = saleBody.parse(req.body);

  const upsertAmendmentUseCase = container.resolve(UpsertAmendmentUseCase);
  await upsertAmendmentUseCase.execute(date, invoiceId, itemId, cost, taxRate);

  return void res.status(202).send();
});
