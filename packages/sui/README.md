# VelocityVault Sui Hedger Module

High-speed hedge engine built on DeepBook v3 for the Sui blockchain.

## Overview

This module provides a hedging interface for VelocityVault that leverages DeepBook v3's central limit order book (CLOB) for fast, capital-efficient hedging operations.

### Features

- **Fast Order Placement**: Direct integration with DeepBook v3 for sub-second order execution
- **Position Tracking**: Automatic tracking of long/short positions per pool
- **Order Management**: Place, modify, and cancel hedge orders
- **Market & Limit Orders**: Support for both order types depending on urgency
- **Event Emission**: Full event logging for off-chain tracking

## Prerequisites

1. **Sui CLI** - Install from [Sui docs](https://docs.sui.io/guides/developer/getting-started/sui-install)
2. **Sui Wallet** - With testnet/mainnet SUI and DEEP tokens
3. **Balance Manager** - Created via DeepBook SDK or contract

## Installation

### 1. Clone and Build

```bash
cd packages/sui
sui move build
```

### 2. Run Tests

```bash
sui move test
```

### 3. Deploy to Testnet

```bash
# Ensure you have testnet SUI
sui client switch --env testnet
sui client faucet

# Deploy the package
sui client publish --gas-budget 100000000
```

### 4. Deploy to Mainnet

```bash
sui client switch --env mainnet
sui client publish --gas-budget 100000000
```

## Usage

### Initialize Hedger

```bash
# Call init_hedger to create and share a Hedger instance
sui client call \
  --package <PACKAGE_ID> \
  --module hedger \
  --function init_hedger \
  --gas-budget 10000000
```

### Place a Hedge Order

```typescript
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();

// Place a limit hedge order
tx.moveCall({
  target: `${PACKAGE_ID}::hedger::place_hedge_order`,
  typeArguments: [BASE_ASSET_TYPE, QUOTE_ASSET_TYPE],
  arguments: [
    tx.object(HEDGER_ID),           // Hedger object
    tx.object(POOL_ID),             // DeepBook pool
    tx.object(BALANCE_MANAGER_ID),  // Your balance manager
    trade_proof,                     // TradeProof from balance_manager
    tx.pure.u64(clientOrderId),     // Your tracking ID
    tx.pure.u64(price),             // Limit price
    tx.pure.u64(quantity),          // Order quantity
    tx.pure.bool(is_bid),           // true = buy, false = sell
    tx.pure.u64(expireTimestamp),   // Expiration time (ms)
    tx.object('0x6'),               // Clock object
  ],
});
```

### Cancel a Hedge

```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::hedger::cancel_hedge`,
  typeArguments: [BASE_ASSET_TYPE, QUOTE_ASSET_TYPE],
  arguments: [
    tx.object(HEDGER_ID),
    tx.object(POOL_ID),
    tx.object(BALANCE_MANAGER_ID),
    trade_proof,
    tx.pure.u128(orderId),
    tx.object('0x6'),  // Clock
  ],
});
```

### Query Position

```typescript
// Read position state
const position = await client.devInspectTransactionBlock({
  sender: address,
  transactionBlock: tx,
});

// Or via events
const events = await client.queryEvents({
  query: {
    MoveEventType: `${PACKAGE_ID}::hedger::HedgeOrderPlaced`,
  },
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VelocityVault                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Hedger Module                     │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │   Position  │  │    Order     │  │   Admin    │  │   │
│  │  │   Tracking  │  │  Management  │  │  Controls  │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────┘  │   │
│  └──────────────────────────┬──────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   DeepBook v3                        │   │
│  │  ┌─────────┐  ┌────────────────┐  ┌─────────────┐   │   │
│  │  │  Pool   │  │ BalanceManager │  │    Vault    │   │   │
│  │  │  CLOB   │  │                │  │             │   │   │
│  │  └─────────┘  └────────────────┘  └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## DeepBook v3 Integration

### Contract Addresses (Mainnet)

| Parameter | Value |
|-----------|-------|
| Package ID | `0x337f4f4f6567fcd778d5454f27c16c70e2f274cc6377ea6249ddf491482ef497` |
| Registry ID | `0xaf16199a2dff736e9f07a845f23c5da6df6f756eddb631aed9d24a93efc4549d` |

### Supported Pools

| Pool | Pool ID |
|------|---------|
| DEEP/SUI | `0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22` |
| DEEP/USDC | `0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce` |
| SUI/USDC | `0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407` |
| BETH/USDC | `0x1109352b9112717bd2a7c3eb9a416fff1ba6951760f5bdd5424cf5e4e5b3e65c` |

See [DeepBook docs](https://docs.sui.io/standards/deepbookv3/contract-information) for full list.

### Balance Manager Setup

Before using the hedger, you need a DeepBook Balance Manager:

```typescript
import { deepbook } from '@mysten/deepbook-v3';
import { Transaction } from '@mysten/sui/transactions';

// Create balance manager
const tx = new Transaction();
tx.add(client.deepbook.balanceManager.createAndShareBalanceManager());
const result = await client.signAndExecuteTransaction({ transaction: tx, signer: keypair });
```

### Depositing Funds

```typescript
// Deposit into balance manager before trading
client.deepbook.balanceManager.depositIntoManager('MANAGER_KEY', 'SUI', 1000)(tx);
client.deepbook.balanceManager.depositIntoManager('MANAGER_KEY', 'DEEP', 100)(tx);
```

## Order Types

| Type | Description | Use Case |
|------|-------------|----------|
| Limit | Standard limit order | Most hedging scenarios |
| Market | Immediate execution at best price | Urgent hedges |
| Post-Only | Maker-only order | Fee optimization |
| IOC | Immediate-or-Cancel | Partial fill acceptable |

## Events

The module emits the following events for off-chain tracking:

- `HedgeOrderPlaced` - When a new hedge order is placed
- `HedgeOrderCanceled` - When a hedge is canceled
- `PositionUpdated` - When position state changes

## Security Considerations

1. **Balance Manager Ownership**: Only the balance manager owner or TradeCap holder can place orders
2. **Admin Cap**: Required for emergency position resets
3. **Order Validation**: All orders validated against DeepBook constraints

## Testing

```bash
# Run all tests
sui move test

# Run specific test
sui move test test_place_hedge_order

# With verbose output
sui move test -v
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

Apache 2.0

## Resources

- [DeepBook v3 Documentation](https://docs.sui.io/standards/deepbookv3)
- [Sui Move Language](https://docs.sui.io/concepts/sui-move-concepts)
- [DeepBook SDK](https://www.npmjs.com/package/@mysten/deepbook-v3)
- [DeepBook GitHub](https://github.com/MystenLabs/deepbookv3)
