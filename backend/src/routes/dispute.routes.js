const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { disputeUpload } = require("../middleware/upload.middleware");
const { disputeValidator } = require("../utils/validators");
const {
  createDispute,
  getMyDisputes,
  getDisputeById
} = require("../controllers/dispute.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/create/:transactionId", disputeUpload, disputeValidator, createDispute);
router.get("/my", getMyDisputes);
router.get("/:id", getDisputeById);

module.exports = router;
