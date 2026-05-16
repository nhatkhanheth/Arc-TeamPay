import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { ethers } from "ethers";
import {
  getProvider,
  switchToArcTestnet,
  isOnArcTestnet,
  getUsdcBalance,
  shortenAddress,
} from "../utils/arc";

interface WalletState {
  address: string | null;
  shortAddress: string;
  usdcBalance: string;
  isConnected: boolean;
  isOnArc: boolean;
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export type WalletContextType = WalletState & WalletActions;

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    shortAddress: "",
    usdcBalance: "0.00",
    isConnected: false,
    isOnArc: false,
    isLoading: false,
    error: null,
  });

  const refreshBalance = useCallback(async () => {
    if (!state.address) return;
    try {
      const balance = await getUsdcBalance(state.address);
      setState((prev) => ({
        ...prev,
        usdcBalance: parseFloat(balance).toFixed(2),
      }));
    } catch {
      // Silent — balance fetch failure shouldn't block UI
    }
  }, [state.address]);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const provider = await getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0] as string;
      const onArc = await isOnArcTestnet();
      let balance = "0.00";
      if (onArc) {
        try {
          const raw = await getUsdcBalance(address);
          balance = parseFloat(raw).toFixed(2);
        } catch { /* no-op */ }
      }
      setState({
        address,
        shortAddress: shortenAddress(address),
        usdcBalance: balance,
        isConnected: true,
        isOnArc: onArc,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (err as Error).message ?? "Failed to connect wallet.",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      shortAddress: "",
      usdcBalance: "0.00",
      isConnected: false,
      isOnArc: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await switchToArcTestnet();
      setState((prev) => ({ ...prev, isOnArc: true, isLoading: false }));
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (err as Error).message ?? "Failed to switch network.",
      }));
    }
  }, []);

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else {
        setState((prev) => ({
          ...prev,
          address: accounts[0],
          shortAddress: shortenAddress(accounts[0]),
        }));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          await connect();
        }
      } catch { /* no-op */ }
    };
    autoConnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, switchNetwork, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
