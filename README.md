# AIMART Frontend

React + Vite single-page app for AIMART — an e-commerce storefront with a
built-in AI shopping assistant. This is the client for the
[AIMART microservices backend](https://github.com/) (a separate project/repo)
and talks to it exclusively through that backend's API Gateway.

## Features

- Browse and search products, product detail pages
- Cart (add/update/remove items)
- Checkout with a real Razorpay payment flow (test mode)
- Order history
- Seller dashboard: sales metrics, orders, product management (image upload)
- A floating chat widget that talks to AI-BUDDY, an LLM agent (LangGraph +
  Gemini) that can search products and add them to your cart on your behalf,
  live, over a Socket.IO connection

## Prerequisites

The AIMART backend must be running first, with its API Gateway reachable at
`http://localhost:8000` (the default). See that project's README for setup —
either `docker-compose up --build` there, or run each service natively.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`.

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | The backend's API Gateway URL. Default `http://localhost:8000`. |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **public** key (same value as the backend's `PAYMENT/.env` `RAZORPAY_KEY_ID`). Safe to expose client-side. Leave blank to skip the payment step during checkout — the order will still be created. |

## Trying it out

1. Register an account as a **seller**, then create a product (set a price
   and stock — orders will fail against a product with 0 stock).
2. Register a second account as a regular **buyer** (or just pick "Shop" at
   registration).
3. Browse/search products, add one to your cart, and check out. With a
   Razorpay test key configured, use Razorpay's test card
   `4111 1111 1111 1111`, any future expiry, any CVV.
4. Log back in as the seller and open **Seller Dashboard** to see the sale
   reflected in metrics/orders.
5. Click the **Chat** button (bottom-right) and ask AI-BUDDY something like
   "find me a wireless mouse and add it to my cart" — it will call the same
   product search and cart APIs the UI uses, live.

## Project structure

```
src/
  api/        axios calls per backend service, all routed through the gateway
  context/    AuthContext (JWT + user), CartContext (item count)
  components/ Navbar, ProtectedRoute, ChatWidget
  pages/      one file per route
```

## Build

```bash
npm run build
```

Outputs a static `dist/` folder, deployable to any static host (Vercel,
Netlify, GitHub Pages, etc.) — just make sure `VITE_API_BASE_URL` points at
wherever the backend's gateway is actually reachable from.
