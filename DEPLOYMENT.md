# VelocityVault - Deployment Guide

Complete guide to deploy VelocityVault for HackMoney 2026.

## Prerequisites

```bash
node >= 18
yarn
Wallet with testnet funds
```

## Quick Start (Local)

```bash
# Install
yarn install

# Terminal 1: Local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Frontend
yarn start

# Terminal 4: Agent
cd packages/agent
npm run dev
```

Visit: http://localhost:3000

## Testnet Deployment

### Step 1: Get Testnet Funds

#### Arc Testnet (Main vault)
1. Visit: https://faucet.circle.com
2. Select "Arc Testnet"
3. Request USDC
4. Save USDC contract address

#### Sepolia (Yellow SDK)
1. Visit: https://sepoliafaucet.com
2. Request ETH
3. Get testnet USDC: https://faucet.circle.com

### Step 2: Configure Environment

#### Hardhat (.env)
```bash
cd packages/hardhat
cp .env.example .env
```

Edit `.env`:
```env
# Deployer wallet
__RUNTIME_DEPLOYER_PRIVATE_KEY=0x...

# Arc testnet
ARC_TESTNET_RPC=https://testnet-rpc.arc.network
USDC_ADDRESS=0x...  # From faucet
AGENT_ADDRESS=0x...  # Your agent wallet

# Alchemy (for Sepolia)
ALCHEMY_API_KEY=your_key_here
```

#### Agent (.env)
```bash
cd packages/agent
cp .env.example .env
```

Edit `.env`:
```env
AGENT_PRIVATE_KEY=0x...
VAULT_ADDRESS=  # Will fill after deployment
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Step 3: Deploy to Arc Testnet

```bash
# Deploy VelocityVault
yarn deploy --network arcTestnet

# Save contract address
# Output will show: "VelocityVault deployed at: 0x..."
```

Update `packages/agent/.env`:
```env
VAULT_ADDRESS=0x...  # Use deployed address
```

### Step 4: Verify Contract (Optional)

```bash
cd packages/hardhat
npx hardhat verify --network arcTestnet <VAULT_ADDRESS> <USDC_ADDRESS> <AGENT_ADDRESS>
```

### Step 5: Test Deployment

```bash
# Check contract on Arc explorer
https://testnet.arcscan.app/address/<VAULT_ADDRESS>

# Test deposit (via Hardhat console)
npx hardhat console --network arcTestnet
> const vault = await ethers.getContractAt("VelocityVault", "0x...")
> await vault.balanceOf("YOUR_ADDRESS")
```

## Frontend Deployment (Vercel)

### Option A: Vercel CLI

```bash
# Install Vercel
npm i -g vercel

# Deploy
cd packages/nextjs
vercel

# Follow prompts
# Set environment variables in Vercel dashboard
```

### Option B: GitHub Integration

1. Push to GitHub
2. Go to https://vercel.com
3. Import repository
4. Deploy

### Environment Variables (Vercel)

```env
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_AGENT_ADDRESS=0x...
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
```

## Agent Deployment

### Option A: Local (Development)

```bash
cd packages/agent
npm run dev
```

### Option B: PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Build agent
npm run build

# Start with PM2
pm2 start dist/index.js --name velocityvault-agent

# Monitor
pm2 logs velocityvault-agent
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Option C: Docker

```bash
# Build image
docker build -t velocityvault-agent packages/agent

# Run container
docker run -d \
  --name velocityvault-agent \
  --env-file packages/agent/.env \
  --restart unless-stopped \
  velocityvault-agent

# View logs
docker logs -f velocityvault-agent
```

### Option D: Cloud (Railway/Render/Heroku)

1. **Railway.app**
   ```bash
   railway init
   railway up
   # Set env vars in dashboard
   ```

2. **Render.com**
   - Connect GitHub repo
   - Select "Background Worker"
   - Set environment variables
   - Deploy

3. **Heroku**
   ```bash
   heroku create velocityvault-agent
   heroku config:set AGENT_PRIVATE_KEY=0x...
   git push heroku main
   ```

## Network Configuration

### Arc Testnet

```typescript
{
  name: "Arc Testnet",
  chainId: 999999,  // Update with actual
  rpc: "https://testnet-rpc.arc.network",
  explorer: "https://testnet.arcscan.app",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6
  }
}
```

### Sepolia (Yellow SDK)

```typescript
{
  name: "Sepolia",
  chainId: 11155111,
  rpc: "https://eth-sepolia.g.alchemy.com/v2/...",
  explorer: "https://sepolia.etherscan.io"
}
```

## Contract Addresses (Save After Deployment)

```typescript
// Arc Testnet
export const VELOCITY_VAULT = "0x...";
export const USDC_ARC = "0x...";

