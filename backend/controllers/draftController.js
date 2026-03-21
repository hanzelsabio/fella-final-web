import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ── Same bulk insert helper as productController ──────────────────────────────
const bulkInsert = async (conn, sql, rows) => {
  for (const row of rows) await conn.execute(sql, row);
};

// ── Shared draft formatter ────────────────────────────────────────────────────
const parseDraftJson = (draft) => ({
  ...draft,
  services: draft.services ? JSON.parse(draft.services) : [],
  colors: draft.colors ? JSON.parse(draft.colors) : [],
  colorImages: draft.color_images ? JSON.parse(draft.color_images) : {},
  productImages: draft.product_images ? JSON.parse(draft.product_images) : [],
  sizeChartImage: draft.size_chart_image
    ? JSON.parse(draft.size_chart_image)
    : null,
  // Strip raw DB columns — never expose to client
  color_images: undefined,
  product_images: undefined,
  size_chart_image: undefined,
});

const DRAFT_SELECT = `
  SELECT id, product_name AS productName, category, heading, price,
         description, body, services, colors, color_images, product_images,
         size_chart_image, last_saved AS lastSaved, created_at AS createdAt
  FROM drafts
`;

// ── GET all drafts ────────────────────────────────────────────────────────────
export const getAllDrafts = asyncHandler(async (req, res) => {
  const [drafts] = await db.execute(`${DRAFT_SELECT} ORDER BY last_saved DESC`);
  res.json({ success: true, data: drafts.map(parseDraftJson) });
});

// ── GET single draft ──────────────────────────────────────────────────────────
export const getDraftById = asyncHandler(async (req, res) => {
  const [drafts] = await db.execute(`${DRAFT_SELECT} WHERE id = ?`, [
    req.params.id,
  ]);
  if (drafts.length === 0)
    return res.status(404).json({ success: false, message: "Draft not found" });
  res.json({ success: true, data: parseDraftJson(drafts[0]) });
});

// ── SAVE (create or update) draft ─────────────────────────────────────────────
export const saveDraft = asyncHandler(async (req, res) => {
  const {
    id,
    productName,
    category,
    heading,
    price,
    description,
    body,
    services,
    colors,
    colorImages,
    productImages,
    sizeChartImage,
  } = req.body;

  const servicesJson = JSON.stringify(services || []);
  const colorsJson = JSON.stringify(colors || []);

  // Strip base64 from productImages — only keep real /uploads/ URLs
  const safeProductImages = (productImages || [])
    .map((img) => {
      const url = img?.url || (typeof img === "string" ? img : null);
      if (!url || url.startsWith("data:")) return null;
      return typeof img === "object" ? { ...img, preview: undefined } : img;
    })
    .filter(Boolean);

  // Strip base64 from colorImages
  const safeColorImages = {};
  for (const [colorId, imgUrl] of Object.entries(colorImages || {})) {
    if (imgUrl && typeof imgUrl === "string" && !imgUrl.startsWith("data:"))
      safeColorImages[colorId] = imgUrl;
  }

  // Strip base64 from sizeChartImage
  const safeSizeChart = (() => {
    if (!sizeChartImage) return null;
    const url =
      sizeChartImage?.url ||
      sizeChartImage?.preview ||
      (typeof sizeChartImage === "string" ? sizeChartImage : null);
    if (!url || url.startsWith("data:")) return null;
    return url;
  })();

  const productImagesJson = JSON.stringify(safeProductImages);
  const colorImagesJson = JSON.stringify(safeColorImages);
  const sizeChartImageJson = safeSizeChart
    ? JSON.stringify(safeSizeChart)
    : null;

  if (id) {
    await db.execute(
      `UPDATE drafts
       SET product_name = ?, category = ?, heading = ?, price = ?,
           description = ?, body = ?, services = ?, colors = ?,
           color_images = ?, product_images = ?, size_chart_image = ?,
           last_saved = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        productName || null,
        category || null,
        heading || null,
        price || null,
        description || null,
        body || null,
        servicesJson,
        colorsJson,
        colorImagesJson,
        productImagesJson,
        sizeChartImageJson,
        id,
      ],
    );
    res.json({
      success: true,
      message: "Draft updated successfully",
      data: { id },
    });
  } else {
    const [result] = await db.execute(
      `INSERT INTO drafts
       (product_name, category, heading, price, description, body, services, colors,
        color_images, product_images, size_chart_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productName || null,
        category || null,
        heading || null,
        price || null,
        description || null,
        body || null,
        servicesJson,
        colorsJson,
        colorImagesJson,
        productImagesJson,
        sizeChartImageJson,
      ],
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Draft created successfully",
        data: { id: result.insertId },
      });
  }
});

