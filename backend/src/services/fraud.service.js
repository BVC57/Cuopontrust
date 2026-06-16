const FraudReport = require("../models/FraudReport");

const createFraudReport = async ({ userId, couponId, type, riskLevel, description, aiData, userInputData }) =>
  FraudReport.create({
    userId,
    couponId,
    type,
    riskLevel,
    description,
    aiData,
    userInputData
  });

module.exports = { createFraudReport };
