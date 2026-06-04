# CouponTrust API

Base URL: `http://localhost:5000/api`

## Auth

- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `GET /auth/me`
- `POST /auth/logout`

## Users

- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/trust-score`
- `GET /users/notifications`

## Coupons

- `POST /coupons/sell`
- `GET /coupons`
- `GET /coupons/:id`
- `GET /coupons/my/listed`
- `GET /coupons/my/purchased`
- `DELETE /coupons/:id`

## Payments

- `POST /payments/create-order`
  - body: `{ "couponId": "..." }`
- `POST /payments/create-intent`
  - alias of `POST /payments/create-order`
- `POST /payments/verify-authorized`
  - body: `{ "transactionId": "...", "razorpayOrderId": "...", "razorpayPaymentId": "...", "razorpaySignature": "..." }`
- `POST /payments/reveal-coupon/:transactionId`
- `POST /payments/confirm-worked/:transactionId`
- `POST /payments/report-not-working/:transactionId`
- `POST /payments/webhook`

## Disputes

- `POST /disputes/create/:transactionId`
- `GET /disputes/my`
- `GET /disputes/:id`

## Wallet

- `GET /wallet`
- `POST /wallet/withdraw`
- `GET /wallet/history`

## Super Admin

- `GET /super-admin/dashboard`
- `GET /super-admin/users`
- `PUT /super-admin/users/:id/ban`
- `PUT /super-admin/users/:id/unban`
- `GET /super-admin/coupons`
- `GET /super-admin/coupons/ai-failed`
- `GET /super-admin/transactions`
- `GET /super-admin/payments`
- `GET /super-admin/disputes`
- `PUT /super-admin/disputes/:id/resolve`
- `GET /super-admin/withdrawals`
- `PUT /super-admin/withdrawals/:id/approve`
- `PUT /super-admin/withdrawals/:id/reject`
- `GET /super-admin/trust-history`
- `GET /super-admin/fraud-reports`
- `GET /super-admin/revenue`
- `PUT /super-admin/settings`

## Important Behaviors

- Coupon codes are AES encrypted at rest and separately hashed for duplicate detection.
- Coupon reveal only happens after payment authorization.
- Payment capture happens after buyer confirmation or admin resolution.
- Razorpay APIs fall back to mock order and capture objects when keys are not set.
