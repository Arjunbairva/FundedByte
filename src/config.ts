// ── Single source of truth for brand, pricing and rules. Edit here only. ──
export const siteConfig = { brandName: "FundedByte", tagline: "Trade. Prove. Scale." };

export const baseRules = {
  evaluation: "1-Step", profitTarget: 10, maxDrawdown: 8, dailyDrawdown: 4,
  minTradingDays: "None", timeLimit: "Unlimited", profitSplit: 90,
  newsTrading: "Allowed", weekendHolding: "Allowed", eaTrading: "Allowed",
  dailyResetUtc: "00:00 UTC",
};

export interface Program { id: string; label: string; fee: number; balance: number; popular?: boolean; rules: typeof baseRules }
const p = (label: string, balance: number, fee: number, popular = false): Program =>
  ({ id: label, label, balance, fee, popular, rules: baseRules }); // override rules per program if needed

export const evaluationPrograms: Program[] = [
  p("$5K", 5000, 29), p("$10K", 10000, 49), p("$50K", 50000, 149, true), p("$100K", 100000, 249),
];

export const usd = (n: number, d = 0) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d });
const r = baseRules;
export const profitSplitExample = { profit: 2000, trader: 2000 * r.profitSplit / 100, firm: 2000 * (100 - r.profitSplit) / 100 };

export const comparisonRows: { label: string; get: (x: Program) => string }[] = [
  { label: "Starting Balance", get: x => usd(x.balance) }, { label: "Challenge Fee", get: x => usd(x.fee) },
  { label: "Profit Target", get: x => x.rules.profitTarget + "%" }, { label: "Maximum Drawdown", get: x => x.rules.maxDrawdown + "%" },
  { label: "Daily Drawdown", get: x => x.rules.dailyDrawdown + "%" }, { label: "Minimum Trading Days", get: x => x.rules.minTradingDays },
  { label: "Time Limit", get: x => x.rules.timeLimit }, { label: "Profit Split", get: x => x.rules.profitSplit + "%" },
  { label: "News Trading", get: x => x.rules.newsTrading }, { label: "Weekend Holding", get: x => x.rules.weekendHolding },
  { label: "EA Trading", get: x => x.rules.eaTrading },
];

const TBD = "This policy has not been finalized yet and will be published in the official terms before launch.";
export const faqs: [string, string][] = [
  ["What is a trading evaluation?", "An evaluation is a rules-based assessment of your trading discipline. You trade within defined risk limits to demonstrate consistency before progressing."],
  ["How does the profit target work?", `In the current configuration you must reach a ${r.profitTarget}% gain on the starting balance while respecting all risk limits.`],
  ["What is daily drawdown?", `The maximum loss permitted within one trading day: ${r.dailyDrawdown}% of the starting balance, resetting at ${r.dailyResetUtc}. Exact calculation is defined in the official rules.`],
  ["What is maximum drawdown?", `The maximum total loss permitted on the account: ${r.maxDrawdown}% of the starting balance. Exact methodology is defined in the official rules.`],
  ["Is there a time limit?", `Current configuration: ${r.timeLimit.toLowerCase()}, with no minimum trading days. Subject to final terms.`],
  ["How does the profit split work?", `The current configuration shows a ${r.profitSplit}% trader share of eligible profit. Eligibility conditions will be set out in the final terms.`],
  ["Can I trade during news?", "Currently configured as allowed. Final rules will confirm any conditions."],
  ["Can I hold trades over the weekend?", "Currently configured as allowed. Final rules will confirm any conditions."],
  ["Are Expert Advisors allowed?", "Currently configured as allowed. Final rules will confirm any restrictions."],
  ["What happens after I pass?", TBD],
  ["Are evaluation fees refundable?", TBD],
  ["How are payouts handled?", TBD],
];