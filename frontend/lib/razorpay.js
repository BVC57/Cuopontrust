"use client";

export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available"));
      return;
    }

    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async ({ order, user, onSuccess }) => {
  const Razorpay = await loadRazorpayScript();
  const instance = new Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    amount: order.amount,
    currency: order.currency,
    name: "CouponTrust",
    description: "Coupon marketplace payment authorization",
    order_id: order.id,
    prefill: {
      name: user?.name || "",
      email: user?.email || ""
    },
    theme: { color: "#4f46e5" },
    handler: onSuccess
  });
  instance.open();
};
