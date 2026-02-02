import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http, type WalletClient } from "viem";
import { sepolia } from "viem/chains";
import {
  NitroliteClient,
  WalletStateSigner,
  createAuthRequestMessage,
  createEIP712AuthMessageSigner,
  createAuthVerifyMessageFromChallenge,
  createECDSAMessageSigner,
  createCreateChannelMessage,
  createResizeChannelMessage,
  createTransferMessage,
  createGetLedgerBalancesMessage,
} from "@erc7824/nitrolite";

const YELLOW_WS_URL = "wss://clearnet-sandbox.yellow.com/ws";
const CUSTODY_ADDRESS = "0x019B65A265EB3363822f2752141b3dF16131b262";
const ADJUDICATOR_ADDRESS = "0x7c7ccbc98469190849BCC6c926307794fDfB11F2";

export interface YellowSession {
  sessionKey: string;
  channelId: string | null;
  balance: string;
  isConnected: boolean;
}

export function useYellow() {
  const { address, isConnected: walletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [session, setSession] = useState<YellowSession>({
    sessionKey: "",
    channelId: null,
    balance: "0",
    isConnected: false,
  });

  const [client, setClient] = useState<NitroliteClient | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket
  useEffect(() => {
    if (!session.isConnected || !address) return;

    const websocket = new WebSocket(YELLOW_WS_URL);

    websocket.onopen = () => {
      console.log("✅ Connected to Yellow Network");
    };

    websocket.onmessage = event => {
      try {
        const response = JSON.parse(event.data);
        handleWebSocketMessage(response);
      } catch (err) {
        console.error("WS message error:", err);
      }
    };

    websocket.onerror = error => {
      console.error("WebSocket error:", error);
      setError("Connection to Yellow Network failed");
    };

    websocket.onclose = () => {
      console.log("❌ Disconnected from Yellow Network");
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [session.isConnected, address]);

  const handleWebSocketMessage = useCallback((response: any) => {
    console.log("📨 WS message:", response);

    if (response.error) {
      setError(response.error.message || "Unknown error");
      setIsLoading(false);
      return;
    }

    if (!response.res) return;

    const [_, method, data] = response.res;

    switch (method) {
      case "auth_verify":
        console.log("✅ Authenticated with Yellow");
        setSession(prev => ({
          ...prev,
          sessionKey: data.session_key,
        }));
        setIsLoading(false);
        break;

      case "channels":
        const openChannel = data.channels?.find((c: any) => c.status === "open");
        if (openChannel) {
          setSession(prev => ({
            ...prev,
            channelId: openChannel.channel_id,
            balance: openChannel.amount || "0",
          }));
        }
        setIsLoading(false);
        break;

      case "create_channel":
        setSession(prev => ({
          ...prev,
          channelId: data.channel_id,
        }));
        console.log("✅ Channel created:", data.channel_id);
        setIsLoading(false);
        break;

      case "resize_channel":
        console.log("✅ Channel funded");
        setIsLoading(false);
        break;

      case "transfer":
        console.log("✅ Transfer complete");
        setIsLoading(false);
        break;
    }
  }, []);

  const connect = useCallback(
    async (wc: WalletClient) => {
      if (!wc.account?.address) {
        setError("No wallet account found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create public client
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });

        // Initialize Nitrolite client
        const nitroliteClient = new NitroliteClient({
          publicClient,
          walletClient: wc,
          stateSigner: new WalletStateSigner(wc),
          addresses: {
            custody: CUSTODY_ADDRESS,
            adjudicator: ADJUDICATOR_ADDRESS,
          },
          chainId: sepolia.id,
          challengeDuration: 3600n,
        });

        setClient(nitroliteClient);

        // Generate session keypair
        const sessionPrivateKey = ("0x" +
          Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")) as `0x${string}`;

        // Create auth request
        const authParams = {
          session_key: wc.account.address,
          allowances: [{ asset: "ytest.usd", amount: "1000000000" }],
          expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600),
          scope: "velocityvault.app",
        };

        const authRequestMsg = await createAuthRequestMessage({
          address: wc.account.address,
          application: "VelocityVault",
          ...authParams,
        });

        // Wait for WS to be ready
        const websocket = new WebSocket(YELLOW_WS_URL);
        await new Promise(resolve => {
          websocket.onopen = resolve;
        });

        // Send auth request
        websocket.send(authRequestMsg);

        setSession(prev => ({
          ...prev,
          isConnected: true,
        }));

        console.log("🎉 Yellow session initiated");
      } catch (err: any) {
        console.error("Connection error:", err);
        setError(err.message || "Failed to connect to Yellow Network");
        setIsLoading(false);
      }
    },
    [],
  );

  const trade = useCallback(
    async (action: "buy" | "sell", asset: string, amount: string) => {
      if (!ws || !session.sessionKey) {
        setError("Not connected to Yellow Network");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create session signer
        const sessionSigner = createECDSAMessageSigner(("0x" + "1".repeat(64)) as `0x${string}`);

        // Create transfer message (trade intent)
        const transferMsg = await createTransferMessage(
          sessionSigner,
          {
            destination: "0x0000000000000000000000000000000000000001", // Placeholder
            allocations: [
              {
                asset: "ytest.usd",
                amount: (parseFloat(amount) * 1e6).toString(),
              },
            ],
          },
          Date.now(),
        );

        ws.send(transferMsg);

        // Emit event for agent monitoring
        console.log(`🤖 Trade intent: ${action} ${amount} ${asset}`);
      } catch (err: any) {
        console.error("Trade error:", err);
        setError(err.message || "Trade failed");
        setIsLoading(false);
      }
    },
    [ws, session.sessionKey],
  );

  return {
    session,
    client,
    connect,
    trade,
    isLoading,
    error,
    isReady: walletConnected && !!walletClient,
  };
}
