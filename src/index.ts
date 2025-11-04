import "reflect-metadata";

import { registerDi } from "./infrastructure/register-di";
registerDi();

import express from "express";
import z from "zod";
import { container } from "tsyringe";
import { AddTransactionEventUseCase } from "./core/use-cases/add-transaction-event-use-case";
import { DI } from "./infrastructure/di-tokens";
import { DataSource } from "typeorm";

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

    // if (parsed.error) {
    //   return void res
    //     .json({ success: false, error: "Bad request body" })
    //     .status(400);
    // }

    const addEventUseCase = container.resolve(AddTransactionEventUseCase);
    await addEventUseCase.execute(
      parsed.eventType,
      parsed.date,
      parsed.invoiceId,
      parsed.items,
      parsed.amount
    );

    return void res.status(202).send();
  });
  // app.get("/tax-position")
  // app.patch("/sale");

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

init();
