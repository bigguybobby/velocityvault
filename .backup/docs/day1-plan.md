# Day 1 Implementation Plan

**Date:** Feb 2, 2026  
**Goal:** Research complete, environment setup, begin Arc vault contract

## Morning (Completed ✅)

- [x] Project structure created
- [x] Master plan documented (README.md)
- [x] Research Yellow SDK
  - [x] Understand Nitrolite protocol
  - [x] Document quickstart example
  - [x] Save integration notes
- [x] Research Arc deployment
  - [x] Circle Gateway setup
  - [x] Document USDC transfer flow
  - [x] Save integration notes

## Afternoon (Next Steps)

### 1. Environment Setup

```bash
cd /Users/bobby/.openclaw/workspace/velocityvault

# Install Yellow SDK
npm init -y
npm install @erc7824/nitrolite viem ws dotenv

# Install Circle Wallets SDK
npm install @circle-fin/developer-controlled-wallets

# Install dev dependencies
npm install -D @types/node @types/ws typescript hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Set Up Circle Account

- [ ] Create Circle Developer Console account
- [ ] Generate API key (Standard Key)
- [ ] Register Entity Secret
- [ ] Add credentials to `.env`

### 3. Create Arc Testnet Wallet

**Script:** `scripts/setup-arc-wallet.ts`

```typescript
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import 'dotenv/config';

async function main() {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!
  });

  // Create wallet set
  const walletSet = await client.createWalletSet({
    name: 'VelocityVault'
  });

  // Create wallet on Arc testnet
  const wallets = await client.createWallets({
    accountType: 'EOA',
    blockchain: 'ARC-TESTNET',
    count: 2, // One for vault, one for agent
    walletSetId: walletSet.data.walletSet.id
  });

  console.log('Wallets created:');
  wallets.data.wallets.forEach((w, i) => {
    console.log(`  ${i === 0 ? 'Vault' : 'Agent'} Wallet:`, w.address);
  });

  // Save wallet IDs to .env
}

main();
```

### 4. Get Testnet USDC

- [ ] Visit https://faucet.circle.com/
- [ ] Request USDC for vault wallet
- [ ] Request USDC for agent wallet
- [ ] Verify balances via Circle Console

### 5. Write VelocityVault Contract

**Contract:** `contracts/VelocityVault.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VelocityVault is Ownable {
    IERC20 public immutable usdc;
    address public agent;
    
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event AgentWithdraw(address indexed destination, uint256 amount);
    event AgentDeposit(address indexed user, uint256 amount);
    
    constructor(address _usdc, address _agent) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        agent = _agent;
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        usdc.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        usdc.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }
    
    function agentWithdraw(
        address user,
        uint256 amount,
        address destination
    ) external onlyAgent {
        require(balances[user] >= amount, "Insufficient user balance");
        balances[user] -= amount;
        usdc.transfer(destination, amount);
        emit AgentWithdraw(destination, amount);
    }
    
    function agentDeposit(
        address user,
        uint256 amount
    ) external onlyAgent {
        usdc.transferFrom(msg.sender, address(this), amount);
        balances[user] += amount;
        emit AgentDeposit(user, amount);
    }
    
    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
    }
    
    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent");
        _;
    }
}
```

### 6. Hardhat Configuration

**File:** `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    arcTestnet: {
      url: "https://arc-testnet-rpc.circle.com", // Update with actual RPC
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 999999, // Update with Arc testnet chain ID
    },
  },
};

export default config;
```

### 7. Deploy Script

**File:** `scripts/deploy-vault.ts`

```typescript
import { ethers } from "hardhat";

async function main() {
  const usdcAddress = "0x..."; // Arc testnet USDC address
  const agentAddress = process.env.AGENT_WALLET_ADDRESS!;

  const VelocityVault = await ethers.getContractFactory("VelocityVault");
  const vault = await VelocityVault.deploy(usdcAddress, agentAddress);

  await vault.waitForDeployment();

  console.log("VelocityVault deployed to:", await vault.getAddress());
}

main();
```

## Evening (If Time)

### 8. Test Deployment

```bash
# Compile
npx hardhat compile

# Deploy to Arc testnet
npx hardhat run scripts/deploy-vault.ts --network arcTestnet

# Verify on explorer
```

### 9. Test Basic Operations

**Script:** `scripts/test-vault.ts`

```typescript
// Test deposit
await vault.deposit(ethers.parseUnits("10", 6)); // 10 USDC

// Check balance
const balance = await vault.balances(userAddress);
console.log("Balance:", ethers.formatUnits(balance, 6));

// Test withdraw
await vault.withdraw(ethers.parseUnits("5", 6));
```

## Blockers / Questions

- [ ] What is Arc testnet RPC URL?
- [ ] What is Arc testnet chain ID?
- [ ] What is USDC contract address on Arc testnet?
- [ ] Do we need Sepolia ETH for Yellow SDK testing?

## Tomorrow (Day 2)

- Yellow SDK frontend integration
- Session key generation
- Gasless UI demo
- Connect Yellow to Arc vault

## Notes

- **Focus on Arc vault first** - this is the foundation
- **Circle SDK handles wallets** - no manual key management
- **Keep contracts simple** - we're building a demo, not production
- **Document everything** - needed for submission README

## Success Criteria for Day 1

- [x] Research complete (Yellow + Arc)
- [ ] Circle account set up
- [ ] Arc wallets created
- [ ] Testnet USDC obtained
- [ ] VelocityVault contract written
- [ ] Contract deployed to Arc testnet
- [ ] Basic deposit/withdraw tested

**Status:** 40% complete (research done, implementation starts afternoon)
