/**
 * Local ASL reference images for SignLingo (offline).
 * Reuses existing assets at src/assets/SignImages/ — no duplicate copies.
 * Keys match model / SignImageData labels exactly.
 */
import { SignImageData } from "../data/SignImageData";
import defaultSign from "../assets/logo.svg";

export const SIGN_IMAGES = SignImageData.reduce(
  (images, sign) => {
    if (sign?.name && sign?.url) {
      images[sign.name] = sign.url;
    }
    return images;
  },
  { default: defaultSign }
);

/**
 * Resolve a local sign image by label (exact or case-insensitive).
 */
export const getSignImage = (signName) => {
  if (!signName) return SIGN_IMAGES.default;

  if (SIGN_IMAGES[signName]) {
    return SIGN_IMAGES[signName];
  }

  const normalized = String(signName).trim().toLowerCase().replace(/\s+/g, "");
  const match = Object.keys(SIGN_IMAGES).find(
    (key) => key.toLowerCase().replace(/\s+/g, "") === normalized
  );

  return match ? SIGN_IMAGES[match] : SIGN_IMAGES.default;
};
