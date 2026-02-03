# Foundry Contracts

This package replaces the old Hardhat setup. It contains the VelocityVault contract and a minimal Foundry config.

## Prereqs
- Install Foundry: https://book.getfoundry.sh/getting-started/installation
- Install dependencies:

```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

## Commands
```bash
# from repo root
cd packages/foundry
forge build
forge test
forge fmt
```

## Deploy
```bash
cd packages/foundry
export ARC_RPC_URL="https://testnet-rpc.arc.network"
export PRIVATE_KEY="0x..."
export AGENT_ADDRESS="0x..."
export BRIDGE_EXECUTOR="0x..." # e.g., LI.FI executor/router on Arc

forge script script/DeployVelocityTreasury.s.sol:DeployVelocityTreasury \
  --rpc-url $ARC_RPC_URL \
  --broadcast
```

### Legacy Vault Deploy (if needed)
```bash
cd packages/foundry
export ARC_RPC_URL="https://testnet-rpc.arc.network"
export PRIVATE_KEY="0x..."
export USDC_ADDRESS="0x..."
export AGENT_ADDRESS="0x..."

forge script script/DeployVelocityVault.s.sol:DeployVelocityVault \
  --rpc-url $ARC_RPC_URL \
  --broadcast
```

## Notes
- Update `foundry.toml` RPCs once Arc testnet chain id/RPC are confirmed.
