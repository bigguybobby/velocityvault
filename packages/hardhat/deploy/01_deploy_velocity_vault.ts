import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploy VelocityVault contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployVelocityVault: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // For local testing, use a mock USDC address
  // For Arc testnet, this should be the actual USDC contract address
  const usdcAddress = process.env.USDC_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC
  
  // Agent address - for demo, use deployer. In production, use dedicated agent wallet
  const agentAddress = process.env.AGENT_ADDRESS || deployer;

  console.log("\n🚀 Deploying VelocityVault...");
  console.log("  USDC:", usdcAddress);
  console.log("  Agent:", agentAddress);
  console.log("  Deployer:", deployer);

  await deploy("VelocityVault", {
    from: deployer,
    args: [usdcAddress, agentAddress],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it
  const velocityVault = await hre.ethers.getContract<Contract>("VelocityVault", deployer);
  console.log("\n✅ VelocityVault deployed at:", await velocityVault.getAddress());
  
  // Log initial state
  const agent = await velocityVault.agent();
  const usdc = await velocityVault.usdc();
  const owner = await velocityVault.owner();
  
  console.log("\n📋 Contract Info:");
  console.log("  Agent:", agent);
  console.log("  USDC:", usdc);
  console.log("  Owner:", owner);
  console.log("");
};

export default deployVelocityVault;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags VelocityVault
deployVelocityVault.tags = ["VelocityVault"];
