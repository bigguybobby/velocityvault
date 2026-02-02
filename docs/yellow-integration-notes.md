# Yellow SDK Integration Notes

## Key Concepts

### State Channels
- Lock funds once, transact off-chain, settle once
- Gasless transactions during session
- Uses Nitrolite protocol

### Core Flow
1. **Auth** - Generate session keypair, sign challenge with main wallet
2. **Create Channel** - On-chain channel creation with custody contract
3. **Resize Channel** - Fund channel from unified balance (or L1 deposit)
4. **Off-Chain Transfers** - Instant, gasless transfers
5. **Close Channel** - Settle final state on-chain

## SDK Installation

```bash
npm install @erc7824/nitrolite viem
```

## Required Setup

- **Testnet**: Sepolia
- **Custody Contract**: `0x019B65A265EB3363822f2752141b3dF16131b262`
- **Adjudicator**: `0x7c7ccbc98469190849BCC6c926307794fDfB11F2`
- **WebSocket**: `wss://clearnet-sandbox.yellow.com/ws`
- **Challenge Duration**: 3600s (1 hour)

## Key SDK Functions

```typescript
import {
  NitroliteClient,
  createAuthRequestMessage,
  createCreateChannelMessage,
  createResizeChannelMessage,
  createTransferMessage,
  createCloseChannelMessage,
} from '@erc7824/nitrolite';
```

### 1. Initialize Client

```typescript
const client = new NitroliteClient({
  publicClient,
  walletClient,
  stateSigner: new WalletStateSigner(walletClient),
  addresses: {
    custody: '0x019B65A265EB3363822f2752141b3dF16131b262',
    adjudicator: '0x7c7ccbc98469190849BCC6c926307794fDfB11F2',
  },
  chainId: 11155111, // Sepolia
  challengeDuration: 3600n,
});
```

### 2. Session Key Auth

```typescript
// Generate ephemeral session key
const sessionPrivateKey = generatePrivateKey();
const sessionAccount = privateKeyToAccount(sessionPrivateKey);

// Request auth with allowances
const authParams = {
  session_key: sessionAccount.address,
  allowances: [{ asset: 'ytest.usd', amount: '1000000000' }],
  expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600),
  scope: 'velocity.vault',
};

const authRequestMsg = await createAuthRequestMessage({
  address: mainWallet.address,
  application: 'VelocityVault',
  ...authParams
});
```

### 3. Create & Fund Channel

```typescript
// Create channel
const createChannelMsg = await createCreateChannelMessage(
  sessionSigner,
  { chain_id: 11155111, token: usdcAddress }
);

// Resize to fund from unified balance
const resizeMsg = await createResizeChannelMessage(
  sessionSigner,
  {
    channel_id: channelId,
    allocate_amount: 20n, // Pull from off-chain balance
    funds_destination: userAddress,
  }
);
```

### 4. Off-Chain Transfer

```typescript
const transferMsg = await createTransferMessage(
  sessionSigner,
  {
    destination: recipientAddress,
    allocations: [{ asset: 'ytest.usd', amount: '10' }]
  },
  Date.now()
);
```

### 5. Close & Withdraw

```typescript
const closeMsg = await createCloseChannelMessage(
  sessionSigner,
  channelId,
  userAddress
);

// After close, withdraw from custody
await client.withdrawal(tokenAddress, amount);
```

## For VelocityVault

### Frontend Integration

1. **Session-based UI**
   - User signs once (EIP-712)
   - Session key handles all subsequent actions
   - Show balance updates in real-time via WebSocket

2. **Trade Buttons**
   - "Buy", "Sell", "Rebalance" → all gasless
   - State updates off-chain
   - Settle when user ends session

3. **Demo Flow**
   - User clicks rapidly (10+ actions/second)
   - No wallet popups
   - Final settlement shows all actions batched

### Backend (AI Agent)

- Monitor Yellow session state via WebSocket
- When user clicks "Buy BTC", agent:
  1. Records intent in Yellow session
  2. Calls LI.FI to bridge USDC from Arc
  3. Executes swap on Uniswap v4
  4. Updates Yellow balance

## Resources

- Docs: https://docs.yellow.org
- Quickstart: https://docs.yellow.org/docs/learn/getting-started/quickstart
- Nitrolite SDK: `@erc7824/nitrolite`
- Testnet faucet: (check docs)

## Notes

- State channels are NOT L2s - they're peer-to-peer channels
- Perfect for high-frequency, low-latency apps
- Challenge period protects against fraud
- Always verify server signatures before on-chain submission
