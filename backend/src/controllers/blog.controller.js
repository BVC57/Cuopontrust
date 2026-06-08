const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const listBlogs = asyncHandler(async (req, res) => {
  const filters = req.query.includeDrafts === "true" ? {} : { status: "published" };
  const blogs = await Blog.find(filters).sort({ publishedAt: -1, createdAt: -1 });
  return sendResponse(res, 200, "Blogs fetched", { blogs });
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: "published" });
  if (!blog) {
    return sendResponse(res, 404, "Blog not found");
  }
  return sendResponse(res, 200, "Blog fetched", { blog });
});

const createBlog = asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const excerpt = String(req.body.excerpt || "").trim();
  const content = String(req.body.content || "").trim();

  if (!title || !excerpt || !content) {
    return sendResponse(res, 400, "Title, excerpt, and content are required");
  }

  const slug = slugify(req.body.slug || title);
  const existing = await Blog.findOne({ slug });
  if (existing) {
    return sendResponse(res, 400, "A blog with this slug already exists");
  }

  const blog = await Blog.create({
    title,
    slug,
    excerpt,
    content,
    coverImage: req.body.coverImage || "",
    status: req.body.status === "draft" ? "draft" : "published",
    authorId: req.user._id,
    authorName: req.user.name || "CouponX Admin",
    publishedAt: req.body.status === "draft" ? null : new Date()
  });

  return sendResponse(res, 201, "Blog created", { blog });
});

const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendResponse(res, 404, "Blog not found");
  }

  if (req.body.title !== undefined) blog.title = String(req.body.title).trim();
  if (req.body.excerpt !== undefined) blog.excerpt = String(req.body.excerpt).trim();
  if (req.body.content !== undefined) blog.content = String(req.body.content).trim();
  if (req.body.coverImage !== undefined) blog.coverImage = req.body.coverImage;
  if (req.body.status !== undefined) {
    blog.status = req.body.status === "draft" ? "draft" : "published";
    blog.publishedAt = blog.status === "published" ? blog.publishedAt || new Date() : null;
  }
  if (req.body.slug !== undefined || req.body.title !== undefined) {
    blog.slug = slugify(req.body.slug || blog.title);
  }

  await blog.save();
  return sendResponse(res, 200, "Blog updated", { blog });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const deleted = await Blog.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return sendResponse(res, 404, "Blog not found");
  }
  return sendResponse(res, 200, "Blog deleted");
});

module.exports = {
  listBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};
