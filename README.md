# Adamaq — Premium fashion commerce

A polished, mobile-first storefront and admin workspace. This initial implementation runs fully in the browser with localStorage-backed catalog, cart, wishlist, orders, discounts, and admin inventory so the complete product journey can be tested without credentials.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Customer checkout is guest-only and currently supports manual bank transfer: the order is created as “Awaiting payment”, the customer sees the bank details, and a WhatsApp payment-proof link opens automatically. Set `VITE_BANK_NAME`, `VITE_BANK_ACCOUNT_NAME`, and `VITE_BANK_ACCOUNT_NUMBER` in Vercel before launch.

For automated payments later, a Nigerian provider account is still required. Flutterwave and Monnify both support Nigerian bank-transfer collection, but their official integrations require provider credentials and verification.

## Storefront and admin deployments

The app supports two Vercel projects from this same GitHub repository:

1. Create a Vercel project called `adamaq-storefront`, select this repository, and set `VITE_APP_MODE=storefront`.
2. Create a second Vercel project called `adamaq-admin`, select the same repository, and set `VITE_APP_MODE=admin`.
3. Give the second project a separate subdomain such as `admin.adamaq.com` in Vercel Domains.

The admin project opens directly into the admin portal and does not render the customer storefront header. The current login is a local preview gate only; before accepting real customer data, replace it with server-side authentication and a database-backed API.

For local testing, open `/admin` and use `admin@adamaq.com` / `admin123`.



<!-- Neon shared data API deployment check -->
