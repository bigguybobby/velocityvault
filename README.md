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
| **Contracts** | Foundry + OpenZeppelin | - |
| **Trading** | Uniswap v4 custom hooks | $10k |
| **Hedging** | Sui DeepBook | $10k |
| **Routing** | LI.FI SDK | $6k |
| **Identity** | ENS | $5k |

## Quick Start

### Prerequisites

```bash
node >= 18
yarn
foundry
```

### Installation

```bash
# Clone repo
git clone https://github.com/bigguybobby/velocityvault.git
cd velocityvault

# Install dependencies
yarn install

# Install Foundry deps (first time only)
cd packages/foundry
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
cd ../..

# Start local chain
yarn chain

# Start frontend (new terminal)
yarn start
```

Visit: `http://localhost:3000`

## Project Structure

```
velocityvault/
├── packages/
│   ├── foundry/              # Smart contracts (Foundry)
│   │   └── src/
│   │       └── VelocityVault.sol
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
cd packages/foundry
forge build
```

### Run Tests

```bash
cd packages/foundry
forge test
```

### Start Frontend

```bash
cd packages/nextjs
yarn dev
```

## Current Status

**Core MVP is in place.**

- [x] Monorepo setup (Next.js + Foundry)
- [x] VelocityVault.sol smart contract
- [x] Yellow SDK integration (gasless UI)
- [x] AI agent scaffold with LI.FI routing
- [x] Documentation + demo guides
- [ ] Deploy to Arc testnet (needs USDC + RPC confirmation)
- [ ] End-to-end test with real testnet USDC
- [ ] Uniswap v4 hooks (optional)
- [ ] Sui DeepBook (optional)
- [ ] ENS integration (optional)

**Demo-Ready:** Yes (local)  
**Testnet Deployment:** Pending Arc setup
