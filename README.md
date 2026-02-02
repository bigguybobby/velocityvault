# VelocityVault: The Agentic Liquidity Mesh

**HackMoney 2026 Submission**  
**Deadline:** February 11, 2026 (9 days)  
**Target:** All 6 sponsor prizes ($56k total)

## Pitch

A gasless, session-based interface (Yellow) that controls an autonomous AI Agent. This Agent manages a global treasury on Arc (USDC), executes privacy-preserving strategies on Uniswap v4, routes capital via LI.FI, and hedges positions on Sui using DeepBook—all tied to a human-readable ENS identity.

## Architecture

```
User → Yellow UI (gasless sessions)
         ↓
    AI Agent (off-chain)
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

## Tech Stack Integration

| Sponsor | Integration | Prize Target |
|---------|-------------|--------------|
| Yellow | Session-based gasless UI (Nitrolite SDK) | $15k |
| Arc | USDC treasury vault (Circle Gateway) | $10k |
| Uniswap v4 | Agentic trading hooks | $10k |
| Sui | DeepBook CLOB hedging | $10k |
| LI.FI | Cross-chain routing layer | $6k |
| ENS | Agent identity + state storage | $5k |

## 9-Day Sprint Plan

### Phase 1: The Core (Days 1-3) - Arc + Yellow
**Goal:** Establish the "Bank" and the "Remote Control"

**Deliverables:**
- [ ] Arc vault contract (USDC treasury)
- [ ] Yellow SDK frontend (gasless session UI)
- [ ] Basic deposit/withdraw flow
- [ ] "Wow factor": rapid trades with zero wallet popups

**Resources:**
- Yellow Nitrolite docs: https://docs.yellow.org/docs/learn
- Circle Gateway docs: https://developers.circle.com/gateway
- Arc docs: https://docs.arc.network

### Phase 2: The Brain (Days 4-6) - Uniswap v4 + LI.FI
**Goal:** Make capital move intelligently

**Deliverables:**
- [ ] Uniswap v4 custom hook (TWAP or stop-loss logic)
- [ ] AI Agent script (Python/TS) that monitors Yellow session
- [ ] LI.FI integration: Arc → Optimism/Base → Uniswap v4
- [ ] Working trade execution flow

**Resources:**
- Uniswap v4 template: https://github.com/uniswapfoundation/v4-template
- LI.FI SDK: https://docs.li.fi/sdk/overview
- Scaffold-ETH-2 for hooks

### Phase 3: The Optimization (Days 7-8) - Sui + ENS
**Goal:** Add high-performance hedging and identity

**Deliverables:**
- [ ] Sui Move contract (DeepBook integration)
- [ ] LI.FI bridge to Sui (or mock if complex)
- [ ] ENS registration (agent.eth)
- [ ] ENS text records: risk profile, active chain, PnL
- [ ] Frontend displays ENS-resolved agent identity

**Resources:**
- DeepBook docs: https://docs.sui.io/standards/deepbook
- ENS docs: https://docs.ens.domains

### Phase 4: Polish & Video (Day 9)
**Goal:** Ship the demo

**Deliverables:**
- [ ] 3-minute demo video
- [ ] Architecture diagram
- [ ] GitHub repo cleanup
- [ ] Submission on ETHGlobal

**Demo Script:**
1. Yellow: "Look how fast I'm trading, no gas"
2. Arc: "My funds are safe in the USDC Treasury"
3. LI.FI/Uniswap: "AI Agent auto-routes to Uniswap v4 with custom Hook"
4. Sui: "We hedged the risk on Sui's DeepBook for instant finality"
5. ENS: "All managed by my on-chain identity"

## Development Log

### Day 1 (Feb 2, 2026)
- [x] Project structure created
- [ ] Research Yellow SDK
- [ ] Research Arc deployment
- [ ] Set up testnet wallets

## Notes

- **Judges prioritize video over code** - focus on demo quality
- **Functional MVP > perfect code** - prove the concept works
- **Architecture diagram required** for Arc prizes
- **TxIDs required** for Uniswap prizes (testnet/mainnet)
- **Video + GitHub required** for all submissions

## Key Risks

1. **Yellow SDK learning curve** - state channels are complex
2. **Sui Move contract** - different paradigm from Solidity
3. **Integration complexity** - 6 SDKs need to work together
4. **Time constraint** - 9 days for full-stack multi-chain app

## Mitigation Strategy

- Start with Yellow + Arc core (days 1-3)
- Mock Sui bridge if needed (focus on DeepBook logic)
- ENS is low-hanging fruit (add on day 7-8)
- Use Scaffold-ETH-2 templates where possible
- Prioritize working demo over clean code
