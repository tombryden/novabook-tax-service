import "reflect-metadata";

import express from "express";

const app = express();
const port = 4000;

// app.post("/transactions")
// app.get("/tax-position")
// app.patch("/sale");

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
