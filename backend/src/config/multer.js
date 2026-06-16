const fs = require("fs");
const path = require("path");
const multer = require("multer");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
};

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dirPath = path.join(process.cwd(), "uploads", folder);
      ensureDir(dirPath);
      cb(null, dirPath);
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^\w.-]/g, "");
      cb(null, `${req.user?._id || "guest"}-${Date.now()}-${safeName}`);
    }
  });

const createUploader = (folder) =>
  multer({
    storage: createStorage(folder),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });

module.exports = { createUploader };
