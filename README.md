# FundedByte (frontend prototype)

## Run locally

Copy `.env.example` to `.env.local` (already filled in for the Supabase project), then:

```bash
npm install
npm run dev
```

## Project

React + TypeScript + Vite + Tailwind CSS.

- Pricing, rules and FAQ: `src/config.ts`
- Payment integration hook: `startPayment()` in `src/components/CheckoutModal.tsx`
- Authentication hook: `onSubmit` in `src/components/AuthModal.tsx`

## What's included

- Marketing site: hero, programs, rules, profit split, FAQ
- Supabase email/password auth and database (`accounts`, `trades`, Row Level Security)
- Checkout that calls `create_demo_account` to create a demo evaluation account (no payment)
- Trader dashboard at `#/dashboard`: equity curve, profit target / drawdown progress, status, trade history (simulated data)
- State lives in `src/store.ts`

## Not connected yet

Payments, account provisioning, trading platform data, KYC, payouts and an admin panel. Once payments exist, revoke `execute` on `create_demo_account` and provision accounts server-side.
