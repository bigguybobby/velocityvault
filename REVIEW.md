# VelocityVault - Code Review Guide

**Date:** Feb 2, 2026  
**For:** Kacper (web3 dev review)  
**Status:** Contracts + Frontend complete, ready for your review

---

## What to Review

### 1. Smart Contracts (Priority: HIGH)

**Main Contract:**
```
packages/foundry/src/VelocityVault.sol
```

**What to check:**
- ✅ Security: ReentrancyGuard, SafeERC20, Ownable
- ✅ Logic: deposit/withdraw/agentWithdraw/agentDeposit
- ✅ Events: All actions emit events
- ✅ Modifiers: onlyAgent, nonReentrant
- ✅ Error handling: Custom errors (gas efficient)

**Questions for review:**
1. Is the agent permission model secure enough?
2. Should we add more validation on `agentWithdraw`?
3. Any edge cases I missed?
4. Is the `executionId` tracking sufficient?

### 2. Frontend (Priority: MEDIUM)

**Core logic:**
```
packages/nextjs/hooks/velocityvault/useYellow.ts
packages/nextjs/components/velocityvault/YellowProvider.tsx
```

**What to check:**
- Yellow SDK integration looks correct
- WebSocket message handling
- Session management
- Error states

**UI Components:**
```
packages/nextjs/app/trade/page.tsx
packages/nextjs/components/velocityvault/TradingInterface.tsx
```

**What to check:**
- Wallet integration
- User flow makes sense
- Demo-ready (looks good on video)

### 3. Documentation (Priority: LOW)

**Guides:**
```
README.md            - Overview
DEMO-GUIDE.md        - Demo script
DEPLOYMENT.md        - Foundry deploy notes
```

**What to check:**
- Instructions are clear
- No missing steps
- Ready for judges to read

---

## Review Priority Order

### 🔴 Critical (Must review before deploy)

1. **VelocityVault.sol** - Core contract security
2. **scaffold.config.ts** - Arc network configuration

### 🟡 Important (Review when you have time)

3. **useYellow.ts** - Frontend integration
4. **Trading UI** - UX flow

### 🟢 Nice to have (Review if curious)

5. **Design polish** - UI tweaks
6. **Docs** - Clarity for judges

---

## Specific Security Concerns

### Agent Permission Model

**Current design:**
```solidity
address public agent;  // Single agent address

modifier onlyAgent() {
    if (msg.sender != agent) revert UnauthorizedAgent();
    _;
}
```

**Questions:**
1. Should we use a role-based system (OpenZeppelin AccessControl)?
2. Should agent withdrawals have daily limits?
3. Should we track executionId → amount mapping on-chain?
