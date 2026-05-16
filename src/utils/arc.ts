import { ethers } from "ethers";
import {
  ARC_TESTNET,
  USDC_CONTRACT_ADDRESS,
  USDC_DECIMALS,
  ERC20_ABI,
  MIN_GAS_GWEI,
} from "./constants";

// ─── Wallet / Provider ───────────────────────────────────────────────────────

export async function getProvider(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error(
      "No wallet found. Please install MetaMask or another EVM-compatible wallet."
    );
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = await getProvider();
  return provider.getSigner();
}

// ─── Network ─────────────────────────────────────────────────────────────────

export async function switchToArcTestnet(): Promise<void> {
  if (!window.ethereum) throw new Error("No wallet detected.");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.chainIdHex }],
    });
  } catch (switchError: unknown) {
    // Chain not added yet — add it
    if ((switchError as { code?: number })?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ARC_TESTNET.chainIdHex,
            chainName: ARC_TESTNET.name,
            rpcUrls: [ARC_TESTNET.rpcUrl],
            blockExplorerUrls: [ARC_TESTNET.blockExplorer],
            nativeCurrency: ARC_TESTNET.nativeCurrency,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export async function isOnArcTestnet(): Promise<boolean> {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  return Number(network.chainId) === ARC_TESTNET.chainId;
}

// ─── USDC Balance ─────────────────────────────────────────────────────────────

export async function getUsdcBalance(address: string): Promise<string> {
  const provider = await getProvider();
  const usdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);
  const raw: bigint = await usdc.balanceOf(address);
  // Format with 6 decimals (ERC-20 interface)
  return ethers.formatUnits(raw, USDC_DECIMALS);
}

// ─── Send USDC ────────────────────────────────────────────────────────────────

export interface SendUsdcParams {
  to: string;
  amount: string; // human-readable, e.g. "10.50"
  memo?: string;
}

export interface TxResult {
  txHash: string;
  explorerUrl: string;
}

export async function sendUsdc(params: SendUsdcParams): Promise<TxResult> {
  const { to, amount, memo } = params;

  if (!ethers.isAddress(to)) throw new Error("Invalid recipient address.");

  const signer = await getSigner();
  const usdc = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);

  // Convert to 6-decimal units
  const amountParsed = ethers.parseUnits(amount, USDC_DECIMALS);

  // Per Arc docs: set maxFeePerGas to at least 20 Gwei
  const maxFeePerGas = ethers.parseUnits(MIN_GAS_GWEI, "gwei");
  const maxPriorityFeePerGas = ethers.parseUnits("1", "gwei");

  // Build transaction overrides
  const overrides: ethers.Overrides = { maxFeePerGas, maxPriorityFeePerGas };

  // Encode memo as calldata if provided (off-chain label via contract memo pattern)
  // We use a simple ERC-20 transfer; memo is stored in the tx input if supported
  void memo; // memo is stored in UI / off-chain only for now

  const tx = await usdc.transfer(to, amountParsed, overrides);
  await tx.wait();

  return {
    txHash: tx.hash,
    explorerUrl: `${ARC_TESTNET.blockExplorer}/tx/${tx.hash}`,
  };
}

// ─── Address Formatting ───────────────────────────────────────────────────────

export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ─── Amount Validation ────────────────────────────────────────────────────────

export function isValidAmount(value: string): boolean {
  if (!value || isNaN(Number(value))) return false;
  const n = parseFloat(value);
  return n > 0 && n <= 999_999;
}
