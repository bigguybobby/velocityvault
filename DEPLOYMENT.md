# Deployment Guide (Foundry)

> Kacper will handle deployments. This is a quick reference if needed.

## Prereqs
- Foundry installed
- Arc testnet RPC + chain id confirmed
- USDC address on Arc testnet

## Install deps
```bash
cd packages/foundry
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

## Compile
```bash
forge build
```

## Deploy (example)
```bash
export ARC_RPC_URL="https://testnet-rpc.arc.network"
export PRIVATE_KEY="0x..."
export USDC_ADDRESS="0x..."
export AGENT_ADDRESS="0x..."

forge script script/DeployVelocityVault.s.sol:DeployVelocityVault \
  --rpc-url $ARC_RPC_URL \
  --broadcast
```

## Verify
Use Arc explorer: https://testnet.arcscan.app
