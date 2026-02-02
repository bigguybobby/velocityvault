# ⚡ VelocityVault

**Gasless Agentic Trading on Arc**

Built for ETHGlobal HackMoney 2026 | Targeting 6 sponsor prizes ($56k)

## The Vision

VelocityVault is a gasless, session-based trading interface powered by **Yellow Network** that controls an autonomous AI Agent. The agent manages a global USDC treasury on **Arc**, executes privacy-preserving strategies on **Uniswap v4**, routes capital via **LI.FI**, and hedges positions on **Sui** using DeepBook—all tied to a human-readable **ENS** identity.

**One interface. Zero gas fees. Instant execution.**

## Architecture

```
User → Yellow UI (gasless sessions)
         ↓
    AI Agent (monitors intents)
         ↓
    Arc Treasury (USDC vault)
         ↓
    LI.FI (cross-chain routing)
         ↓
    ├─→ Uniswap v4 (EVM trading + custom hooks)
    └─→ Sui DeepBook (high-frequency hedging)
         ↓
    ENS Identity (agent.eth - stores state/PnL)
```

## Tech Stack

| Component | Technology | Prize Target |
|-----------|-----------|--------------|
| **Frontend** | Next.js + wagmi + RainbowKit | - |
| **Gasless UX** | Yellow Network (Nitrolite SDK) | $15k |
| **Treasury** | VelocityVault.sol on Arc | $10k |
| **Contracts** | Hardhat + OpenZeppelin | - |
| **Trading** | Uniswap v4 custom hooks | $10k |
| **Hedging** | Sui DeepBook | $10k |
| **Routing** | LI.FI SDK | $6k |
| **Identity** | ENS | $5k |

## Quick Start

### Prerequisites

```bash
node >= 18
yarn
```

### Installation

```bash
# Clone repo
git clone https://github.com/bigguybobby/velocityvault.git
cd velocityvault

# Install dependencies
yarn install

# Start local chain
yarn chain

# Deploy contracts (new terminal)
yarn deploy

# Start frontend (new terminal)
yarn start
```

Visit: `http://localhost:3000`

## Project Structure

```
velocityvault/
├── packages/
│   ├── hardhat/              # Smart contracts
│   │   ├── contracts/
│   │   │   └── VelocityVault.sol
│   │   └── deploy/
│   │       └── 01_deploy_velocity_vault.ts
│   │
│   └── nextjs/               # Frontend (Next.js)
│       ├── app/
│       │   └── trade/        # Trading interface
│       ├── components/
│       │   └── velocityvault/
│       └── hooks/
│           └── useYellow.ts  # Yellow SDK integration
│
├── docs/                     # Research & integration notes
└── README.md
```

## Smart Contracts

### VelocityVault.sol

USDC treasury contract on Arc testnet.

**Key Functions:**

```solidity
// User functions
deposit(uint256 amount)          // Deposit USDC
withdraw(uint256 amount)         // Withdraw USDC
balanceOf(address user)          // Check balance

// Agent functions
agentWithdraw(user, amount, destination, executionId)  // Execute trade
agentDeposit(user, amount, executionId)                // Return profits
```

**Security:**
- ✅ ReentrancyGuard
- ✅ SafeERC20
- ✅ Ownable
- ✅ Custom errors

## Features

### 1. Gasless Trading (Yellow Network)

- User signs **once** (session key)
- All trades happen **off-chain**
- **Zero gas fees** during session
- Settlement when session closes

### 2. Arc Treasury

- USDC vault on Arc L1
- Sub-second finality
- USDC-native gas
- Agent-managed execution

### 3. AI Agent

- Monitors Yellow session intents
- Pulls funds from Arc vault
- Routes via LI.FI
- Executes on Uniswap v4 / Sui
- Returns profits to vault

### 4. Cross-Chain Routing (LI.FI)

- Seamless Arc → Base/Optimism/Sui
- Best route selection
- Single-transaction UX

### 5. Privacy Trading (Uniswap v4)

- Custom hooks for agentic logic
- Dark pool mechanics
- MEV protection

### 6. High-Frequency Hedging (Sui)

- DeepBook CLOB integration
- Instant finality
- Limit order execution

### 7. On-Chain Identity (ENS)

- agent.eth resolves to agent address
- Stores risk profile in text records
- Tracks PnL on-chain

## Development

### Compile Contracts

```bash
cd packages/hardhat
yarn hardhat compile
```

### Run Tests

```bash
yarn hardhat test
```

### Deploy to Arc Testnet

```bash
# Configure .env
cp packages/hardhat/.env.example packages/hardhat/.env
# Add: DEPLOYER_PRIVATE_KEY, USDC_ADDRESS, AGENT_ADDRESS

# Deploy
yarn deploy --network arcTestnet
```

### Start Frontend

```bash
cd packages/nextjs
yarn dev
```

## Deployment Status

- [ ] VelocityVault.sol → Arc testnet
- [ ] Yellow SDK → Integrated
- [ ] LI.FI SDK → Integrated
- [ ] Uniswap v4 Hook → Deployed
- [ ] Sui DeepBook → Integrated
- [ ] ENS Registration → agent.eth

## Roadmap

### Day 1-2 (Feb 2-3) ✅
- [x] Project setup
- [x] VelocityVault contract
- [x] Scaffold-ETH-2 migration
- [ ] Deploy to Arc testnet

### Day 3-4 (Feb 4-5)
- [ ] Yellow SDK integration
- [ ] Gasless trading UI
- [ ] Agent monitoring script

### Day 5-6 (Feb 6-7)
- [ ] LI.FI integration
- [ ] Uniswap v4 hooks
- [ ] Full flow testing

### Day 7-8 (Feb 8-9)
- [ ] Sui DeepBook integration
- [ ] ENS registration
- [ ] Polish UI

### Day 9 (Feb 10)
- [ ] Demo video
- [ ] Final testing
- [ ] Submit

## Resources

- **Arc Docs:** https://docs.arc.network
- **Yellow Docs:** https://docs.yellow.org
- **LI.FI Docs:** https://docs.li.fi
- **Uniswap v4:** https://docs.uniswap.org/contracts/v4
- **Sui Docs:** https://docs.sui.io
- **ENS Docs:** https://docs.ens.domains

## Sponsors

- 🟡 **Yellow Network** - Gasless session-based transactions
- 🔵 **Arc** - USDC treasury on Circle's L1
- 🦄 **Uniswap Foundation** - Agentic trading hooks
- 🌊 **Sui** - High-frequency hedging with DeepBook
- 🌈 **LI.FI** - Cross-chain liquidity routing
- 🏷️ **ENS** - On-chain agent identity

## License

MIT

## Team

Built by [@bigguybobby](https://github.com/bigguybobby) for HackMoney 2026

---

**Status:** Day 1 complete - Contracts + Scaffold-ETH-2 setup ready  
**Next:** Yellow SDK integration + gasless UI
