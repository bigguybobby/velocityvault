# VelocityVault - Setup Guide

Quick setup guide to get the contracts deployed on Arc testnet.

## Phase 1: Initial Setup (5 minutes)

### 1. Install Dependencies

```bash
cd /Users/bobby/.openclaw/workspace/velocityvault/contracts
npm install
```

This installs:
- Hardhat
- OpenZeppelin contracts
- TypeScript tooling

### 2. Create Circle Developer Account

1. Go to: https://console.circle.com/signup
2. Sign up for a developer account
3. Navigate to: **Keys** → **Create a key** → **API key** → **Standard Key**
4. Save your API key
5. Navigate to: **Settings** → **Entity Secret**
6. Register your Entity Secret (64-char alphanumeric)
7. Save your Entity Secret

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Circle API (from step 2)
CIRCLE_API_KEY=your_api_key_here
CIRCLE_ENTITY_SECRET=your_64_char_entity_secret

# Arc Testnet (check Arc docs for actual values)
ARC_TESTNET_RPC=https://arc-testnet-rpc.circle.com
ARC_TESTNET_CHAIN_ID=999999

# Your wallet private keys
DEPLOYER_PRIVATE_KEY=0x...  # Your deployer wallet
AGENT_ADDRESS=0x...         # Agent wallet address (can be same as deployer for testing)

# USDC address on Arc testnet
USDC_ADDRESS=0x...          # Get from Circle docs or faucet
```

## Phase 2: Get Testnet Funds (10 minutes)

### 1. Create Arc Wallets

**Option A: Use Circle SDK (Recommended)**

```typescript
// Run this script (or use Circle Console UI)
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});

const walletSet = await client.createWalletSet({ name: 'VelocityVault' });
const wallets = await client.createWallets({
  accountType: 'EOA',
  blockchain: 'ARC-TESTNET',
  count: 2, // Deployer + Agent
  walletSetId: walletSet.data.walletSet.id
});

console.log('Wallets:', wallets.data.wallets);
```

**Option B: Use your existing wallets**
- Use MetaMask or any Ethereum wallet
- Make sure you have the private keys

### 2. Get Testnet USDC

Go to: https://faucet.circle.com/

1. Select **Arc Testnet**
2. Enter your wallet address
3. Request USDC (you'll get test USDC)
4. Repeat for agent wallet

Verify balance:
- Circle Console: https://console.circle.com/wallets/dev/wallets
- Arc Explorer: https://testnet.arcscan.app/

### 3. Find USDC Contract Address

Check one of:
- Circle docs: https://docs.arc.network
- Your faucet transaction on Arc explorer
- Circle Console (look at token transfers)

Save the USDC contract address to `.env`

## Phase 3: Deploy Contract (2 minutes)

### 1. Compile

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 2. Deploy to Arc Testnet

```bash
npm run deploy
```

Expected output:
```
🚀 Deploying VelocityVault to Arc Testnet...

Deploying with account: 0x...
Account balance: 100.0 USDC

Configuration:
  USDC Address: 0x...
  Agent Address: 0x...

Deploying VelocityVault...
✅ VelocityVault deployed to: 0x...

Verifying deployment...
  Agent: 0x...
  USDC: 0x...
  Owner: 0x...

📝 Deployment info saved to: deployments/arc-testnet.json
📝 ABI exported to: deployments/VelocityVault.abi.json

🎉 Deployment complete!
```

### 3. Verify on Explorer (Optional)

```bash
npx hardhat verify --network arcTestnet <VAULT_ADDRESS> <USDC_ADDRESS> <AGENT_ADDRESS>
```

View your contract on: https://testnet.arcscan.app/address/<VAULT_ADDRESS>

## Phase 4: Test Contract (5 minutes)

### Test Basic Operations

```bash
npx hardhat run scripts/test-vault.ts --network arcTestnet
```

This will:
1. ✅ Deposit 10 USDC
2. ✅ Agent withdraw 5 USDC (simulated trade execution)
3. ✅ Agent deposit 6 USDC (5 principal + 1 profit)
4. ✅ User withdraw 5 USDC

Expected output:
```
🧪 Testing VelocityVault...

📊 Initial State:
  User USDC balance: 100.0 USDC
  User vault balance: 0.0 USDC

Test 1: User Deposit
  ✅ Deposited
  New vault balance: 10.0 USDC

Test 2: Agent Withdraw
  ✅ Agent withdrew
  User balance after agent withdraw: 5.0 USDC

Test 3: Agent Deposit (return profits)
  ✅ Agent deposited
  User balance after profit return: 11.0 USDC

Test 4: User Withdraw
  ✅ Withdrawn
  Final vault balance: 6.0 USDC

✅ All tests passed!
```

## Troubleshooting

### "Insufficient funds for gas"
- Get more USDC from faucet
- Check your wallet balance on Arc explorer

### "USDC_ADDRESS not set"
- Add USDC address to `.env`
- Get it from faucet transaction or Circle docs

### "Network arcTestnet not found"
- Check `ARC_TESTNET_RPC` in `.env`
- Verify Arc testnet RPC URL from docs

### "Cannot find module '@openzeppelin/contracts'"
- Run `npm install` again
- Check that `node_modules/` exists

## What's Next?

After contracts are deployed:

**Day 2-3:** Yellow UI Integration
- Build gasless session-based frontend
- Connect to VelocityVault contract
- Show instant balance updates

**Day 4-6:** Agent + LI.FI
- Build AI agent that monitors Yellow sessions
- Integrate LI.FI for cross-chain routing
- Connect agent to vault for execution

See `../README.md` for full project plan.

## Quick Reference

```bash
# Install
npm install

# Compile
npm run compile

# Deploy
npm run deploy

# Test
npx hardhat run scripts/test-vault.ts --network arcTestnet

# Verify
npx hardhat verify --network arcTestnet <ADDRESS> <USDC> <AGENT>
```

## Resources

- Circle Console: https://console.circle.com
- Arc Faucet: https://faucet.circle.com
- Arc Explorer: https://testnet.arcscan.app
- Arc Docs: https://docs.arc.network
- Contract README: `./README.md`
