// Arc Testnet network configuration
// Source: https://docs.arc.io/arc/references/rpc-endpoints

export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: "0x4CFF12",
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  wsUrl: "wss://rpc.testnet.arc.network",
  blockExplorer: "https://testnet.arcscan.app",
  faucet: "https://faucet.circle.com",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
} as const;

// USDC ERC-20 contract on Arc Testnet
// Source: https://docs.arc.io/arc/references/contract-addresses
// Note: USDC uses 6 decimals for ERC-20 interface, 18 for native gas
export const USDC_CONTRACT_ADDRESS =
  "0x3600000000000000000000000000000000000000";

// USDC has 6 decimals via ERC-20 interface
export const USDC_DECIMALS = 6;

// Minimum gas fee per Arc docs (20 Gwei floor)
export const MIN_GAS_GWEI = "20";

// ERC-20 minimal ABI for USDC interactions
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;
