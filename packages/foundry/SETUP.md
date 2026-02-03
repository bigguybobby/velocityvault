# VelocityVault Foundry Setup

## Install Dependencies

```bash
cd packages/foundry

# Install all dependencies
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts Uniswap/v4-core Uniswap/v4-periphery --no-commit

# Build contracts
forge build

# Run tests
forge test -vvv
```

## Contracts

### VelocityVault.sol
Main treasury vault for user USDC deposits. AI agent can withdraw/deposit on behalf of users.

### VelocityHook.sol
Uniswap v4 safety hook enforcing agentic trading rails:
- **Strategy Hash Validation** - Only whitelisted strategies can execute
- **Slippage Protection** - Enforces maximum price impact
- **Operator Authorization** - Only approved agents can trade

## Hook Configuration

```solidity
// 1. Deploy hook (address must have correct flags)
VelocityHook hook = new VelocityHook(poolManager);

// 2. Authorize agent operators
hook.setOperator(agentAddress, true);

// 3. Whitelist approved strategies
hook.setStrategy(keccak256("momentum-crosschain-arb-v1"), true);

// 4. Configure slippage (optional, default 5%)
hook.setMaxSlippage(300); // 3%
```

## Executing Trades

When swapping through a pool with VelocityHook, encode the policy in hookData:

```solidity
bytes memory hookData = hook.encodeSwapPolicy(
    strategyHash,      // Must be whitelisted
    maxSlippageBps,    // 0 = use default
    operatorAddress    // Must be authorized
);

// Pass hookData to swap
poolManager.swap(poolKey, swapParams, hookData);
```

## Events

- `PolicyViolation(operator, strategyHash, reason, poolId)` - Emitted when trade blocked
- `TradeExecuted(operator, strategyHash, poolId, amount, timestamp)` - Emitted on success
- `StrategyUpdated(strategyHash, allowed)` - Strategy whitelist changed
- `OperatorUpdated(operator, authorized)` - Operator authorization changed
