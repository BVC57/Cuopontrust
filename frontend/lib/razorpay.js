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

export const openRazorpayCheckout = async ({ order, user, onSuccess, key }) => {
  const Razorpay = await loadRazorpayScript();
  const contact = String(user?.phone || user?.mobile || user?.contact || "9999999999").replace(/\D/g, "").slice(-10);
  const instance = new Razorpay({
    key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    amount: order.amount,
    currency: order.currency,
    name: "CouponX",
    description: "Coupon marketplace payment authorization",
    order_id: order.id,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact
    },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
      paylater: true,
      emi: false
    },
    config: {
      display: {
        blocks: {
          upi: {
            name: "Pay by UPI",
            instruments: [{ method: "upi" }]
          },
          other: {
            name: "Other payment methods",
            instruments: [
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" },
              { method: "paylater" }
            ]
          }
        },
        sequence: ["block.upi", "block.other"],
        preferences: {
          show_default_blocks: false
        }
      }
    },
    retry: {
      enabled: true
    },
    readOnly: {
      email: Boolean(user?.email),
      contact: Boolean(contact)
    },
    upi: {
      flow: "collect"
    },
    theme: { color: "#4f46e5" },
    handler: onSuccess
  });
  instance.open();
};
