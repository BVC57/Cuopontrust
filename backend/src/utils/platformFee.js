const PLATFORM_FEE_PERCENT = 10;

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

const calculatePlatformFeeBreakdown = (grossAmount, feePercent = PLATFORM_FEE_PERCENT) => {
  const normalizedGrossAmount = roundCurrency(grossAmount);
  const normalizedFeePercent = Number(feePercent || 0);
  const platformFee = roundCurrency((normalizedGrossAmount * normalizedFeePercent) / 100);
  const sellerAmount = roundCurrency(normalizedGrossAmount - platformFee);

  return {
    feePercent: normalizedFeePercent,
    grossAmount: normalizedGrossAmount,
    platformFee,
    sellerAmount
  };
};

module.exports = {
  PLATFORM_FEE_PERCENT,
  calculatePlatformFeeBreakdown
};
