# VelocityVault Frontend

Gasless trading interface powered by Yellow Network SDK.

## Overview

This is the user-facing interface for VelocityVault that demonstrates:
- **Session-based authentication** - Sign once, trade forever (within session)
- **Gasless transactions** - All trades happen off-chain via Yellow state channels
- **Instant execution** - No waiting for blockchain confirmations
- **Zero gas fees** - Users don't pay for individual trades

## Architecture

```
User Wallet → Yellow Session Key → Off-Chain State Channel
                                          ↓
                                   Trade Intents
                                          ↓
                                    AI Agent Monitor
                                          ↓
                                   LI.FI + Uniswap v4
```

## Features

### 1. Session-Based UX
- User signs once with MetaMask (EIP-712)
- Session key handles all subsequent actions
- No wallet popups for trades

### 2. Gasless Trading
- Buy/Sell buttons execute instantly
- Off-chain balance updates
- Settlement happens when session closes

### 3. Real-Time Updates
- WebSocket connection to Yellow Network
- Live balance updates
- Activity feed

### 4. Demo Stats
- Trade counter
- Gas fees (always $0)
- Settlement status

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Yellow SDK** (`@erc7824/nitrolite`) - State channels
- **viem** - Ethereum interactions
- **WebSocket** - Real-time Yellow Network connection

## Setup

### Prerequisites

```bash
node >= 18
npm >= 9
MetaMask browser extension
```

### Installation

```bash
cd frontend
npm install
```

### Configuration

The app connects to:
- **Yellow Network**: `wss://clearnet-sandbox.yellow.com/ws`
- **Ethereum Testnet**: Sepolia (for Yellow SDK)
- **Arc Testnet**: For VelocityVault contract

No environment variables needed for demo (hardcoded testnet values).

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build

```bash
npm run build
```

Output: `dist/` directory

## Usage

### 1. Connect Wallet

- Click "Connect Wallet"
- Approve MetaMask connection
- Sign auth message (one-time)

### 2. Wait for Channel Creation

- Yellow SDK creates state channel
- Takes ~5-10 seconds
- "Channel Active" indicator appears

### 3. Start Trading

**Instant trades:**
- Click "Buy BTC" or "Sell BTC"
- No wallet popups
- Balance updates immediately
- No gas fees

**Quick actions:**
- "Quick Buy" - Fast buy button
- "Quick Sell" - Fast sell button
- "Rebalance" - Sell then buy

### 4. Monitor Activity

- Trade counter increases
- Gas fees stay at $0
- Activity feed logs actions

## Components

### `App.tsx`
Main app shell with routing

### `contexts/YellowContext.tsx`
Yellow SDK integration:
- WebSocket connection
- Session management
- Channel creation
- Trade execution

### `components/WalletConnect.tsx`
Wallet connection UI:
- MetaMask integration
- Auth flow
- Network info

### `components/TradingInterface.tsx`
Main trading UI:
- Balance display
- Trade buttons
- Activity feed
- Demo stats

## Integration with Backend

### AI Agent Monitoring

The frontend sends trade intents via Yellow session. The AI agent:

```typescript
// Agent monitors Yellow WebSocket
ws.on('message', (event) => {
  const { method, data } = event
  
  if (method === 'transfer') {
    // User initiated trade
    const { user, asset, amount, action } = data
    
    // Agent executes via LI.FI
    await executeTradeViaLIFI(user, asset, amount, action)
  }
})
```

### VelocityVault Contract

```typescript
// When agent detects trade:
// 1. Pull funds from Arc vault
await vault.agentWithdraw(user, amount, lifiAddress, executionId)

// 2. Execute via LI.FI (cross-chain)
await lifi.route(/* ... */)

// 3. Return profits to vault
await vault.agentDeposit(user, returnAmount, executionId)
```

## Demo Video Script

**Scene 1: Connect (10s)**
- "Here's VelocityVault - gasless trading on Arc"
- Click "Connect Wallet"
- Sign once
- "That's it - no more wallet popups"

**Scene 2: Fast Trades (30s)**
- "Watch - I can trade instantly"
- Click Buy/Sell rapidly (10+ times)
- "Zero gas fees, instant execution"
- "All happening off-chain via Yellow Network"

**Scene 3: Behind the Scenes (30s)**
- "Behind the scenes, our AI agent monitors these intents"
- "It pulls funds from our Arc treasury"
- "Routes via LI.FI to Uniswap v4"
- "And returns profits back to the vault"

**Scene 4: Stats (20s)**
- Show trade counter
- Show $0 gas fees
- "This is the power of state channels + agentic execution"

## Customization

### Change Trade Assets

Edit `TradingInterface.tsx`:

```typescript
<button onClick={() => handleTrade('buy', 'ETH', amount)}>
  Buy ETH
</button>
```

### Adjust Amounts

Edit default in `TradingInterface.tsx`:

```typescript
const [tradeAmount, setTradeAmount] = useState('100') // Default: 100 USDC
```

### Connect to Real Vault

Update `YellowContext.tsx` with your deployed vault address:

```typescript
const VAULT_ADDRESS = '0x...' // Your VelocityVault address
```

## Troubleshooting

### "Please install MetaMask"
- Install MetaMask browser extension
- Refresh page

### "Connection to Yellow Network failed"
- Check internet connection
- Yellow testnet might be down
- Try again in a few seconds

### "Channel creation timeout"
- Refresh page and reconnect
- Ensure you have Sepolia ETH for Yellow SDK

### Balance not updating
- Check browser console for errors
- Verify Yellow WebSocket connection
- May need to restart session

## Resources

- Yellow Docs: https://docs.yellow.org
- Yellow SDK: https://www.npmjs.com/package/@erc7824/nitrolite
- Viem: https://viem.sh
- React: https://react.dev

## License

MIT
