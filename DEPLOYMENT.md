# VelocityVault Deployment Summary

## Arc Testnet ✅

**Network:** Arc Testnet  
**Chain ID:** 5042002  
**RPC:** https://rpc.testnet.arc.network  

### Deployed Contracts

| Contract | Address | Tx Hash |
|----------|---------|---------|
| VelocityTreasury | `0x4D2Ba91dcaF71447E111bF53c941907856a87888` | `0x2a3ae2b992e4a314fd0ddc0dbd509a822e943a487004c4c228c2405e98c4bcd3` |
| VelocityVault | `0x9778e49e8898F89b6732BAfE07D37d601b5148F0` | `0x28861e1dae637a8e4c4c3ebdbe1fb7cc4b65e822e1b14771a435cbbb9538d96c` |

### Configuration

**Deployer/Agent:** `0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f`

**VelocityTreasury Constructor Args:**
- `_agent`: `0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f`
- `_bridgeExecutor`: `0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f`

**VelocityVault Constructor Args:**
- `_usdc`: `0x4D2Ba91dcaF71447E111bF53c941907856a87888` (Treasury address used as placeholder)
- `_agent`: `0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f`

---

## Unichain Sepolia ❌ Pending

**Network:** Unichain Sepolia  
**Chain ID:** 1301  
**RPC:** https://sepolia.unichain.org  

**Status:** Not deployed - wallet needs testnet ETH

**Faucet:** https://www.alchemy.com/faucets/unichain-sepolia

---

## VelocityHook ⏸️ Deferred

The Uniswap v4 hook (`VelocityHook.sol`) was not deployed due to API changes in v4-periphery.

**Issue:** `BaseHook.sol` moved from `v4-periphery/src/base/hooks/` to `v4-periphery/src/utils/`

**Status:** Import path fixed, but full v4 integration needs testing with current Uniswap v4 contracts.

---

## Verification

To verify contracts on explorer (when available):

```bash
forge verify-contract \
  --chain-id 5042002 \
  --constructor-args $(cast abi-encode "constructor(address,address)" 0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f 0xe143Ca600F35731BDf9840294f1ab3bd4c71C67f) \
  0x4D2Ba91dcaF71447E111bF53c941907856a87888 \
  src/VelocityTreasury.sol:VelocityTreasury
```

---

## Next Steps

1. [ ] Get Unichain Sepolia testnet ETH
2. [ ] Deploy to Unichain Sepolia
3. [ ] Deploy mock USDC for testing
4. [ ] Fix VelocityHook v4 integration
5. [ ] Deploy hook to Unichain (v4 supported)
6. [ ] Submit to hackathon

---

*Deployed: February 3, 2026*
