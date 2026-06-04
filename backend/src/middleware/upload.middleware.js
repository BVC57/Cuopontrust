const { createUploader } = require("../config/multer");

const couponUpload = createUploader("coupons").single("proofImage");
const disputeUpload = createUploader("disputes").single("proofImage");
const profileUpload = createUploader("profile").single("avatar");

module.exports = { couponUpload, disputeUpload, profileUpload };
