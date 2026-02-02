"use client";

import { ReactNode, createContext, useContext } from "react";
import { useYellow } from "~~/hooks/velocityvault/useYellow";
import type { YellowSession } from "~~/hooks/velocityvault/useYellow";
import type { NitroliteClient } from "@erc7824/nitrolite";
import type { WalletClient } from "viem";

interface YellowContextType {
  session: YellowSession;
  client: NitroliteClient | null;
  connect: (walletClient: WalletClient) => Promise<void>;
  trade: (action: "buy" | "sell", asset: string, amount: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

const YellowContext = createContext<YellowContextType | undefined>(undefined);

export function YellowProvider({ children }: { children: ReactNode }) {
  const yellow = useYellow();

  return <YellowContext.Provider value={yellow}>{children}</YellowContext.Provider>;
}

export function useYellowContext() {
  const context = useContext(YellowContext);
  if (!context) {
    throw new Error("useYellowContext must be used within YellowProvider");
  }
  return context;
}
