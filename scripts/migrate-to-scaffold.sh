#!/bin/bash

# VelocityVault - Scaffold-ETH-2 Migration Script
# Run from workspace root: ./velocityvault/scripts/migrate-to-scaffold.sh

set -e

echo "🚀 VelocityVault - Migrating to Scaffold-ETH-2"
echo ""

# Save current work
echo "📦 Backing up current code..."
mkdir -p .backup
cp -r contracts .backup/
cp -r frontend .backup/
cp -r docs .backup/
echo "✅ Backup saved to .backup/"
echo ""

# Create new branch
echo "🌿 Creating migration branch..."
git checkout -b scaffold-eth-2-migration
echo ""

# Clone Scaffold-ETH-2
echo "📥 Cloning Scaffold-ETH-2..."
cd ..
git clone --depth=1 https://github.com/scaffold-eth/scaffold-eth-2.git velocityvault-scaffold
echo ""

# Copy template files
echo "📋 Copying Scaffold-ETH-2 template..."
cd velocityvault-scaffold
rm -rf .git
cp -r * ../velocityvault/
cd ../velocityvault
rm -rf ../velocityvault-scaffold
echo ""

# Restore our code
echo "🔄 Restoring VelocityVault contract..."
cp .backup/contracts/contracts/VelocityVault.sol packages/foundry/contracts/
echo ""

# Restore docs
echo "📚 Restoring documentation..."
cp .backup/docs/* docs/ 2>/dev/null || mkdir -p docs && cp .backup/docs/* docs/
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
yarn install
echo ""

# Commit
echo "💾 Committing changes..."
git add -A
git commit -m "feat: migrate to Scaffold-ETH-2 template

- Add Foundry for faster contract development
- Add Next.js + wagmi + RainbowKit for frontend
- Preserve VelocityVault.sol contract
- Preserve documentation and research

Base template: https://github.com/scaffold-eth/scaffold-eth-2"
echo ""

# Push
echo "🚀 Pushing to GitHub..."
git push -u origin scaffold-eth-2-migration
echo ""

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. cd packages/foundry"
echo "  2. forge build"
echo "  3. cd ../nextjs"
echo "  4. yarn dev"
echo ""
echo "GitHub: https://github.com/bigguybobby/velocityvault/tree/scaffold-eth-2-migration"
