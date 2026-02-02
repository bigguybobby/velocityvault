# VelocityVault Agent

AI agent that monitors Yellow Network for user trade intents and executes them via LI.FI cross-chain routing.

## Architecture

```
Yellow WS → Agent Monitor → LI.FI Router → Uniswap v4 / Sui
     ↓            ↓              ↓              ↓
User Intent  VelocityVault  Cross-Chain   Trade Execution
            (withdraw)      (bridge)      (swap/hedge)
                            ↓
                    Return Profits
```

## Features

- **Yellow Network Integration**: Monitors WebSocket for trade intents
- **LI.FI Cross-Chain Routing**: Automatically finds best routes
- **VelocityVault Management**: Withdraws funds, returns profits
- **Uniswap v4 Execution**: Executes trades with custom hooks
- **Sui DeepBook Hedging**: High-frequency limit orders
- **Automatic Reconnection**: Handles network failures gracefully

## Setup

### 1. Install Dependencies

```bash
cd packages/agent
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
AGENT_PRIVATE_KEY=0x...           # Agent wallet private key
VAULT_ADDRESS=0x...               # VelocityVault contract address
RPC_URL=https://...               # RPC endpoint
```

### 3. Start Agent

```bash
npm run dev
```

## How It Works

### 1. Monitor Yellow WebSocket

```typescript
// Connects to Yellow Network
const ws = new WebSocket("wss://clearnet-sandbox.yellow.com/ws");

// Listens for trade intents
ws.on("message", handleYellowMessage);
```

### 2. Detect Trade Intent

```typescript
// User clicks "Buy BTC" in UI
// Yellow sends transfer message
// Agent detects intent

{
  user: "0x...",
  action: "buy",
  asset: "BTC",
  amount: "100"
}
```

### 3. Execute Trade Flow

```typescript
// Step 1: Withdraw from VelocityVault
await vault.agentWithdraw(user, amount, lifiAddress, executionId);

// Step 2: Get LI.FI route
const routes = await lifi.getRoutes({
  fromChainId: ChainId.SEP,  // Sepolia (Arc)
  toChainId: ChainId.OPT,    // Optimism (Uniswap v4)
  // ...
});

// Step 3: Execute cross-chain swap
await lifi.executeRoute(routes[0]);

// Step 4: Execute trade on Uniswap v4
await uniswapV4.swap(/* ... */);

// Step 5: Return profits to vault
await vault.agentDeposit(user, returnAmount, executionId);
```

## Trade Execution Strategies

### Strategy 1: Simple Swap (Uniswap v4)

```typescript
// Direct swap on Uniswap v4
// Uses custom hook for agentic logic
await executeUniswapSwap(tokenIn, tokenOut, amount);
```

### Strategy 2: Cross-Chain Arbitrage

```typescript
// Buy on Optimism, sell on Base
// Uses LI.FI for bridging
await executeCrossChainArbitrage(fromChain, toChain);
```

### Strategy 3: Hedging (Sui DeepBook)

```typescript
// Place limit orders on Sui for hedging
// High-frequency execution
await placeDeepBookOrder(price, amount);
```

## Logging

Agent logs all actions:

```
🎯 Trade intent detected:
  User: 0x123...
  Action: buy
  Asset: BTC
  Amount: 100 USDC

📤 Step 1: Withdraw from VelocityVault...
✅ Withdrew 100 USDC from vault

🔍 Step 2: Finding best route via LI.FI...
✅ Route found:
  From: Sepolia
  To: Optimism
  Estimated time: 2 steps

🚀 Step 3: Executing cross-chain swap...
✅ Swap complete

💱 Step 4: Executing trade on Uniswap v4...
  BUY BTC

📥 Step 5: Returning profits to VelocityVault...
  Original: 100 USDC
  Returned: 105 USDC
  Profit: 5 USDC

✅ Trade executed successfully!
```

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses `tsx watch` for hot reload.

### Build for Production

```bash
npm run build
npm start
```

### Test Trade Flow

```bash
# Start agent
npm run dev

# In another terminal, use frontend to trigger trade
# Agent will detect and execute
```

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name velocityvault-agent
pm2 logs velocityvault-agent
```

### Using Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

### Environment Variables (Production)

```env
NODE_ENV=production
AGENT_PRIVATE_KEY=0x...
VAULT_ADDRESS=0x...
RPC_URL=https://arc-mainnet-rpc.circle.com
LIFI_API_KEY=your_production_key
```

## Monitoring

### Health Checks

Agent logs health status every minute:
```
[14:23:45] 💚 Agent healthy - monitoring 0 pending intent(s)
```

### Error Handling

- Automatic WebSocket reconnection
- Transaction retry logic
- Graceful degradation on failures

## Security

### Best Practices

1. **Private Key Security**
   - Use hardware wallet or secure key management
   - Never commit `.env` to git
   - Rotate keys regularly

2. **Permission Model**
   - Agent has limited permissions (only `agentWithdraw`/`agentDeposit`)
   - Cannot drain entire vault
   - Owner can revoke agent access

3. **Rate Limiting**
   - Implement daily withdrawal limits
   - Monitor for suspicious activity
   - Alert on large trades

## Troubleshooting

### Agent Not Detecting Intents

```bash
# Check WebSocket connection
# Should see: "✅ Connected to Yellow Network"

# If not connecting:
# 1. Check Yellow Network status
# 2. Verify YELLOW_WS_URL in .env
# 3. Check firewall/network settings
```

### Trades Failing

```bash
# Check agent balance
# Agent needs gas for transactions

# Check vault permissions
# Verify agent address is authorized

# Check RPC connection
# Test with: curl $RPC_URL
```

## License

MIT
