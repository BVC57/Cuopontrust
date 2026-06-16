const express = require("express");
const { listBlogs, getBlogBySlug } = require("../controllers/blog.controller");

const router = express.Router();

router.get("/", listBlogs);
router.get("/:slug", getBlogBySlug);

module.exports = router;
