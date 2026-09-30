# FundedBytes

Focused FX and commodities trading-platform MVP.

## Stack
React + TypeScript + Vite + Tailwind CSS + Supabase Auth.

## v1
- Main website
- Login / registration
- Dashboard with balance, equity, margin and P&L
- Open and closed positions
- Deposit: UPI P2P QR (manual team verification)
- Deposit: USDT BSC / BEP-20
- Withdrawal: UPI and USDT
- Transaction history
- Provider-ready separation for future market-data, payments and execution integrations

## Important
The current branch is an MVP integration shell. Deposit/withdrawal records and sample trading positions are local client state; they are not a production payment ledger or live execution system. Real-money operation requires the client's approved payment, custody, execution and compliance infrastructure.
