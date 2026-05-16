export interface PaymentRecord {
  id: string;
  txHash: string;
  from: string;
  to: string;
  toLabel?: string;
  amount: string; // human-readable USDC
  memo?: string;
  timestamp: number;
  explorerUrl: string;
  status: "success" | "failed";
}

const STORAGE_KEY = "teampay_history";

export function savePayment(record: PaymentRecord): void {
  const existing = loadPayments();
  existing.unshift(record); // newest first
  // Keep last 100
  const trimmed = existing.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PaymentRecord[];
  } catch {
    return [];
  }
}

export function clearPayments(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export interface TeamMember {
  label: string; // display name
  address: string;
  role?: string;
}

const MEMBERS_KEY = "teampay_members";

export function saveMembers(members: TeamMember[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function loadMembers(): TeamMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return DEFAULT_MEMBERS;
    return JSON.parse(raw) as TeamMember[];
  } catch {
    return DEFAULT_MEMBERS;
  }
}

// Starter team list — replace with real addresses
const DEFAULT_MEMBERS: TeamMember[] = [
  { label: "Treasury", address: "0x0000000000000000000000000000000000000001", role: "Admin" },
];
