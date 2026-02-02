# VelocityVault - Smart Template Setup

Using battle-tested templates instead of building from scratch.

## Template Stack

### 1. Contracts: Foundry + Scaffold-ETH-2

**Why Foundry:**
- Faster compilation (Rust-based)
- Better testing (Solidity tests)
- Gas reports built-in
- Industry standard for serious devs

**Setup:**
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Use Scaffold-ETH-2 contracts
git clone https://github.com/scaffold-eth/scaffold-eth-2.git temp
cp -r temp/packages/foundry contracts-foundry
rm -rf temp

# Or use Foundry template directly
forge init contracts-foundry --template foundry-rs/forge-template
```

### 2. Frontend: Create-Wagmi + Next.js

**Why wagmi:**
- Industry standard (20k+ stars)
- RainbowKit integration
- TypeScript-first
- Hooks for everything

**Setup:**
```bash
# Use create-wagmi CLI
npm create wagmi@latest -- --template next

# Or use scaffold-eth-2 frontend
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
# Uses Next.js + wagmi + RainbowKit + viem
```

### 3. Yellow SDK: Official Examples

**Check for:**
```bash
# Yellow might have examples
git clone https://github.com/yellow-network/examples
# Look for: trading-app, state-channel-demo, etc.
```

### 4. Uniswap v4: Official Template

**From Uniswap Foundation:**
```bash
git clone https://github.com/uniswapfoundation/v4-template
cd v4-template
forge install
```

### 5. LI.FI: SDK Examples

**From LI.FI docs:**
```bash
# Check: https://github.com/lifinance/sdk
git clone https://github.com/lifinance/sdk
cd sdk/examples
```

## Recommended Setup (2 commands)

### Option A: Scaffold-ETH-2 (All-in-one)

```bash
# Clone scaffold-eth-2 (Next.js + Foundry + Hardhat)
git clone https://github.com/scaffold-eth/scaffold-eth-2.git velocityvault-v2
cd velocityvault-v2

# Install
yarn install

# Start dev
yarn chain  # Local blockchain
yarn deploy # Deploy contracts
yarn start  # Next.js frontend
```

**Includes:**
- ✅ Next.js + wagmi + RainbowKit
- ✅ Foundry + Hardhat
- ✅ Hot reload
- ✅ TypeScript
- ✅ Beautiful UI components
- ✅ Contract hot reload

### Option B: Foundry + Next.js (Separate)

```bash
# Contracts with Foundry
forge init contracts --template foundry-rs/forge-template

# Frontend with wagmi
npm create wagmi@latest frontend -- --template next
```

## Migration Plan

### Keep What We Built:
1. ✅ **VelocityVault.sol** - Our contract is solid
2. ✅ **Architecture docs** - Keep the plans
3. ✅ **Integration notes** - Keep Yellow/Arc research

### Replace With Templates:
1. 🔄 **Hardhat → Foundry** - Faster compilation/testing
2. 🔄 **Custom React → Scaffold-ETH-2** - Better components
3. 🔄 **Manual SDK integration → wagmi hooks** - Cleaner code

## New Structure

```
velocityvault-v2/
├── packages/
│   ├── foundry/              # Contracts (Foundry)
│   │   ├── contracts/
│   │   │   └── VelocityVault.sol
│   │   ├── script/
│   │   │   └── Deploy.s.sol
│   │   ├── test/
│   │   │   └── VelocityVault.t.sol
│   │   └── foundry.toml
│   │
│   └── nextjs/               # Frontend (Next.js + wagmi)
│       ├── app/
│       │   └── page.tsx      # Trading interface
│       ├── components/
│       │   ├── ScaffoldEthAppWithProviders.tsx
│       │   ├── Header.tsx
│       │   └── trading/
│       │       ├── TradingInterface.tsx
│       │       └── YellowProvider.tsx
│       ├── hooks/
│       │   ├── useYellow.ts
│       │   └── useVault.ts
│       └── wagmi.config.ts
│
├── .env.example
└── README.md
```

## Actual Commands to Run

### 1. Start Fresh with Scaffold-ETH-2

```bash
cd /Users/bobby/.openclaw/workspace

# Clone scaffold-eth-2
git clone https://github.com/scaffold-eth/scaffold-eth-2.git velocityvault-prod
cd velocityvault-prod

# Install
yarn install

# Copy our VelocityVault.sol
cp ../velocityvault/contracts/contracts/VelocityVault.sol packages/foundry/contracts/

# Copy our Yellow integration
# (We'll adapt it to wagmi hooks)
```

### 2. Or Use Separate Templates

```bash
cd /Users/bobby/.openclaw/workspace/velocityvault

# Replace contracts with Foundry
rm -rf contracts
forge init contracts --template foundry-rs/forge-template

# Replace frontend with wagmi
rm -rf frontend
npm create wagmi@latest frontend -- --template next

# Copy our VelocityVault.sol
cp velocityvault-old/contracts/contracts/VelocityVault.sol contracts/src/
```

## Benefits of Templates

### Foundry vs Hardhat

| Feature | Hardhat | Foundry |
|---------|---------|---------|
| Compile | ~10s | ~1s |
| Test speed | Slow (JS) | Fast (Solidity) |
| Gas reports | Plugin | Built-in |
| Fuzzing | No | Yes |
| Industry use | Old | New standard |

### wagmi vs Custom viem

| Feature | Custom | wagmi |
|---------|--------|-------|
| Wallet connect | 50+ lines | 1 hook |
| Contract calls | Manual ABI | Auto-generated |
| Chain switching | Manual | 1 line |
| Type safety | Partial | Full |
| Community | DIY | 20k+ stars |

## What We Keep From Old Code

### Contracts:
- ✅ VelocityVault.sol logic (just copy it)
- ✅ Agent permission model
- ✅ Security patterns

### Frontend:
- ✅ UI design (adapt to Next.js)
- ✅ Yellow SDK integration (adapt to wagmi)
- ✅ Trading logic

### Docs:
- ✅ Architecture plans
- ✅ Integration notes
- ✅ Demo script

## Recommended Action

**Best approach:**

1. **Use Scaffold-ETH-2** (saves 2 days of setup)
2. **Copy VelocityVault.sol** (our contract is good)
3. **Adapt Yellow SDK** to wagmi patterns
4. **Use built-in components** (Header, Footer, etc.)
5. **Focus on Yellow/LI.FI integration** (the hard parts)

**Command:**
```bash
cd /Users/bobby/.openclaw/workspace
git clone https://github.com/scaffold-eth/scaffold-eth-2.git velocityvault-final
cd velocityvault-final
yarn install
# Then copy our contract + adapt frontend
```

## Should I Rebuild?

**Option 1:** Keep what I built (it works, just not optimal)
**Option 2:** Rebuild with Scaffold-ETH-2 (30 min, way better)
**Option 3:** Hybrid - Use Foundry for contracts, keep Next.js frontend

What do you prefer?
