import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying VelocityVault to Arc Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Get addresses from environment
  const usdcAddress = process.env.USDC_ADDRESS;
  const agentAddress = process.env.AGENT_ADDRESS || deployer.address;

  if (!usdcAddress) {
    throw new Error("USDC_ADDRESS not set in .env");
  }

  console.log("Configuration:");
  console.log("  USDC Address:", usdcAddress);
  console.log("  Agent Address:", agentAddress);
  console.log("");

  // Deploy VelocityVault
  console.log("Deploying VelocityVault...");
  const VelocityVault = await ethers.getContractFactory("VelocityVault");
  const vault = await VelocityVault.deploy(usdcAddress, agentAddress);

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ VelocityVault deployed to:", vaultAddress);
  console.log("");

  // Verify deployment
  console.log("Verifying deployment...");
  const deployedAgent = await vault.agent();
  const deployedUsdc = await vault.usdc();
  const deployedOwner = await vault.owner();

  console.log("  Agent:", deployedAgent);
  console.log("  USDC:", deployedUsdc);
  console.log("  Owner:", deployedOwner);
  console.log("");

  // Save deployment info
  const deployment = {
    network: "arcTestnet",
    vaultAddress,
    usdcAddress,
    agentAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "arc-testnet.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));

  console.log("📝 Deployment info saved to:", deploymentFile);
  console.log("");

  // Export ABI for frontend
  const artifactsDir = path.join(__dirname, "../artifacts/contracts/VelocityVault.sol");
  const artifactPath = path.join(artifactsDir, "VelocityVault.json");
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(deploymentsDir, "VelocityVault.abi.json");
    fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
    console.log("📝 ABI exported to:", abiFile);
  }

  console.log("");
  console.log("🎉 Deployment complete!");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Verify contract on explorer:");
  console.log(`     npx hardhat verify --network arcTestnet ${vaultAddress} ${usdcAddress} ${agentAddress}`);
  console.log("  2. Fund vault with testnet USDC");
  console.log("  3. Test deposit/withdraw with scripts/test-vault.ts");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
