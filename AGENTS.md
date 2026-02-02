# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

Scaffold-ETH 2 (SE-2) with **Foundry** for Solidity and **Next.js** for the frontend.

- **packages/foundry**: Solidity contracts (Foundry)
- **packages/nextjs**: React frontend (Next.js App Router, RainbowKit, Wagmi, Viem, TypeScript, Tailwind CSS with DaisyUI)

## Common Commands

```bash
# Development workflow (run each in separate terminal)
yarn chain          # Start local blockchain (Anvil)
yarn start          # Start Next.js frontend at http://localhost:3000

# Code quality
yarn lint           # Lint frontend
yarn format         # Format frontend + contracts

# Building
yarn next:build     # Build frontend
yarn compile        # Compile Solidity contracts (forge build)

yarn vercel:yolo --prod # Deploy frontend
```

## Architecture

### Smart Contract Development (Foundry)

- Contracts: `packages/foundry/src/`
- Tests: `packages/foundry/test/`
- Config: `packages/foundry/foundry.toml`

**Notes:**
- Deployment is manual for now (no default deploy scripts).
- ABIs are not auto-generated; if you need them, export from Foundry or add a script.

### Frontend Contract Interaction

**Correct hook names (use these):**

- `useScaffoldReadContract`
- `useScaffoldWriteContract`

Contract data is read from two files in `packages/nextjs/contracts/`:

- `deployedContracts.ts`: Auto-generated from deployments
- `externalContracts.ts`: Manually added external contracts

#### Reading Contract Data

```typescript
const { data: totalCounter } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "userGreetingCounter",
  args: ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"],
});
```

#### Writing to Contracts

```typescript
const { writeContractAsync, isPending } = useScaffoldWriteContract({
  contractName: "YourContract",
});

await writeContractAsync({
  functionName: "setGreeting",
  args: [newGreeting],
  value: parseEther("0.01"),
});
```
