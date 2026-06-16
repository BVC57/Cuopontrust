const express = require("express");
const { submitContactIssue } = require("../controllers/contact.controller");

const router = express.Router();

router.post("/issues", submitContactIssue);

module.exports = router;
