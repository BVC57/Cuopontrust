const Jimp = require("jimp-compact");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildSignalMask = (image, bounds, step) => {
  const rows = [];
  const cols = [];

  for (let y = bounds.top; y < bounds.bottom; y += step) {
    let active = 0;
    let total = 0;

    for (let x = bounds.left; x < bounds.right; x += step) {
      const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
      const channels = [rgba.r, rgba.g, rgba.b];
      const max = Math.max(...channels);
      const min = Math.min(...channels);
      const brightness = (rgba.r + rgba.g + rgba.b) / (255 * 3);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const isNearWhite = brightness > 0.96 && max - min < 14;
      const isSignal = !isNearWhite && (saturation > 0.12 || brightness < 0.9 || max - min > 24);

      total += 1;
      if (isSignal) {
        active += 1;
      }
    }

    rows.push({ y, density: total ? active / total : 0 });
  }

  for (let x = bounds.left; x < bounds.right; x += step) {
    let active = 0;
    let total = 0;

    for (let y = bounds.top; y < bounds.bottom; y += step) {
      const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
      const channels = [rgba.r, rgba.g, rgba.b];
      const max = Math.max(...channels);
      const min = Math.min(...channels);
      const brightness = (rgba.r + rgba.g + rgba.b) / (255 * 3);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const isNearWhite = brightness > 0.96 && max - min < 14;
      const isSignal = !isNearWhite && (saturation > 0.12 || brightness < 0.9 || max - min > 24);

      total += 1;
      if (isSignal) {
        active += 1;
      }
    }

    cols.push({ x, density: total ? active / total : 0 });
  }

  return { rows, cols };
};

const findBestSpan = (items, minDensity, minLength) => {
  let best = null;
  let start = -1;

  for (let index = 0; index <= items.length; index += 1) {
    const density = index < items.length ? items[index].density : -1;
    const active = density >= minDensity;

    if (active && start < 0) {
      start = index;
      continue;
    }

    if (!active && start >= 0) {
      const end = index - 1;
      const length = end - start + 1;

      if (length >= minLength) {
        const slice = items.slice(start, end + 1);
        const score = slice.reduce((sum, item) => sum + item.density, 0);

        if (!best || score > best.score) {
          best = { start, end, score };
        }
      }

      start = -1;
    }
  }

  return best;
};

const detectPromoBounds = (image) => {
  const width = image.bitmap.width || 0;
  const height = image.bitmap.height || 0;

  if (!width || !height) {
    return null;
  }

  const bounds = {
    left: Math.max(0, Math.round(width * 0.04)),
    right: Math.max(1, Math.round(width * 0.96)),
    top: Math.max(0, Math.round(height * 0.14)),
    bottom: Math.max(1, Math.round(height * 0.62))
  };

  const step = Math.max(1, Math.round(Math.min(width, height) / 320));
  const { rows, cols } = buildSignalMask(image, bounds, step);

  const rowSpan = findBestSpan(rows, 0.34, Math.max(10, Math.round(rows.length * 0.18)));
  if (!rowSpan) {
    return null;
  }

  const rowTop = rows[rowSpan.start].y;
  const rowBottom = rows[rowSpan.end].y + step;
  const rowHeight = Math.max(1, rowBottom - rowTop);

  const croppedCols = [];
  for (let x = bounds.left; x < bounds.right; x += step) {
    let active = 0;
    let total = 0;

    for (let y = rowTop; y < rowBottom; y += step) {
      const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
      const channels = [rgba.r, rgba.g, rgba.b];
      const max = Math.max(...channels);
      const min = Math.min(...channels);
      const brightness = (rgba.r + rgba.g + rgba.b) / (255 * 3);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const isNearWhite = brightness > 0.96 && max - min < 14;
      const isSignal = !isNearWhite && (saturation > 0.12 || brightness < 0.9 || max - min > 24);

      total += 1;
      if (isSignal) {
        active += 1;
      }
    }

    croppedCols.push({ x, density: total ? active / total : 0 });
  }

  const colSpan = findBestSpan(croppedCols, 0.42, Math.max(16, Math.round(croppedCols.length * 0.28)));
  if (!colSpan) {
    return null;
  }

  const left = croppedCols[colSpan.start].x;
  const right = croppedCols[colSpan.end].x + step;
  const widthSpan = Math.max(1, right - left);

  const paddingX = Math.round(widthSpan * 0.03);
  const paddingY = Math.round(rowHeight * 0.04);
  const x = clamp(left - paddingX, 0, width - 1);
  const y = clamp(rowTop - paddingY, 0, height - 1);
  const cropWidth = clamp(widthSpan + paddingX * 2, 1, width - x);
  const cropHeight = clamp(rowHeight + paddingY * 2, 1, height - y);

  if (cropWidth < Math.round(width * 0.35) || cropHeight < Math.round(height * 0.12)) {
    return null;
  }

  return { x, y, width: cropWidth, height: cropHeight };
};

const createCouponCoverImage = async ({ sourcePath, couponId }) => {
  const image = await Jimp.read(sourcePath);
  const width = image.bitmap.width || 0;
  const height = image.bitmap.height || 0;

  if (!width || !height) {
    throw new Error("Coupon screenshot dimensions could not be read");
  }

  const promoBounds = detectPromoBounds(image);
  const coverImage = promoBounds
    ? image.clone().crop(promoBounds.x, promoBounds.y, promoBounds.width, promoBounds.height)
    : image.clone();

  coverImage.quality(86);

  if ((coverImage.bitmap.width || 0) > 640) {
    coverImage.resize(640, Jimp.AUTO);
  }

  const coverBuffer = await coverImage.getBufferAsync(Jimp.MIME_JPEG);

  return {
    coverImagePath: `data:${Jimp.MIME_JPEG};base64,${coverBuffer.toString("base64")}`,
    coverImageUploadId: `coupon-${couponId}-cover.jpg`
  };
};

module.exports = {
  createCouponCoverImage
};
