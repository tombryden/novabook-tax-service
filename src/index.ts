import "reflect-metadata";

import { registerDi } from "./infrastructure/di/register-di";
registerDi();

import express from "express";
import z from "zod";
import { container } from "tsyringe";
import { AddTransactionEventUseCase } from "./core/use-cases/add-transaction-event-use-case";
import { DI } from "./infrastructure/di/di-tokens";
import { DataSource } from "typeorm";
import { GetTaxPositionUseCase } from "./core/use-cases/get-tax-position-use-case";

const init = async () => {
  const dataSource = container.resolve<DataSource>(DI.dataSource);
  await dataSource.initialize();

  const app = express();
  app.use(express.json());

  const port = 4000;

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
  app.post("/transactions", async (req, res) => {
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

  app.get("/tax-position", async (req, res) => {
    const { date } = req.query;

    const parsedDate = z.coerce.date().parse(date);

    const getTaxPositionUseCase = container.resolve(GetTaxPositionUseCase);
    const result = await getTaxPositionUseCase.execute(parsedDate);

    return void res.json({ date: parsedDate, taxPosition: result });
  });

  // app.patch("/sale");

  app.listen(port, () => {
    console.log(`Tax service listening on port ${port}`);
  });
};

init();
