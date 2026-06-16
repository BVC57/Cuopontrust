const bannedMiddleware = (req, res, next) => {
  if (req.user.accountStatus === "banned") {
    return res.status(403).json({ success: false, message: "Your account is banned" });
  }
  next();
};

module.exports = bannedMiddleware;
