# Foundry Contracts

This package replaces the old Hardhat setup. It contains the VelocityVault contract and a minimal Foundry config.

## Prereqs
- Install Foundry: https://book.getfoundry.sh/getting-started/installation
- Install OpenZeppelin contracts:

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

## Commands
```bash
# from repo root
cd packages/foundry
forge build
forge test
forge fmt
```

## Notes
- Arc testnet deployment is handled manually (no deploy scripts included by default).
- Update `foundry.toml` RPCs once Arc testnet chain id/RPC are confirmed.
