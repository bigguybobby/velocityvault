# VelocityVault - Task Tracker

**Deadline:** Feb 11, 2026 (9 days remaining)

## Phase 1: The Core (Days 1-3) - Arc + Yellow

### Day 1 (Feb 2, 2026) - Setup & Research
- [x] Create project structure
- [x] Write master plan (README.md)
- [x] Research Yellow SDK (Nitrolite protocol)
  - [x] Understand state channels
  - [x] Find quickstart/examples
  - [x] Document integration guide
- [x] Research Arc deployment
  - [x] Circle Gateway setup
  - [x] USDC testnet faucet
  - [x] Smart contract examples
- [x] **CONTRACTS COMPLETE**
  - [x] VelocityVault.sol (USDC treasury with agent system)
  - [x] Foundry configuration
  - [x] Full documentation
- [ ] Set up testnet wallets (Kacper to do)
  - [ ] Create Circle Developer account
  - [ ] Get Arc testnet wallet
  - [ ] Get testnet USDC from faucet

### Day 2 (Feb 3) - Arc Vault Contract
- [ ] Verify Arc testnet chain id + RPC
- [ ] Deploy to Arc testnet (Kacper)
- [ ] Test deposit/withdraw flow
- [ ] **Checkpoint:** Project Check-in #1 Due (5:59am)

### Day 2-3 (Feb 3-4) - Yellow Frontend
- [x] **FRONTEND COMPLETE** (Built on Day 1!)
  - [x] Yellow SDK integration (Nitrolite)
  - [x] Session-based authentication
  - [x] Gasless trading UI (Buy/Sell/Rebalance)
  - [x] Real-time balance updates via WebSocket
  - [x] Trading interface with activity feed
  - [x] Demo stats (trades, gas fees, settlement)
  - [x] Full documentation
- [ ] Connect to deployed Arc vault (Day 2)
- [ ] Test full flow with real testnet USDC (Day 2)

## Phase 2: The Brain (Days 4-6) - Uniswap v4 + LI.FI

### Day 4 (Feb 5) - Uniswap v4 Hook
- [ ] Clone v4 template
- [ ] Write custom hook (TWAP or stop-loss logic)
- [ ] Deploy to testnet
- [ ] Test hook execution

### Day 5 (Feb 6) - LI.FI Integration
- [ ] Integrate LI.FI SDK
- [ ] Build bridge flow: Arc → Base/Optimism
- [ ] Connect to Uniswap v4
- [ ] Test full flow
- [ ] **Checkpoint:** Project Check-in #2 Due (5:59am)

### Day 6 (Feb 7) - AI Agent
- [ ] Build agent script (TS/Python)
- [ ] Monitor Yellow session state
- [ ] Execute LI.FI routes based on intents
- [ ] Log decisions for demo

## Phase 3: The Optimization (Days 7-8) - Sui + ENS

### Day 7 (Feb 8) - Sui DeepBook
- [ ] Learn Move basics
- [ ] Write DeepBook integration contract
- [ ] Deploy to Sui testnet
- [ ] Test limit orders
- [ ] (Optional) LI.FI bridge to Sui

### Day 8 (Feb 9) - ENS Integration
- [ ] Register ENS name (agent.eth) on testnet
- [ ] Integrate ENS resolution in frontend
- [ ] Write script to update text records (PnL, chain, risk)
- [ ] Test ENS display

## Phase 4: Polish & Video (Day 9)

### Day 9 (Feb 10) - Ship It
- [ ] Record 3-minute demo video
- [ ] Create architecture diagram
- [ ] Clean up GitHub repo
- [ ] Write README with setup instructions
- [ ] Prepare submission materials
- [ ] Submit on ETHGlobal before 6pm

### Day 10 (Feb 11) - Buffer
- [ ] Final tweaks if needed
- [ ] Backup plan if submission has issues

## Blocked / Questions

- [ ] Do we have testnet USDC?
- [ ] Arc - confirm testnet chain id + RPC

## Notes

- Focus on **demo quality** over code perfection
- **Video matters more than anything**
- Keep scope realistic - mock what's too complex
- Prioritize Yellow + Arc + LI.FI (highest value sponsors)
