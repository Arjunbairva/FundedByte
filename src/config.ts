export const siteConfig = {
  brandName: "FundedBytes",
  tagline: "Global markets. One simple trading account.",
};

export const instruments = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "Forex", digits: 5, base: 1.17482, spread: 0.00012, change: 0.38 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", type: "Forex", digits: 5, base: 1.34261, spread: 0.00015, change: 0.22 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", type: "Forex", digits: 3, base: 147.228, spread: 0.018, change: -0.16 },
  { symbol: "XAU/USD", name: "Gold / US Dollar", type: "Commodity", digits: 2, base: 3865.42, spread: 0.22, change: 0.71 },
  { symbol: "XAG/USD", name: "Silver / US Dollar", type: "Commodity", digits: 3, base: 46.128, spread: 0.035, change: 0.54 },
  { symbol: "USOIL", name: "WTI Crude Oil", type: "Commodity", digits: 2, base: 63.48, spread: 0.05, change: -0.31 },
];

export const depositLimits = {
  UPI: { currency: "INR", minimum: 1000 },
  USDT_BEP20: { currency: "USDT", minimum: 20, network: "BSC / BEP-20" },
};

export type DepositMethod = "UPI" | "USDT_BEP20";
export type WithdrawalMethod = "UPI" | "USDT_BEP20";
export type TransactionStatus = "Pending" | "Approved" | "Rejected" | "Completed";

export interface Position {
  id: string;
  symbol: string;
  side: "Buy" | "Sell";
  lots: number;
  entry: number;
  current: number;
  sl?: number;
  tp?: number;
  pnl: number;
  openedAt: string;
}

export interface ClosedPosition extends Position {
  exit: number;
  closedAt: string;
}

export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const inr = (n: number, digits = 2) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: digits, maximumFractionDigits: digits });
