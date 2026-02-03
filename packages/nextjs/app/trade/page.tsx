"use client";

import { useState, useEffect } from "react";
import { useWalletClient, useAccount } from "wagmi";
import { useYellowContext } from "~~/components/velocityvault/YellowProvider";
import type { NextPage } from "next";

const TradePage: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { session, connect, trade, isLoading, error, isReady } = useYellowContext();

  const [tradeAmount, setTradeAmount] = useState("10");
  const [tradeCount, setTradeCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!backendUrl || !address) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch(`${backendUrl}/logs/${address}`);
        const json = await res.json();
        if (json?.success) {
          setActivity(json.data?.logs || []);
        }
      } catch (err) {
        console.error("Failed to load activity", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, [backendUrl, address]);

  const handleConnect = async () => {
    if (!walletClient) return;
    await connect(walletClient);
  };

  const handleTrade = async (action: "buy" | "sell") => {
    await trade(action, "BTC", tradeAmount);
    setTradeCount(prev => prev + 1);

    if (backendUrl && address) {
      fetch(`${backendUrl}/intent/update-pnl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          pnl: "0",
          pnlPercent: 0,
          trade: {
            pair: "BTC/USDC",
            side: action,
            amount: tradeAmount,
            price: "0",
          },
        }),
      }).catch(err => console.error("Failed to log trade", err));
    }
  };

  const handleAgent = async (action: "start" | "stop") => {
    if (!backendUrl || !address) return;
    try {
      const res = await fetch(`${backendUrl}/intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          action,
          strategy: "momentum",
          params: {},
        }),
      });
      const json = await res.json();
      if (json?.success) {
        setAgentRunning(action === "start");
      }
    } catch (err) {
      console.error("Failed to update agent", err);
    }
  };

  if (!mounted) return null;

  if (!isReady) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">⚡ VelocityVault</span>
            <span className="block text-2xl mt-2">Gasless Trading</span>
          </h1>
          <p className="text-center text-lg">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  if (!session.isConnected) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 max-w-2xl w-full">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="card-title text-3xl mb-4">Welcome to VelocityVault</h2>
              <p className="text-lg mb-6">
                Experience gasless trading powered by Yellow Network.
                <br />
                Trade instantly without waiting for blockchain confirmations.
              </p>

              <div className="grid grid-cols-3 gap-4 w-full mb-6">
                <div className="card bg-base-200">
                  <div className="card-body items-center p-4">
                    <span className="text-3xl">🚀</span>
                    <span className="text-sm">Instant Execution</span>
                  </div>
                </div>
                <div className="card bg-base-200">
                  <div className="card-body items-center p-4">
                    <span className="text-3xl">💨</span>
                    <span className="text-sm">Zero Gas Fees</span>
                  </div>
                </div>
                <div className="card bg-base-200">
                  <div className="card-body items-center p-4">
                    <span className="text-3xl">🔒</span>
                    <span className="text-sm">Secure on Arc</span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Connect to Yellow Network"
                )}
              </button>

              {error && (
                <div className="alert alert-error mt-4">
                  <span>{error}</span>
                </div>
              )}

              <div className="text-sm text-base-content/60 mt-4">
                Network: Sepolia Testnet (Yellow SDK)
                <br />
                Vault: Arc Testnet
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-6xl w-full">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">⚡ VelocityVault</span>
          <span className="block text-2xl mt-2">Gasless Trading Interface</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trading Card */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Balance Section */}
                <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg p-6 mb-6">
                  <div className="text-sm opacity-90 mb-2">Your Balance</div>
                  <div className="text-4xl font-bold mb-2">{session.balance} USDC</div>
                  {session.channelId && (
                    <div className="badge badge-success gap-2">
                      <div className="w-2 h-2 bg-success-content rounded-full animate-pulse"></div>
                      Channel Active
                    </div>
                  )}
                </div>

                {/* Trading Controls */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Trade Amount (USDC)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    className="input input-bordered"
                    value={tradeAmount}
                    onChange={e => setTradeAmount(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => handleTrade("buy")}
                    disabled={isLoading || !session.channelId}
                  >
                    <span className="text-2xl">📈</span>
                    Buy BTC
                  </button>
                  <button
                    className="btn btn-error btn-lg"
                    onClick={() => handleTrade("sell")}
                    disabled={isLoading || !session.channelId}
                  >
                    <span className="text-2xl">📉</span>
                    Sell BTC
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleTrade("buy")}
                    disabled={isLoading}
                  >
                    Quick Buy
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleTrade("sell")}
                    disabled={isLoading}
                  >
                    Quick Sell
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      handleTrade("sell");
                      setTimeout(() => handleTrade("buy"), 100);
                    }}
                    disabled={isLoading}
                  >
                    Rebalance
                  </button>
                </div>

                {/* Agent Control */}
                <div className="mt-6 bg-base-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Agent Status</div>
                      <div className="text-sm text-base-content/70">
                        {agentRunning ? "Running" : "Stopped"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAgent("start")}
                        disabled={isLoading || agentRunning}
                      >
                        Start Agent
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleAgent("stop")}
                        disabled={isLoading || !agentRunning}
                      >
                        Stop Agent
                      </button>
                    </div>
                  </div>
                </div>

                {/* Demo Stats */}
                <div className="divider"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-value text-primary">{tradeCount}</div>
                    <div className="stat-title">Trades</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-value text-success">$0</div>
                    <div className="stat-title">Gas Paid</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-value">⚡</div>
                    <div className="stat-title">Instant</div>
                  </div>
                </div>

                {/* Status Messages */}
                {isLoading && (
                  <div className="alert">
                    <span className="loading loading-spinner"></span>
                    <span>Processing transaction...</span>
                  </div>
                )}

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                {!session.channelId && !isLoading && (
                  <div className="alert alert-warning">
                    <span>Creating Yellow channel... Please wait.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Panel */}
            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body">
                <h3 className="card-title">How It Works</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Session-Based:</strong> You signed once - all trades are gasless
                  </li>
                  <li>
                    <strong>Off-Chain Execution:</strong> Trades happen instantly via Yellow state channels
                  </li>
                  <li>
                    <strong>AI Agent:</strong> Monitors your intents and executes via LI.FI + Uniswap
                  </li>
                  <li>
                    <strong>On-Chain Settlement:</strong> Final balances settle when you close session
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h3 className="card-title">Recent Activity</h3>
                <div className="space-y-2">
                  {activity.length === 0 ? (
                    <div className="text-center py-6 text-base-content/60">
                      No activity yet. Start the agent or trigger a trade.
                    </div>
                  ) : (
                    activity.slice(0, 6).map((log: any) => (
                      <div key={log.id || `${log.action}-${log.created_at}`} className="alert alert-info">
                        <span>⚡</span>
                        <span className="text-sm">
                          {log.action} {log.pair ? `(${log.pair})` : ""}
                        </span>
                        <span className="text-xs">
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString() : "now"}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Session Key:</span>
                    <span className="font-mono text-xs">{session.sessionKey?.slice(0, 10)}...</span>
                  </div>
                  {session.channelId && (
                    <div className="flex justify-between text-sm">
                      <span>Channel ID:</span>
                      <span className="font-mono text-xs">{session.channelId.slice(0, 10)}...</span>
                    </div>
                  )}
                </div>

                <div className="divider"></div>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold">Live Action Log</div>
                  <div>Bridging via LI.FI → Executing on Uniswap → Hedging on Sui</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage;
