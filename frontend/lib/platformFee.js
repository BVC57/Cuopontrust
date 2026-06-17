export const PLATFORM_FEE_PERCENT = 10;

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

export const calculatePlatformFeeBreakdown = (amount, feePercent = PLATFORM_FEE_PERCENT) => {
  const grossAmount = roundCurrency(amount);
  const normalizedFeePercent = Number(feePercent || 0);
  const platformFee = roundCurrency((grossAmount * normalizedFeePercent) / 100);
  const sellerAmount = roundCurrency(grossAmount - platformFee);

  return {
    grossAmount,
    feePercent: normalizedFeePercent,
    platformFee,
    sellerAmount,
    buyerPays: grossAmount
  };
};
