# VelocityVault - Scaffold-ETH-2 Rebuild Plan

**Repo:** https://github.com/bigguybobby/velocityvault  
**Status:** Migration complete (Foundry + Next.js)

## Why Scaffold-ETH-2?

- ✅ Foundry (fast compiles, Solidity tests)
- ✅ Next.js + App Router
- ✅ wagmi + RainbowKit (battle-tested)
- ✅ Beautiful UI components
- ✅ TypeScript strict mode

## Migration Summary (Done)

1. **Template base** added on `scaffold-eth-2-migration`
2. **VelocityVault contract** moved to `packages/foundry/src/`
3. **Yellow SDK** integrated in frontend
4. **Gasless trading UI** built
5. **Arc config** added to frontend
6. **LI.FI agent** wired

## Next Improvements

- Confirm Arc testnet chain id + RPC
- Ensure Yellow session flow works end-to-end
- Add ENS integration hooks
- Add Uniswap v4 hook demo
