# CouponTrust

CouponTrust is a production-oriented coupon resale marketplace with:

- `frontend/`: Next.js App Router, Tailwind CSS, React Hook Form, Razorpay checkout helpers, admin UI.
- `backend/`: Express.js, MongoDB with Mongoose, email OTP auth, AI coupon verification mock, dispute and escrow flows.

## Features

- Email OTP authentication
- AI/OCR-style coupon screenshot verification mock
- Duplicate coupon hash detection
- Trust score deduction and auto-ban flow
- Razorpay authorization/capture escrow pattern with mock fallback
- Wallet balances and withdrawal requests
- Buyer disputes and super admin resolution
- Fraud reports, trust history, revenue tracking
- User dashboard and super admin dashboard

## Folder Structure

```text
backend/
frontend/
README.md
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Set MongoDB, JWT, Razorpay, and mail variables
3. Install dependencies:

```bash
cd backend
npm install
```

4. Seed a super admin:

```bash
npm run seed:admin
```

5. Start the API:

```bash
npm run dev
```

API runs on `http://localhost:5000`.

## Frontend Setup

1. Copy `frontend/.env.local.example` to `frontend/.env.local`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start Next.js:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Environment Variables

### Backend

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `EMAIL_SERVICE`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `COUPON_ENCRYPTION_SECRET`
- `AI_PROVIDER`
- `SUPER_ADMIN_EMAIL`

### Frontend

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_UPLOAD_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Core Flows

### OTP Login

1. `POST /api/auth/send-otp`
2. `POST /api/auth/verify-otp`
3. JWT returned and stored client-side

### Sell Coupon

1. User accepts safety rules
2. Upload form + screenshot
3. Backend stores screenshot locally
4. AI mock verifies coupon code, amount, expiry, platform similarity, tamper risk
5. Duplicate and expired checks run before listing
6. Passing coupons go live instantly

### Buy Coupon

1. Buyer creates a Razorpay order
2. Payment is authorized
3. Coupon is revealed
4. Buyer confirms worked
5. Capture happens and seller wallet is credited

### Disputes

1. Buyer opens dispute with proof
2. Admin resolves in favor of buyer or seller
3. Refund or release happens
4. Seller trust score can be penalized

## Trust Score Rules

- 3 AI mismatches in 30 days: `-10`
- Duplicate coupon: `-15`
- Expired coupon: `-10`
- Fake coupon in dispute: `-20`
- Manipulated screenshot: `-25`
- Warning below `80`
- Auto-ban below `60`

## API Documentation

See `docs/API.md`.

## Notes

- Razorpay and mail services fall back to mock behavior when credentials are not configured.
- The AI layer is intentionally mocked behind `backend/src/services/aiCoupon.service.js` so you can swap in OCR or vision providers later.
- Uploaded files are stored locally under `backend/uploads`.
