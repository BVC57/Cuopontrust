const mongoose = require("mongoose");

const contactIssueSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    topic: {
      type: String,
      enum: ["Coupon issue", "Payment support", "Seller payout", "Account verification", "Partnership inquiry", "Other"],
      default: "Coupon issue",
      index: true
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "closed"],
      default: "open",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true
    },
    adminNote: String,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    handledAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactIssue", contactIssueSchema);
