# Novabook Tax Service

## Architecture

- Hexagonal Architecture with use cases
- Active record pattern for TypeORM entities

## Libraries & Tools Used

- Express
- TypeORM
- Eslint
- Tsup
- Jest
- Tsyringe

## Assumptions

- The invoiceId on a sale event must be unique - will reject if you try to submit the same invoiceId twice for a sale event
- A sale event can only have unique item ids so amending an itemId isn't ambiguous, different sale events CAN re-use the same itemIds
- Amendments can be sent before the sale event exists, but will be ignored if the amendment date is before the sale event date
- Only invoices with a sale event will be included in the tax-position calculation, even if there are amendments
- Amendments made to itemIds that don't exist in the sale event are ignored in the tax-position calculation - 'Allows a user to **modify** an item within a sale at a specific point in time'
- If amendment date matches exactly with the sale event, the amendment item(s) will take priority over the sale event items in the tax-position calculation
