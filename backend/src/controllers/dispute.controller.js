const { validationResult } = require("express-validator");
const Transaction = require("../models/Transaction");
const Dispute = require("../models/Dispute");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { createNotification } = require("../services/notification.service");

const createDispute = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 422, "Validation failed", { errors: errors.array() });
  }

  const transaction = await Transaction.findById(req.params.transactionId);
  if (!transaction || String(transaction.buyerId) !== String(req.user._id)) {
    return sendResponse(res, 404, "Transaction not found");
  }

  const dispute = await Dispute.create({
    transactionId: transaction._id,
    buyerId: transaction.buyerId,
    sellerId: transaction.sellerId,
    couponId: transaction.couponId,
    reason: req.body.reason,
    comment: req.body.comment,
    proofImagePath: req.file ? `/uploads/disputes/${req.file.filename}` : undefined
  });

  await createNotification({
    userId: transaction.sellerId,
    type: "dispute_created",
    title: "A dispute has been opened",
    message: "A buyer reported that your coupon did not work."
  });

  return sendResponse(res, 201, "Dispute created", { dispute });
});

const getMyDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({
    $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
  }).sort({ createdAt: -1 });
  return sendResponse(res, 200, "Disputes fetched", { disputes });
});

const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    return sendResponse(res, 404, "Dispute not found");
  }
  return sendResponse(res, 200, "Dispute fetched", { dispute });
});

module.exports = {
  createDispute,
  getMyDisputes,
  getDisputeById
};
