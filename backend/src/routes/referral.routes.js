const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getMyReferralsController } = require("../controllers/reward.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/my", getMyReferralsController);

module.exports = router;
