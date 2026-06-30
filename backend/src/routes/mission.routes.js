const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const bannedMiddleware = require("../middleware/banned.middleware");
const {
  claimMissionController,
  getMissionsController,
  getMyMissionsController
} = require("../controllers/reward.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getMissionsController);
router.get("/my", getMyMissionsController);
router.post("/claim/:missionId", bannedMiddleware, claimMissionController);

module.exports = router;
