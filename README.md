# Adamaq — Premium fashion commerce

A polished, mobile-first storefront and admin workspace. This initial implementation runs fully in the browser with localStorage-backed catalog, cart, wishlist, orders, discounts, and admin inventory so the complete product journey can be tested without credentials.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Customer checkout uses a safe local payment simulator; a real Paystack adapter can replace `src/store.js`'s `processPayment` function using the variables in `.env.example` and server-side verification.

Admin access: open **Admin** in the header and use `admin@adamaq.com` / `admin123`.
