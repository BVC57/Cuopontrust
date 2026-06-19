const fs = require("fs");
const Jimp = require("jimp-compact");
const path = require("path");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const measureCropQuality = (image, crop) => {
  let samples = 0;
  let colorfulSamples = 0;
  let nonLightSamples = 0;
  let saturationTotal = 0;
  const step = Math.max(4, Math.round(Math.min(crop.width, crop.height) / 40));

  for (let y = crop.y; y < crop.y + crop.height; y += step) {
    for (let x = crop.x; x < crop.x + crop.width; x += step) {
      const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
      const channels = [rgba.r, rgba.g, rgba.b];
      const max = Math.max(...channels);
      const min = Math.min(...channels);
      const brightness = (rgba.r + rgba.g + rgba.b) / (255 * 3);
      const saturation = max === 0 ? 0 : (max - min) / max;

      samples += 1;
      saturationTotal += saturation;

      if (brightness < 0.94) {
        nonLightSamples += 1;
      }

      if (saturation > 0.18 || max - min > 24) {
        colorfulSamples += 1;
      }
    }
  }

  const colorfulRatio = samples ? colorfulSamples / samples : 0;
  const nonLightRatio = samples ? nonLightSamples / samples : 0;
  const averageSaturation = samples ? saturationTotal / samples : 0;

  return {
    colorfulRatio,
    nonLightRatio,
    averageSaturation,
    score: colorfulRatio * 2.4 + nonLightRatio * 0.9 + averageSaturation * 1.4
  };
};

const buildCouponCoverCrop = (image) => {
  const width = image.bitmap.width || 0;
  const height = image.bitmap.height || 0;

  if (!width || !height) {
    return null;
  }

  const x = Math.max(0, Math.round(width * 0.06));
  const cropWidth = Math.max(180, Math.min(width - x * 2, Math.round(width * 0.88)));
  const yRatios = [0.12, 0.16, 0.2, 0.24];
  const heightRatios = [0.2, 0.24, 0.28];
  let bestCrop = null;

  for (const yRatio of yRatios) {
    for (const heightRatio of heightRatios) {
      const y = Math.max(0, Math.round(height * yRatio));
      const cropHeight = Math.max(120, Math.min(height - y - Math.round(height * 0.1), Math.round(height * heightRatio)));
      const crop = {
        x,
        y,
        width: Math.max(1, Math.min(cropWidth, width - x)),
        height: Math.max(1, Math.min(cropHeight, height - y))
      };
      const quality = measureCropQuality(image, crop);

      if (!bestCrop || quality.score > bestCrop.quality.score) {
        bestCrop = { ...crop, quality };
      }
    }
  }

  if (!bestCrop) {
    return null;
  }

  const { colorfulRatio, averageSaturation, nonLightRatio } = bestCrop.quality;
  if (colorfulRatio < 0.05 || averageSaturation < 0.09 || nonLightRatio < 0.12) {
    return null;
  }

  return bestCrop;
};

const createCouponCoverImage = async ({ sourcePath, proofUploadId }) => {
  const image = await Jimp.read(sourcePath);
  const width = image.bitmap.width || 0;
  const height = image.bitmap.height || 0;

  if (!width || !height) {
    throw new Error("Coupon screenshot dimensions could not be read");
  }

  const crop = buildCouponCoverCrop(image);
  if (!crop) {
    return null;
  }
  const coverUploadId = `${path.parse(proofUploadId).name}-cover.jpg`;
  const coverDirectory = path.join(process.cwd(), "uploads", "coupon-covers");
  const coverFilePath = path.join(coverDirectory, coverUploadId);

  ensureDir(coverDirectory);

  const croppedImage = image.clone().crop(crop.x, crop.y, crop.width, crop.height).quality(86);

  if (crop.width > 1200) {
    croppedImage.resize(1200, Jimp.AUTO);
  }

  await croppedImage.writeAsync(coverFilePath);

  return {
    coverImagePath: `/uploads/coupon-covers/${coverUploadId}`,
    coverImageUploadId: coverUploadId
  };
};

module.exports = {
  createCouponCoverImage
};
