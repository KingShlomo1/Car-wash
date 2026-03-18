# Rei's Car Wash — Scheduling & Payment System

A simple, beginner-friendly car wash booking system.
No server, no database, no paid APIs required.

## Files

| File | What it does |
|---|---|
| `index.html` | Customer booking page (5 simple steps) |
| `confirmation.html` | Booking receipt + PayPal payment link |
| `pricing.html` | Public pricing & hours page |
| `admin.html` | Owner dashboard — manage bookings, schedule, prices |
| `style.css` | All the styling |
| `data.js` | All configuration (prices, services, schedule) |

## Quick Start

1. Open `index.html` in any web browser — no installation needed.
2. To change prices/schedule, open `admin.html` (password: `reis2024`).
3. To change business details, edit the top of `data.js`.

## How to customise

### Change your Bitt / DCash wallet ID
Open `data.js` and change:
```js
bittWalletId:   "1868-555-0000",   // ← your DCash phone number / wallet ID
bittAccountName: "Rei's Car Wash", // ← name displayed to customers
```

### Change prices
Open `admin.html` → log in → click **Pricing** tab → update prices → Save.

### Change your schedule
Open `admin.html` → log in → click **Schedule** tab → toggle days and set hours → Save.

### Change the admin password
Open `admin.html`, find this line and change it:
```js
const ADMIN_PASSWORD = "reis2024";
```

## Payment (Free — no API needed)

Customers pay via **Bitt / DCash** (the Eastern Caribbean digital currency).
- No developer account or API key needed
- Customers see your wallet ID + a QR code they scan with the DCash app
- Payment note includes the Booking ID so you can match payments easily
- You get notified by DCash when money arrives

## Confirmations

After booking, customers can:
1. Click **"Email this to me"** — opens their email app with a pre-filled confirmation
2. Click **"Print / Save PDF"** — saves a printable receipt

## Data storage

All bookings and settings are saved in the browser's **localStorage**.
This means data stays on the device. To share bookings across devices,
export the data from the Admin panel or use a free service like Google Sheets
(future enhancement).
