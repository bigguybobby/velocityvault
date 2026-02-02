# Arc Integration Notes

## Overview

Arc is Circle's EVM-compatible L1 blockchain designed for:
- Onchain lending, capital markets, FX, payments
- USDC/EURC as gas tokens (fiat-based fees)
- Sub-second finality
- Enterprise-grade infrastructure

## Key Features for VelocityVault

1. **USDC Treasury Hub** - Main capital pool on Arc
2. **Circle Gateway Integration** - Programmatic wallet management
3. **Cross-chain routing** - Arc as liquidity source for other chains

## Setup Requirements

### Prerequisites
- Circle Developer Console account: https://console.circle.com
- API key (Standard Key)
- Entity Secret (64 char alphanumeric)

### SDK Installation

```bash
npm install @circle-fin/developer-controlled-wallets
```

### Environment Variables

```env
CIRCLE_API_KEY={YOUR_API_KEY}
CIRCLE_ENTITY_SECRET={YOUR_ENTITY_SECRET}
```

## Core Concepts

### Dev-Controlled Wallets
- EOA (Externally Owned Accounts) managed via Circle SDK
- Wallet sets for key derivation
- Programmatic signing

### Blockchain Details
- Network: `ARC-TESTNET` (for hackathon)
- Testnet explorer: https://testnet.arcscan.app/
- Faucet: https://faucet.circle.com/
- Gas token: USDC (native)

## Basic Operations

### 1. Initialize Client

```typescript
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET
});
```

### 2. Create Wallet Set & Wallets

```typescript
// Create wallet set
const walletSet = await client.createWalletSet({
  name: 'VelocityVault'
});

// Create wallet on Arc testnet
const wallet = await client.createWallets({
  accountType: 'EOA',
  blockchain: 'ARC-TESTNET',
  count: 1,
  walletSetId: walletSet.data.walletSet.id
});

// Response includes wallet.address
```

### 3. Get Testnet USDC

```bash
# Use Circle faucet
https://faucet.circle.com/
# Or Console faucet
https://console.circle.com/faucet
```

### 4. Check Balances

```typescript
const balances = await client.getWalletTokenBalance({
  id: walletId
});
```

### 5. Transfer USDC

```typescript
const transfer = await client.createTransaction({
  walletId: walletId,
  blockchain: 'ARC-TESTNET',
  tokenId: usdcTokenId, // Get from Circle
  destinationAddress: recipientAddress,
  amounts: ['10.0'], // USDC amount
  fee: {
    type: 'level',
    config: { feeLevel: 'MEDIUM' }
  }
});

// Check status
const status = await client.getTransaction({
  id: transfer.data.id
});
```

## For VelocityVault

### Architecture

```
┌─────────────────────────────────────┐
│  VelocityVault Smart Contract      │
│  (Arc Testnet)                      │
├─────────────────────────────────────┤
│  - USDC Treasury Pool               │
│  - Agent Permission System          │
│  - Withdrawal Functions             │
│  - Integration with LI.FI           │
└─────────────────────────────────────┘
         ↕
┌─────────────────────────────────────┐
│  Circle Dev-Controlled Wallet       │
│  (Contract owner / treasury wallet) │
└─────────────────────────────────────┘
```

### Contract Functions

```solidity
// VelocityVault.sol (Arc testnet)

contract VelocityVault {
    IERC20 public usdc;
    address public agent; // AI agent address
    
    mapping(address => uint256) public balances;
    
    // User deposits USDC into vault
    function deposit(uint256 amount) external {
        usdc.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }
    
    // User withdraws USDC
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        usdc.transfer(msg.sender, amount);
    }
    
    // Agent withdraws for cross-chain execution
    function agentWithdraw(
        uint256 amount,
        address destination
    ) external onlyAgent {
        require(balances[msg.sender] >= amount);
        usdc.transfer(destination, amount); // Send to LI.FI
    }
    
    // Agent returns profits
    function agentDeposit(
        address user,
        uint256 amount
    ) external onlyAgent {
        usdc.transferFrom(msg.sender, address(this), amount);
        balances[user] += amount;
    }
}
```

### Integration Flow

1. **User → Yellow UI**
   - User deposits USDC to VelocityVault on Arc
   - Yellow session tracks off-chain balance

2. **Agent monitors Yellow session**
   - User clicks "Buy BTC" in Yellow UI
   - Agent sees intent in session state

3. **Agent executes via Arc vault**
   - Agent calls `agentWithdraw` on VelocityVault
   - USDC sent from Arc to LI.FI bridge
   - LI.FI routes to target chain (Uniswap/Sui)

4. **Agent returns profits**
   - After trade, agent calls `agentDeposit`
   - Updates user balance on Arc
   - Yellow UI shows updated balance

## Resources

- Arc Docs: https://docs.arc.network
- Circle Wallets SDK: https://developers.circle.com/wallets/dev-controlled
- Circle API Reference: https://developers.circle.com/api-reference/wallets/developer-controlled-wallets/
- Testnet Explorer: https://testnet.arcscan.app/
- Testnet Faucet: https://faucet.circle.com/

## Notes

- Arc uses USDC as gas (no need for separate gas token)
- Sub-second finality = fast settlement
- EVM-compatible = use standard Solidity/Foundry
- Circle SDK handles wallet management (no manual key storage)

## Demo Points

For the hackathon video:
1. "Our user's USDC sits safely on Arc testnet"
2. "Arc serves as the global liquidity hub"
3. "When the agent needs to execute, it pulls from Arc treasury"
4. "After the trade, profits flow back to Arc"
5. "Circle's enterprise-grade infrastructure protects the funds"
