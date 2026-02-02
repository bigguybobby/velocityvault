# VelocityVault - Scaffold-ETH-2 Rebuild Plan

**Repo:** https://github.com/bigguybobby/velocityvault  
**Status:** Initial prototype committed, ready for template migration

## Why Rebuild with Scaffold-ETH-2?

### Current (Manual Build)
- ❌ Hardhat (slow, 10s+ compiles)
- ❌ Custom React setup
- ❌ Manual wagmi/viem integration
- ❌ Basic UI components
- ⚠️ Works, but not optimal

### With Scaffold-ETH-2
- ✅ Foundry (1s compiles, Solidity tests)
- ✅ Next.js + App Router
- ✅ wagmi + RainbowKit (battle-tested)
- ✅ Beautiful UI components
- ✅ Hot reload everything
- ✅ TypeScript strict mode
- ✅ Used by winning hackathon projects

## Migration Steps

### Phase 1: Setup (Commit 1)
```bash
# Clone scaffold-eth-2 into new branch
git checkout -b scaffold-eth-2-migration
cd ..
git clone https://github.com/scaffold-eth/scaffold-eth-2.git velocityvault-temp
cp -r velocityvault-temp/* velocityvault/
rm -rf velocityvault-temp

# Commit
git add -A
git commit -m "feat: add Scaffold-ETH-2 template base"
git push origin scaffold-eth-2-migration
```

### Phase 2: Migrate Contract (Commit 2)
```bash
# Copy our VelocityVault.sol
cp contracts/contracts/VelocityVault.sol packages/foundry/contracts/

# Update deploy script
# Edit packages/foundry/script/Deploy.s.sol

# Commit
git add packages/foundry/
git commit -m "feat: add VelocityVault contract

- USDC treasury on Arc
- Agent execution system
- User deposit/withdraw
- Full security (ReentrancyGuard, SafeERC20, Ownable)"
git push
```

### Phase 3: Add Yellow SDK (Commit 3)
```bash
# Install Yellow SDK
cd packages/nextjs
yarn add @erc7824/nitrolite ws

# Create Yellow hook
# packages/nextjs/hooks/useYellow.ts

# Create Yellow provider
# packages/nextjs/components/providers/YellowProvider.tsx

# Commit
git add packages/nextjs/
git commit -m "feat: integrate Yellow SDK for gasless transactions

- useYellow hook
- YellowProvider context
- Session-based authentication
- WebSocket connection to Yellow Network"
git push
```

### Phase 4: Build Trading UI (Commit 4)
```bash
# Create trading components
# packages/nextjs/app/trade/page.tsx
# packages/nextjs/components/velocityvault/TradingInterface.tsx
# packages/nextjs/components/velocityvault/BalanceCard.tsx

# Commit
git add packages/nextjs/
git commit -m "feat: build gasless trading interface

- Buy/Sell BTC buttons
- Real-time balance updates
- Trade activity feed
- Demo stats display"
git push
```

### Phase 5: Connect to Arc (Commit 5)
```bash
# Add Arc network config
# packages/nextjs/scaffold.config.ts

# Update contract hooks
# packages/nextjs/hooks/useVault.ts

# Commit
git add packages/nextjs/
git commit -m "feat: connect to Arc testnet

- Arc network configuration
- VelocityVault contract integration
- useVault hook for deposits/withdrawals"
git push
```

### Phase 6: Add LI.FI (Commit 6)
```bash
# Install LI.FI SDK
cd packages/nextjs
yarn add @lifi/sdk

# Create agent monitor
# packages/agent/monitor.ts

# Commit
git add packages/
git commit -m "feat: integrate LI.FI for cross-chain routing

- LI.FI SDK integration
- Agent monitoring script
- Cross-chain execution flow"
git push
```

### Phase 7: Polish & Test (Commit 7+)
```bash
# Multiple small commits:
git commit -m "style: improve trading UI"
git commit -m "test: add VelocityVault tests"
git commit -m "docs: update README with demo instructions"
git commit -m "fix: handle Yellow WebSocket reconnection"
# etc.
```

## Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, UI changes
- `refactor:` Code restructure
- `test:` Add tests
- `chore:` Build, dependencies

### Examples
```
feat(contracts): add VelocityVault treasury contract

- USDC deposits/withdrawals
- Agent execution system
- Full security patterns

For HackMoney 2026 - Arc prize track
```

```
feat(frontend): integrate Yellow SDK for gasless UX

- useYellow hook for session management
- WebSocket connection to Yellow Network
- Off-chain transaction signing

Targets Yellow $15k prize
```

## Branching Strategy

```
main
  ↓
scaffold-eth-2-migration (active development)
  ↓
feature/yellow-sdk (if needed)
feature/lifi-integration (if needed)
```

### Merge to main when:
- ✅ Contracts compile
- ✅ Frontend builds
- ✅ Basic functionality works
- ✅ Ready for demo

## GitHub Review Points

Judges/reviewers will see:
1. ✅ **Clear commit history** - Shows our process
2. ✅ **Frequent commits** - Active development
3. ✅ **Good messages** - Explains what we built
4. ✅ **Professional setup** - Scaffold-ETH-2 = serious
5. ✅ **Documentation** - README, comments, guides

## Timeline

**Tonight (Day 1):**
- [x] Initial commit (done)
- [ ] Scaffold-ETH-2 migration (30 min)
- [ ] Contract integration (15 min)
- [ ] Yellow SDK basics (30 min)

**Tomorrow (Day 2):**
- [ ] Trading UI polish
- [ ] Arc deployment
- [ ] Full integration testing

**Day 3-9:**
- [ ] LI.FI + Agent
- [ ] Uniswap v4 hooks
- [ ] Sui + ENS (if time)
- [ ] Video + submit

## Next Command

```bash
# Run this to start migration:
cd /Users/bobby/.openclaw/workspace
./velocityvault/scripts/migrate-to-scaffold.sh
```

(I'll create this script next)
