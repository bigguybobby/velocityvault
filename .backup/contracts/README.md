# VelocityVault Smart Contracts

USDC Treasury Vault for VelocityVault agentic trading system on Arc testnet.

## Overview

**VelocityVault.sol** is the core treasury contract that:
- Holds user USDC deposits on Arc
- Allows AI agent to execute cross-chain trades
- Returns profits back to users
- Integrates with Yellow UI (gasless UX) and LI.FI (cross-chain routing)

## Architecture

```
User → Yellow UI (gasless) → VelocityVault (Arc) → Agent → LI.FI → Uniswap/Sui
                                   ↑                                      ↓
                                   └──────── Profits returned ───────────┘
```

## Contract Functions

### User Functions

#### `deposit(uint256 amount)`
Deposit USDC into the vault.

**Parameters:**
- `amount`: Amount of USDC to deposit (6 decimals)

**Requirements:**
- User must approve vault to spend USDC first
- Amount must be > 0

**Emits:** `Deposit(user, amount, newBalance)`

#### `withdraw(uint256 amount)`
Withdraw USDC from the vault.

**Parameters:**
- `amount`: Amount of USDC to withdraw

**Requirements:**
- User must have sufficient balance in vault
- Amount must be > 0

**Emits:** `Withdraw(user, amount, newBalance)`

#### `balanceOf(address user) → uint256`
Check user's USDC balance in vault.

### Agent Functions

#### `agentWithdraw(address user, uint256 amount, address destination, bytes32 executionId)`
Agent withdraws USDC to execute a cross-chain trade.

**Parameters:**
- `user`: User whose funds to use
- `amount`: Amount to withdraw
- `destination`: Address to send funds (usually LI.FI contract)
- `executionId`: Unique ID for tracking this execution

**Requirements:**
- Only callable by authorized agent
- User must have sufficient balance

**Emits:** `AgentWithdraw(user, amount, destination, executionId)`

**Usage:**
```typescript
// Agent detects "Buy BTC" intent in Yellow session
const executionId = ethers.id(`execution-${Date.now()}`);
await vault.agentWithdraw(
  userAddress,
  ethers.parseUnits("100", 6), // 100 USDC
  lifiContractAddress,
  executionId
);
```

#### `agentDeposit(address user, uint256 amount, bytes32 executionId)`
Agent deposits profits back after successful trade.

**Parameters:**
- `user`: User to credit profits to
- `amount`: Total amount being returned (principal + profit)
- `executionId`: ID matching the original withdrawal

**Requirements:**
- Only callable by authorized agent
- Agent must approve vault to spend USDC first

**Emits:** `AgentDeposit(user, amount, profit, executionId)`

**Usage:**
```typescript
// After successful trade, agent returns funds
await usdc.connect(agent).approve(vaultAddress, returnAmount);
await vault.agentDeposit(
  userAddress,
  ethers.parseUnits("105", 6), // 100 principal + 5 profit
  executionId
);
```

### Admin Functions

#### `setAgent(address newAgent)`
Update the authorized agent address.

**Requirements:**
- Only callable by contract owner

**Emits:** `AgentUpdated(oldAgent, newAgent)`

## Setup

### Prerequisites

```bash
node >= 18
npm >= 9
```

### Installation

```bash
cd contracts
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in environment variables:

```env
# Arc Testnet RPC (check Arc docs for actual URL)
ARC_TESTNET_RPC=https://arc-testnet-rpc.circle.com
ARC_TESTNET_CHAIN_ID=999999

# Your deployer wallet private key
DEPLOYER_PRIVATE_KEY=0x...

# Agent wallet address (or use deployer for testing)
AGENT_ADDRESS=0x...

# USDC token address on Arc testnet (get from Circle docs or faucet)
USDC_ADDRESS=0x...
```

3. Get testnet USDC:
   - Visit: https://faucet.circle.com/
   - Request USDC for your deployer and agent wallets

## Compilation

```bash
npm run compile
```

Artifacts will be in `artifacts/` directory.

## Deployment

### Deploy to Arc Testnet

```bash
npm run deploy
```

This will:
1. Deploy VelocityVault contract
2. Save deployment info to `deployments/arc-testnet.json`
3. Export ABI to `deployments/VelocityVault.abi.json`

### Verify Contract

```bash
npx hardhat verify --network arcTestnet <VAULT_ADDRESS> <USDC_ADDRESS> <AGENT_ADDRESS>
```

## Testing

### Run Test Script

```bash
npx hardhat run scripts/test-vault.ts --network arcTestnet
```

This script tests:
1. ✅ User deposit
2. ✅ Agent withdraw (simulated execution)
3. ✅ Agent deposit (return profits)
4. ✅ User withdraw

## Integration with Frontend

### Load Contract

```typescript
import VelocityVaultABI from './deployments/VelocityVault.abi.json';
import deployment from './deployments/arc-testnet.json';

const vault = new ethers.Contract(
  deployment.vaultAddress,
  VelocityVaultABI,
  signer
);
```

### User Deposit Flow

```typescript
// 1. Approve USDC
const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
await usdc.approve(vaultAddress, amount);

// 2. Deposit
await vault.deposit(amount);
```

### Listen to Events

```typescript
vault.on("Deposit", (user, amount, newBalance) => {
  console.log(`User ${user} deposited ${amount} USDC`);
});

vault.on("AgentWithdraw", (user, amount, destination, executionId) => {
  console.log(`Agent executing trade for ${user}: ${amount} USDC`);
});

vault.on("AgentDeposit", (user, amount, profit, executionId) => {
  console.log(`Trade complete! Profit: ${profit} USDC`);
});
```

## Security Features

- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **SafeERC20** - Safe token transfers
- ✅ **Ownable** - Access control for admin functions
- ✅ **Custom Errors** - Gas-efficient error handling
- ✅ **CEI Pattern** - Checks-Effects-Interactions pattern
- ✅ **Agent Authorization** - Only authorized agent can execute trades

## For Demo Video

**Talking Points:**
1. "Users deposit USDC into our Arc vault"
2. "The vault acts as the central treasury - secure, auditable"
3. "When our AI agent detects a trade opportunity, it pulls funds via `agentWithdraw`"
4. "Agent routes through LI.FI to execute cross-chain"
5. "Profits flow back via `agentDeposit` - all tracked on-chain"
6. "Built on Arc for sub-second finality and USDC-native gas"

## Resources

- Arc Docs: https://docs.arc.network
- Arc Testnet Explorer: https://testnet.arcscan.app/
- Circle Faucet: https://faucet.circle.com/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts

## License

MIT
