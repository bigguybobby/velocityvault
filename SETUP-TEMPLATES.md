# Setup Templates (Foundry + Next.js)

This repo uses Foundry for contracts and Scaffold-ETH-2 for the frontend.

## Quick Start

```bash
yarn install
yarn chain

yarn start
```

## Contracts (Foundry)

```bash
cd packages/foundry
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test
```

## Frontend (Next.js)

```bash
cd packages/nextjs
yarn dev
```
