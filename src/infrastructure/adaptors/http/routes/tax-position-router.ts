import { Router } from "express";
import { container } from "tsyringe";
import { GetTaxPositionUseCase } from "../../../../core/use-cases/get-tax-position-use-case";
import z from "zod";

export const taxPositionRouter = Router();

taxPositionRouter.get("/", async (req, res) => {
  const { date } = req.query;

  const parsedDate = z.coerce.date().parse(date);

  const getTaxPositionUseCase = container.resolve(GetTaxPositionUseCase);
  const result = await getTaxPositionUseCase.execute(parsedDate);

  return void res.json({ date: parsedDate, taxPosition: result });
});
