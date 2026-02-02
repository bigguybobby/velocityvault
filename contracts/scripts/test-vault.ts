import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🧪 Testing VelocityVault...\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "../deployments/arc-testnet.json");
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Deployment file not found. Run deploy-vault.ts first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const { vaultAddress, usdcAddress, agentAddress } = deployment;

  console.log("Configuration:");
  console.log("  Vault:", vaultAddress);
  console.log("  USDC:", usdcAddress);
  console.log("  Agent:", agentAddress);
  console.log("");

  // Get signers
  const [user, agent] = await ethers.getSigners();
  console.log("Test accounts:");
  console.log("  User:", user.address);
  console.log("  Agent:", agent.address);
  console.log("");

  // Connect to contracts
  const vault = await ethers.getContractAt("VelocityVault", vaultAddress);
  const usdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    usdcAddress
  );

  // Check initial balances
  console.log("📊 Initial State:");
  const userUsdcBalance = await usdc.balanceOf(user.address);
  const userVaultBalance = await vault.balanceOf(user.address);
  const vaultTotalDeposits = await vault.getTotalDeposits();
  
  console.log(`  User USDC balance: ${ethers.formatUnits(userUsdcBalance, 6)} USDC`);
  console.log(`  User vault balance: ${ethers.formatUnits(userVaultBalance, 6)} USDC`);
  console.log(`  Vault total deposits: ${ethers.formatUnits(vaultTotalDeposits, 6)} USDC`);
  console.log("");

  // Test 1: Deposit
  console.log("Test 1: User Deposit");
  const depositAmount = ethers.parseUnits("10", 6); // 10 USDC

  console.log("  Approving USDC...");
  const approveTx = await usdc.connect(user).approve(vaultAddress, depositAmount);
  await approveTx.wait();
  console.log("  ✅ Approved");

  console.log("  Depositing 10 USDC...");
  const depositTx = await vault.connect(user).deposit(depositAmount);
  await depositTx.wait();
  console.log("  ✅ Deposited");

  const newVaultBalance = await vault.balanceOf(user.address);
  console.log(`  New vault balance: ${ethers.formatUnits(newVaultBalance, 6)} USDC`);
  console.log("");

  // Test 2: Agent Withdraw
  console.log("Test 2: Agent Withdraw");
  const withdrawAmount = ethers.parseUnits("5", 6); // 5 USDC
  const destinationAddress = "0x0000000000000000000000000000000000000001"; // Mock LI.FI
  const executionId = ethers.id("test-execution-1");

  console.log("  Agent withdrawing 5 USDC for execution...");
  const agentWithdrawTx = await vault
    .connect(agent)
    .agentWithdraw(user.address, withdrawAmount, destinationAddress, executionId);
  await agentWithdrawTx.wait();
  console.log("  ✅ Agent withdrew");

  const afterAgentWithdraw = await vault.balanceOf(user.address);
  console.log(`  User balance after agent withdraw: ${ethers.formatUnits(afterAgentWithdraw, 6)} USDC`);
  console.log("");

  // Test 3: Agent Deposit (return profits)
  console.log("Test 3: Agent Deposit (return profits)");
  const returnAmount = ethers.parseUnits("6", 6); // 6 USDC (5 principal + 1 profit)

  console.log("  Agent approving USDC...");
  const agentApproveTx = await usdc.connect(agent).approve(vaultAddress, returnAmount);
  await agentApproveTx.wait();
  console.log("  ✅ Approved");

  console.log("  Agent depositing 6 USDC (5 principal + 1 profit)...");
  const agentDepositTx = await vault
    .connect(agent)
    .agentDeposit(user.address, returnAmount, executionId);
  await agentDepositTx.wait();
  console.log("  ✅ Agent deposited");

  const afterAgentDeposit = await vault.balanceOf(user.address);
  console.log(`  User balance after profit return: ${ethers.formatUnits(afterAgentDeposit, 6)} USDC`);
  console.log("");

  // Test 4: User Withdraw
  console.log("Test 4: User Withdraw");
  const userWithdrawAmount = ethers.parseUnits("5", 6); // 5 USDC

  console.log("  User withdrawing 5 USDC...");
  const userWithdrawTx = await vault.connect(user).withdraw(userWithdrawAmount);
  await userWithdrawTx.wait();
  console.log("  ✅ Withdrawn");

  const finalBalance = await vault.balanceOf(user.address);
  console.log(`  Final vault balance: ${ethers.formatUnits(finalBalance, 6)} USDC`);
  console.log("");

  // Final state
  console.log("📊 Final State:");
  const finalUserUsdc = await usdc.balanceOf(user.address);
  const finalVaultTotal = await vault.getTotalDeposits();
  
  console.log(`  User USDC balance: ${ethers.formatUnits(finalUserUsdc, 6)} USDC`);
  console.log(`  User vault balance: ${ethers.formatUnits(finalBalance, 6)} USDC`);
  console.log(`  Vault total deposits: ${ethers.formatUnits(finalVaultTotal, 6)} USDC`);
  console.log("");

  console.log("✅ All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
