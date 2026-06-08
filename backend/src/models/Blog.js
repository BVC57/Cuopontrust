const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "CouponX Admin" },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