// ── DELETE draft ──────────────────────────────────────────────────────────────
export const deleteDraft = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM drafts WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "Draft not found" });
  res.json({ success: true, message: "Draft deleted successfully" });
});

// ── PUBLISH draft ─────────────────────────────────────────────────────────────
export const publishDraft = asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [drafts] = await conn.execute("SELECT * FROM drafts WHERE id = ?", [
      req.params.id,
    ]);
    if (drafts.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }

    const draft = drafts[0];
    let services = [];
    let colors = [];
    let productImages = [];
    let colorImages = {};

    try {
      services = draft.services ? JSON.parse(draft.services) : [];
      colors = draft.colors ? JSON.parse(draft.colors) : [];
      productImages = draft.product_images
        ? JSON.parse(draft.product_images)
        : [];
      colorImages = draft.color_images ? JSON.parse(draft.color_images) : {};
    } catch (parseErr) {
      console.error("Error parsing draft JSON:", parseErr);
    }

    // ── Unique slug ───────────────────────────────────────────────────────────
    const baseSlug =
      draft.product_name
        ?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") || `product-${Date.now()}`;

    let slug = baseSlug;
    const [existing] = await conn.execute(
      "SELECT id FROM products WHERE slug = ?",
      [slug],
    );
    if (existing.length > 0) slug = `${baseSlug}-${Date.now()}`;

    // ── Safe values ───────────────────────────────────────────────────────────
    const numericPrice = parseFloat(draft.price);
    const price =
      !isNaN(numericPrice) && numericPrice > 0 ? numericPrice : null;
    const firstImageUrl = productImages[0]?.url?.startsWith("/uploads")
      ? productImages[0].url
      : null;

    let sizeChartUrl = null;
    try {
      const raw = draft.size_chart_image
        ? JSON.parse(draft.size_chart_image)
        : null;
      if (raw) {
        const candidate =
          typeof raw === "string" ? raw : raw?.url || raw?.preview || null;
        if (candidate?.startsWith("/uploads")) sizeChartUrl = candidate;
      }
    } catch {
      /* ignore parse errors — sizeChartUrl stays null */
    }

    // ── Insert product ────────────────────────────────────────────────────────
    const [result] = await conn.execute(
      `INSERT INTO products (title, slug, category, heading, price, description, body, image, size_chart, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        draft.product_name || "Untitled Product",
        slug,
        draft.category || null,
        draft.heading || null,
        price,
        draft.description || null,
        draft.body || null,
        firstImageUrl,
        sizeChartUrl,
      ],
    );
    const productId = result.insertId;

    // ── Product images ────────────────────────────────────────────────────────
    const safeImages = productImages
      .map((img, i) => {
        const url = img?.url || (typeof img === "string" ? img : null);
        if (!url || url.startsWith("data:")) return null;
        return [productId, url, `image_${i}`, 0, i];
      })
      .filter(Boolean);

    await bulkInsert(
      conn,
      "INSERT INTO product_images (product_id, image_url, file_name, file_size, display_order) VALUES (?, ?, ?, ?, ?)",
      safeImages,
    );

    // ── Services ──────────────────────────────────────────────────────────────
    if (services.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_services (product_id, service_id) VALUES (?, ?)",
        services.map((sId) => [productId, sId]),
      );
    }

    // ── Colors + color images ─────────────────────────────────────────────────
    if (colors.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_colors (product_id, color_id) VALUES (?, ?)",
        colors.map((cId) => [productId, cId]),
      );

      const safeColorImages = colors
        .map((cId) => {
          const imgUrl = colorImages[cId];
          if (!imgUrl || typeof imgUrl !== "string") return null;
          if (imgUrl.startsWith("data:") || !imgUrl.startsWith("/uploads"))
            return null;
          return [productId, cId, imgUrl];
        })
        .filter(Boolean);

      if (safeColorImages.length) {
        await bulkInsert(
          conn,
          "INSERT INTO product_color_images (product_id, color_id, image_url) VALUES (?, ?, ?)",
          safeColorImages,
        );
      }
    }

    await conn.execute("DELETE FROM drafts WHERE id = ?", [req.params.id]);
    await conn.commit();

    res.json({
      success: true,
      message: "Draft published successfully",
      data: { productId },
    });
  } catch (err) {
    await conn.rollback();
    throw err; // forwarded to globalErrorHandler — no internal details leaked
  } finally {
    conn.release();
  }
});
