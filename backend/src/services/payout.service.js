const axios = require("axios");

const PAYOUT_BASE_URL = "https://api.razorpay.com/v1";

const useMockPayoutGateway = () =>
  process.env.ALLOW_MOCK_PAYOUTS === "true" &&
  (!process.env.RAZORPAYX_KEY_ID ||
    !process.env.RAZORPAYX_KEY_SECRET ||
    !process.env.RAZORPAYX_ACCOUNT_NUMBER);

const assertPayoutGatewayConfigured = () => {
  if (
    !process.env.RAZORPAYX_KEY_ID ||
    !process.env.RAZORPAYX_KEY_SECRET ||
    !process.env.RAZORPAYX_ACCOUNT_NUMBER
  ) {
    const error = new Error("RazorpayX payout gateway is not configured. Real withdrawals cannot be sent until payout credentials are set.");
    error.code = "PAYOUT_GATEWAY_NOT_CONFIGURED";
    throw error;
  }
};

const getPayoutClient = () =>
  axios.create({
    baseURL: PAYOUT_BASE_URL,
    auth: {
      username: process.env.RAZORPAYX_KEY_ID || "",
      password: process.env.RAZORPAYX_KEY_SECRET || ""
    },
    timeout: 20000
  });

const buildReferenceId = (prefix) => `${prefix}_${Date.now()}`;

const createContact = async ({ name, email, referenceId, notes = {} }) => {
  if (useMockPayoutGateway()) {
    return {
      id: `cont_mock_${Date.now()}`,
      name,
      email,
      reference_id: referenceId,
      notes
    };
  }

  const client = getPayoutClient();
  const { data } = await client.post("/contacts", {
    name,
    email,
    type: "vendor",
    reference_id: referenceId,
    notes
  });

  return data;
};

const createFundAccount = async ({ contactId, method, bankName, accountHolderName, accountNumber, ifscCode, upiId }) => {
  if (useMockPayoutGateway()) {
    return {
      id: `fa_mock_${Date.now()}`,
      contact_id: contactId,
      account_type: method === "bank" ? "bank_account" : "vpa"
    };
  }

  const client = getPayoutClient();
  const payload = method === "bank"
    ? {
        contact_id: contactId,
        account_type: "bank_account",
        bank_account: {
          name: accountHolderName,
          ifsc: ifscCode,
          account_number: accountNumber
        }
      }
    : {
        contact_id: contactId,
        account_type: "vpa",
        vpa: {
          address: upiId
        }
      };

  const { data } = await client.post("/fund_accounts", payload);
  return data;
};

const createPayout = async ({
  amount,
  currency = "INR",
  method,
  beneficiary,
  narration,
  referenceId,
  notes = {}
}) => {
  if (!useMockPayoutGateway()) {
    assertPayoutGatewayConfigured();
  }

  const effectiveReferenceId = referenceId || buildReferenceId("payout");
  const contact = await createContact({
    name: beneficiary.accountHolderName || beneficiary.name || "CouponX Payout",
    email: beneficiary.email || "support@couponx.com",
    referenceId: effectiveReferenceId,
    notes
  });

  const fundAccount = await createFundAccount({
    contactId: contact.id,
    method,
    bankName: beneficiary.bankName,
    accountHolderName: beneficiary.accountHolderName || beneficiary.name,
    accountNumber: beneficiary.accountNumber,
    ifscCode: beneficiary.ifscCode,
    upiId: beneficiary.upiId
  });

  if (useMockPayoutGateway()) {
    return {
      payout: {
        id: `pout_mock_${Date.now()}`,
        status: "processed",
        reference_id: effectiveReferenceId,
        amount: Math.round(Number(amount || 0) * 100),
        currency
      },
      contact,
      fundAccount
    };
  }

  const client = getPayoutClient();
  const { data } = await client.post("/payouts", {
    account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
    fund_account_id: fundAccount.id,
    amount: Math.round(Number(amount || 0) * 100),
    currency,
    mode: method === "bank" ? "IMPS" : "UPI",
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: effectiveReferenceId,
    narration: narration || "CouponX withdrawal",
    notes
  });

  return {
    payout: data,
    contact,
    fundAccount
  };
};

module.exports = {
  createPayout,
  useMockPayoutGateway,
  assertPayoutGatewayConfigured
};
