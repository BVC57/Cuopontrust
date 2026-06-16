const ContactIssue = require("../models/ContactIssue");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { createAdminNotification } = require("../services/notification.service");

const allowedTopics = ["Coupon issue", "Payment support", "Seller payout", "Account verification", "Partnership inquiry", "Other"];

const submitContactIssue = asyncHandler(async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const topic = allowedTopics.includes(req.body.topic) ? req.body.topic : "Other";
  const message = String(req.body.message || "").trim();

  if (!fullName || !email || !message) {
    return sendResponse(res, 400, "Full name, email, and message are required");
  }

  const issue = await ContactIssue.create({
    fullName,
    email,
    topic,
    message
  });

  await createAdminNotification({
    type: "contact_issue",
    title: "New contact issue",
    message: `${fullName} submitted a ${topic.toLowerCase()} request.`,
    link: "/admin/contact-issues",
    metadata: { issueId: issue._id, email }
  });

  return sendResponse(res, 201, "Your issue was submitted successfully", { issue });
});

module.exports = { submitContactIssue };
