# Unichain Sepolia Faucets

## Wallet to Fund
`0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f`

## Available Faucets

### 1. Superchain Faucet (Recommended)
**URL:** https://app.optimism.io/faucet
**Amount:** 0.05 ETH
**Cooldown:** 24 hours
**Note:** Verify onchain identity for more tokens

### 2. QuickNode Faucet
**URL:** https://faucet.quicknode.com/unichain/sepolia
**Amount:** Variable
**Cooldown:** 12 hours

### 3. thirdweb Faucet
**URL:** https://thirdweb.com/unichain-sepolia-testnet
**Amount:** Variable
**Cooldown:** 24 hours

### 4. Circle Faucet (USDC only)
**URL:** https://faucet.circle.com/
**Amount:** USDC only (not ETH)
**Cooldown:** 1 hour

---

## After Getting ETH

Run this to deploy:

```bash
cd /Users/bobby/projects/velocityvault/packages/foundry

# Deploy Treasury
forge create --broadcast src/VelocityTreasury.sol:VelocityTreasury \
  --rpc-url https://sepolia.unichain.org \
  --private-key 0xc28099d496669babfb0ceb9b25190cbb141a4c6bc769de7c9b98a1e01305776c \
  --constructor-args 0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f 0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f

# Deploy Vault (use Treasury address from above)
forge create --broadcast src/VelocityVault.sol:VelocityVault \
  --rpc-url https://sepolia.unichain.org \
  --private-key 0xc28099d496669babfb0ceb9b25190cbb141a4c6bc769de7c9b98a1e01305776c \
  --constructor-args <TREASURY_ADDRESS> 0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f
```

---

*Or just tell me "deploy unichain" after getting faucet ETH and I'll handle it.*
