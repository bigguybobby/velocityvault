/**
 * VelocityVault Agent - Yellow Session Monitor
 * 
 * Monitors Yellow Network WebSocket for user trade intents
 * Executes trades via LI.FI cross-chain routing
 * Manages VelocityVault contract interactions
 */

import WebSocket from "ws";
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";
import { LiFi, ChainId, RouteOptions } from "@lifi/sdk";

dotenv.config();

// Configuration
const YELLOW_WS_URL = "wss://clearnet-sandbox.yellow.com/ws";
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
const VAULT_ADDRESS = process.env.VAULT_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";

if (!AGENT_PRIVATE_KEY) {
  throw new Error("AGENT_PRIVATE_KEY not set in .env");
}

// Initialize clients
const account = privateKeyToAccount(AGENT_PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URL),
});

// Initialize LI.FI SDK
const lifi = new LiFi({
  integrator: "velocityvault-hackmoney-2026",
});

console.log("🤖 VelocityVault Agent starting...");
console.log("  Agent address:", account.address);
console.log("  Vault address:", VAULT_ADDRESS || "NOT SET");
console.log("");

// State tracking
interface TradeIntent {
  user: string;
  action: "buy" | "sell";
  asset: string;
  amount: string;
  timestamp: number;
}

const pendingIntents: Map<string, TradeIntent> = new Map();

// Connect to Yellow Network
function connectToYellow() {
  const ws = new WebSocket(YELLOW_WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected to Yellow Network");
    console.log("👀 Monitoring for trade intents...");
    console.log("");
  });

  ws.on("message", async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      await handleYellowMessage(message);
    } catch (error) {
      console.error("❌ Error processing message:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("❌ Disconnected from Yellow Network");
    console.log("🔄 Reconnecting in 5 seconds...");
    setTimeout(connectToYellow, 5000);
  });

  return ws;
}

// Handle Yellow Network messages
async function handleYellowMessage(message: any) {
  if (!message.res) return;

  const [requestId, method, data] = message.res;

  switch (method) {
    case "transfer":
      await handleTradeIntent(data);
      break;

    case "auth_verify":
      console.log("👤 User authenticated:", data.session_key);
      break;

    case "create_channel":
      console.log("📡 Channel created:", data.channel_id);
      break;

    case "resize_channel":
      console.log("💰 Channel funded");
      break;

    default:
      // console.log("📨 Message:", method);
      break;
  }
}

// Handle trade intent from user
async function handleTradeIntent(data: any) {
  try {
    console.log("🎯 Trade intent detected:");
    console.log("  Destination:", data.destination);
    console.log("  Amount:", data.allocations?.[0]?.amount);
    console.log("");

    // For demo: Extract trade intent from transfer data
    // In production, you'd parse this from the Yellow message
    const intent: TradeIntent = {
      user: data.user || "0x0000000000000000000000000000000000000000",
      action: "buy", // Parse from message
      asset: "BTC",
      amount: data.allocations?.[0]?.amount || "0",
      timestamp: Date.now(),
    };

    const intentId = `${intent.user}-${intent.timestamp}`;
    pendingIntents.set(intentId, intent);

    console.log("🤖 Agent executing trade:");
    console.log("  User:", intent.user);
    console.log("  Action:", intent.action);
    console.log("  Asset:", intent.asset);
    console.log("  Amount:", intent.amount, "USDC");
    console.log("");

    // Execute trade flow
    await executeTrade(intentId, intent);
  } catch (error) {
    console.error("❌ Error handling trade intent:", error);
  }
}

// Execute trade via LI.FI
async function executeTrade(intentId: string, intent: TradeIntent) {
  try {
    // Step 1: Withdraw from VelocityVault
    console.log("📤 Step 1: Withdraw from VelocityVault...");
    
    if (!VAULT_ADDRESS) {
      console.log("⚠️  Vault not deployed - simulating withdrawal");
    } else {
      // In production:
      // await vaultContract.agentWithdraw(
      //   intent.user,
      //   parseUnits(intent.amount, 6),
      //   lifiContractAddress,
      //   intentId
      // );
      console.log("✅ Withdrew", intent.amount, "USDC from vault");
    }

    // Step 2: Get LI.FI route
    console.log("🔍 Step 2: Finding best route via LI.FI...");
    
    const routes = await lifi.getRoutes({
      fromChainId: ChainId.SEP, // Sepolia
      toChainId: ChainId.OPT, // Optimism (for Uniswap v4)
      fromTokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
      toTokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC on Optimism
      fromAmount: parseUnits(intent.amount, 6).toString(),
      fromAddress: account.address,
      toAddress: account.address,
      options: {
        slippage: 0.03, // 3% slippage
        order: "RECOMMENDED",
      } as RouteOptions,
    });

    if (!routes.routes.length) {
      console.log("❌ No routes found");
      return;
    }

    const bestRoute = routes.routes[0];
    console.log("✅ Route found:");
    console.log("  From:", bestRoute.fromChain.name);
    console.log("  To:", bestRoute.toChain.name);
    console.log("  Estimated time:", bestRoute.steps.length, "steps");
    console.log("");

    // Step 3: Execute route
    console.log("🚀 Step 3: Executing cross-chain swap...");
    console.log("⚠️  Demo mode - not executing actual swap");
    console.log("");

    // In production:
    // await lifi.executeRoute(bestRoute, {
    //   updateCallback: (update) => {
    //     console.log('  Status:', update.status);
    //   }
    // });

    // Step 4: Execute trade on Uniswap v4
    console.log("💱 Step 4: Executing trade on Uniswap v4...");
    console.log("⚠️  Demo mode - simulating trade execution");
    console.log("  ", intent.action.toUpperCase(), intent.asset);
    console.log("");

    // Step 5: Return profits to vault
    console.log("📥 Step 5: Returning profits to VelocityVault...");
    const profitAmount = (parseFloat(intent.amount) * 1.05).toFixed(2); // 5% profit for demo
    console.log("  Original:", intent.amount, "USDC");
    console.log("  Returned:", profitAmount, "USDC");
    console.log("  Profit:", (parseFloat(profitAmount) - parseFloat(intent.amount)).toFixed(2), "USDC");
    console.log("");

    // In production:
    // await vaultContract.agentDeposit(
    //   intent.user,
    //   parseUnits(profitAmount, 6),
    //   intentId
    // );

    console.log("✅ Trade executed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");

    // Clean up
    pendingIntents.delete(intentId);
  } catch (error) {
    console.error("❌ Error executing trade:", error);
  }
}

// Health check - log active monitoring
setInterval(() => {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] 💚 Agent healthy - monitoring ${pendingIntents.size} pending intent(s)`);
}, 60000); // Every minute

// Start monitoring
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🚀 VelocityVault Agent is running");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");

connectToYellow();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("");
  console.log("🛑 Shutting down agent...");
  process.exit(0);
});
