# VelocityVault — Master Execution Plan

## Tagline
**The Gasless Agentic Liquidity Mesh**

## One‑Line Thesis
VelocityVault turns AI agents into **policy‑bound financial actors** with on‑chain enforcement.

## Mental Model (Hub‑Brain‑Spoke)
- **Hub (Arc):** Treasury contract holding USDC
- **Brain (Yellow + AI):** Off‑chain intents + session keys
- **Limbs (LI.FI):** Cross‑chain routing
- **Spoke 1 (Uniswap v4):** Execution with Safety Hook
- **Spoke 2 (Sui / DeepBook):** Hedge engine
- **Identity (ENS):** PnL + activity as portable reputation

## Target Sponsors (6)
- Yellow — Session keys + mandates
- Uniswap v4 — Safety hook / Risk firewall
- Arc — Treasury contract + USDC hub
- LI.FI — Cross‑chain routing
- Sui — DeepBook hedging
- ENS — Agent reputation via text records

## 9‑Day Sprint Plan

### Phase 1: Core (Arc + Yellow) — Days 1–2
**Goal:** User can deposit funds + sign commands without gas.

**Day 1 — Treasury (Arc)**
- Deploy `VelocityTreasury.sol` on Arc testnet
- Functions: `deposit(token, amount)` and `executeStrategy(bridgeData, strategyParams)`
- **Arc win:** Arc as capital home base

**Day 2 — Session Layer (Yellow)**
- Initialize Next.js app + Yellow SDK
- Create a **Session** and allow gasless “Sign In”
- “Trade” button signs **intent** off‑chain
- **Yellow win:** session‑based gasless interaction

### Phase 2: Intelligence (LI.FI + Uniswap v4) — Days 3–5
**Goal:** Agent moves money and trades safely.

**Day 3 — Bridge (LI.FI)**
- Write Node.js agent script
- On Yellow intent, call `lifi.getQuote(...)`
- Execute `VelocityTreasury.executeStrategy` with bridge data
- **LI.FI win:** cross‑chain orchestration

**Day 4 — Hook (Uniswap v4)**
- Write `VelocityHook.sol`
- Implement `beforeSwap` guardrail (e.g., slippage / price)
- **Uniswap win:** hooks for agentic finance safety

**Day 5 — Integration**
- Connect flow: **Yellow intent → LI.FI bridge → Uniswap v4 hook trade**

### Phase 3: Speed + Identity (Sui + ENS) — Days 6–7
**Goal:** High‑speed hedging + portable reputation.

**Day 6 — Hedge (Sui DeepBook)**
- Write Move module `velocity::hedger`
- Use DeepBook SDK to place limit orders
- Agent logic: hedge during high volatility
- **Sui win:** DeepBook used for risk offsetting

**Day 7 — Identity (ENS)**
- Register `velocity-agent.eth` on Sepolia
- Update ENS text record `com.velocity.pnl`
- Display agent name + PnL on frontend
- **ENS win:** non‑trivial identity integration

### Phase 4: Polish + Pitch — Days 8–9
**Day 8 — UI Polish**
- Smooth Yellow dashboard UX
- Live action log: “Bridging via LI.FI → Executing on Uniswap → Hedging on Sui”

**Day 9 — Demo Script + Video**
- Tight 2–3 min walkthrough
- Emphasize: **gasless control + on‑chain guardrails**

## Demo Script (2–3 min)
1. **Problem:** Agents act continuously; safety must be on‑chain.
2. **Thesis:** “We turn AI agents into policy‑bound financial actors with on‑chain enforcement.”
3. **Yellow:** Gasless session + intent signing
4. **Arc:** Deposit to Treasury (safe custody)
5. **LI.FI:** Bridge to Base
6. **Uniswap v4:** Hook blocks unsafe trade (“blockchain said NO”)
7. **Sui DeepBook:** Hedge executed
8. **ENS:** Reputation / PnL updates on‑chain

## Code Cheat Sheet

### Uniswap v4 Hook (Solidity)
```solidity
function beforeSwap(
  address sender,
  PoolKey calldata key,
  IPoolManager.SwapParams calldata params,
  bytes calldata hookData
) external override returns (bytes4) {
  uint160 limitPrice = abi.decode(hookData, (uint160));
  (uint160 currentSqrtPriceX96,,,) = poolManager.getSlot0(key.toId());
  if (currentSqrtPriceX96 < limitPrice) revert("Price too low for agent");
  return BaseHook.beforeSwap.selector;
}
```

### Yellow Intent (Frontend)
```ts
const intent = {
  action: "REBALANCE",
  sourceChain: "ARC",
  targetChain: "BASE",
  token: "USDC",
  amount: "1000",
};

const signature = await yellowSession.sign(intent);
await axios.post("/api/agent/execute", { intent, signature });
```

### Sui Move (DeepBook Hedge)
```move
public entry fun hedge_on_deepbook(
  clock: &Clock,
  pool: &mut Pool<USDC, ETH>,
  coin_in: Coin<USDC>,
  ctx: &mut TxContext
) {
  deepbook::clob::place_limit_order(
    pool,
    client_order_id,
    price,
    quantity,
    true,
    coin_in,
    clock,
    ctx
  );
}
```

## Final Advice
- Use LI.FI SDK (don’t build a bridge)
- If Sui bridging is slow, add **Test Mode** to simulate arrival in demo
- Keep everything framed around **Agentic** + **Policy‑Bound** execution
