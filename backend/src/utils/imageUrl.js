/**
 * Build a public product image URL.
 * - Full http(s) URLs are kept as-is
 * - Filenames like "1.jpg" or "products/1.jpg" become
 *   https://img.srikamatchisilks.com/uploads/products/1.jpg
 */
function getPublicBase() {
  return (process.env.PUBLIC_URL || "https://img.srikamatchisilks.com").replace(
    /\/$/,
    ""
  );
}

function resolveProductImage(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw;

  const base = getPublicBase();
  let path = raw.replace(/^\/+/, "");
  path = path.replace(/^uploads\/products\//i, "");
  path = path.replace(/^products\//i, "");

  return `${base}/uploads/products/${path}`;
}

/** Split gallery cell: "1.jpg|2.jpg" or "1.jpg,2.jpg" */
function resolveProductImages(value) {
  if (value === null || value === undefined) return [];
  const raw = String(value).trim();
  if (!raw) return [];

  const parts = raw
    .split(/[|,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.map(resolveProductImage).filter(Boolean);
}

module.exports = {
  getPublicBase,
  resolveProductImage,
  resolveProductImages,
};