// Sepolia (Yellow)
export const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const YELLOW_CUSTODY = "0x019B65A265EB3363822f2752141b3dF16131b262";
export const YELLOW_ADJUDICATOR = "0x7c7ccbc98469190849BCC6c926307794fDfB11F2";
```

## Testing Checklist

### Smart Contracts
- [ ] Deploy to Arc testnet
- [ ] Verify on explorer
- [ ] Test deposit
- [ ] Test withdraw
- [ ] Test agent permissions

### Frontend
- [ ] Connect wallet
- [ ] Yellow session creation
- [ ] Gasless trades work
- [ ] Balance updates
- [ ] Error handling

### Agent
- [ ] Connects to Yellow WS
- [ ] Detects trade intents
- [ ] LI.FI routes found
- [ ] Logs properly
- [ ] Auto-reconnects

## Troubleshooting

### Contract Deployment Fails

**Issue:** "Insufficient funds"
**Fix:** Get more testnet ETH/USDC from faucets

**Issue:** "Network not found"
**Fix:** Check `hardhat.config.ts` network settings

**Issue:** "Nonce too low"
**Fix:** `rm -rf cache/ artifacts/ && npx hardhat compile`

### Frontend Won't Connect

**Issue:** "Wrong network"
**Fix:** Add Arc testnet to MetaMask manually:
- Network name: Arc Testnet
- RPC URL: https://testnet-rpc.arc.network
- Chain ID: 999999
- Currency: USDC

**Issue:** "Contract not found"
**Fix:** Update contract addresses in `deployedContracts.ts`

### Agent Not Detecting Trades

**Issue:** "WebSocket connection failed"
**Fix:** 
- Check Yellow Network status
- Verify `YELLOW_WS_URL` in `.env`
- Test with: `wscat -c wss://clearnet-sandbox.yellow.com/ws`

**Issue:** "No trades detected"
**Fix:**
- Agent must be running when trades happen
- Check agent logs for errors
- Verify Yellow session is active in frontend

## Production Checklist

- [ ] Audit smart contracts
- [ ] Use hardware wallet for deployer
- [ ] Implement rate limiting in agent
- [ ] Add monitoring/alerting
- [ ] Set up backup agent instances
- [ ] Configure proper RPC endpoints (not public)
- [ ] Enable HTTPS for frontend
- [ ] Set up proper logging (e.g., Datadog)
- [ ] Implement circuit breakers
- [ ] Add health check endpoints

## Security Notes

### Private Keys
- Never commit `.env` files
- Use environment variables in production
- Consider using AWS Secrets Manager or HashiCorp Vault

### Agent Permissions
- Agent has limited permissions (only `agentWithdraw`/`agentDeposit`)
- Owner can revoke agent at any time
- Consider multi-sig for owner

### Rate Limiting
```solidity
// Add to VelocityVault.sol
mapping(address => uint256) public dailyWithdrawals;
uint256 public constant DAILY_LIMIT = 10000e6; // 10k USDC

function agentWithdraw(...) external onlyAgent {
    require(dailyWithdrawals[user] + amount <= DAILY_LIMIT);
    dailyWithdrawals[user] += amount;
    // ...
}
```

## Monitoring

### Key Metrics
- Agent uptime
- Trade execution success rate
- Average execution time
- Profits returned
- WebSocket reconnections

### Tools
- **Logs:** Use `pm2 logs` or Docker logs
- **Metrics:** Prometheus + Grafana
- **Alerts:** PagerDuty or Opsgenie
- **Uptime:** UptimeRobot or Pingdom

## Support

- **Issues:** https://github.com/bigguybobby/velocityvault/issues
- **Discord:** [Add invite link]
- **Email:** [Add contact]

## Resources

- Arc Docs: https://docs.arc.network
- Yellow Docs: https://docs.yellow.org
- LI.FI Docs: https://docs.li.fi
- Scaffold-ETH-2: https://scaffoldeth.io

---

**Happy Deploying! 🚀**
