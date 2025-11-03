# Novabook Tax Service

## Architecture

Hexagonal Architecture with use cases

## Libraries Used

- Express
- Eslint
- Tsup

## Assumptions

- itemId from items in a SaleEvent corresponds to a product, like itemId 123 = 'Evian Water 500ml'

## Tests

### src/core/use-cases/add-transaction-event-use-case.ts

- !invoiceId || !items || items.length === 0

### src/core/entities/sale-event/sale-event-item.ts

- amount > 0

### src/core/entities/tax-payment-event.ts

- amount > 0
