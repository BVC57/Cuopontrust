const { body, param } = require("express-validator");

const emailValidator = body("email").isEmail().withMessage("Valid email is required");

const otpValidator = body("otp")
  .isLength({ min: 6, max: 6 })
  .withMessage("OTP must be 6 digits")
  .isNumeric()
  .withMessage("OTP must be numeric");

const objectIdParam = (field) => param(field).isMongoId().withMessage(`${field} is invalid`);

const sellCouponValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("couponCode").trim().notEmpty().withMessage("Coupon code is required"),
  body("couponAmount").isFloat({ min: 0 }).withMessage("Coupon amount must be positive"),
  body("sellingPrice").isFloat({ min: 0 }).withMessage("Selling price must be positive"),
  body("currency").trim().notEmpty().withMessage("Currency is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("expiryDate").isISO8601().withMessage("Expiry date must be valid"),
  body("terms").optional().isString(),
  body("categories").optional(),
  body("customCategory").optional().isString()
];

const disputeValidator = [
  body("reason").trim().notEmpty().withMessage("Reason is required"),
  body("comment").optional().isString()
];

module.exports = {
  emailValidator,
  otpValidator,
  objectIdParam,
  sellCouponValidator,
  disputeValidator
};
