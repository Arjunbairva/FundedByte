# FundedByte (frontend prototype)

## Run locally

```bash
npm install
npm run dev
```

## Project

React + TypeScript + Vite + Tailwind CSS.

- Pricing, rules and FAQ: `src/config.ts`
- Payment integration hook: `startPayment()` in `src/components/CheckoutModal.tsx`
- Authentication hook: `onSubmit` in `src/components/AuthModal.tsx`

This repository currently contains the customer-facing frontend prototype. Payment, authentication, account provisioning and trading infrastructure are not connected yet.
