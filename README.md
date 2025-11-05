# Novabook Tax Service

## Architecture

Hexagonal Architecture with use cases

## Libraries & Tools Used

- Express
- TypeORM
- Eslint
- Tsup
- Jest
- Tsyringe

## Assumptions

- The invoiceId on a sale event must be unique - will reject if you try to submit the same invoiceId twice for a sale event
- A sale event can only have unique item ids so amending an itemId isn't ambiguous
- Amendments can be sent before the sale event exists, but will be ignored if the amendment date is before the sale event date
- Only invoices with a sale event will be included in the tax-position calculation, even if there are amendments
- Amendments made to itemIds that don't exist in the sale event ignored in the tax-position calculation (TBC) - 'Allows a user to **modify** an item within a sale at a specific point in time' -> doesn't suggest appending the item if it isn't in the sale

TODO: write integration tests
