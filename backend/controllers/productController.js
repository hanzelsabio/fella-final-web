import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ── Shared formatter ──────────────────────────────────────────────────────────
const formatProduct = (product, images = [], colorImages = {}) => ({
  ...product,
  productImages: images,
  sizeChartImage: product.size_chart || null,
  services: product.service_ids
    ? product.service_ids.split(",").map(Number)
    : [],
  colors: product.color_ids ? product.color_ids.split(",").map(Number) : [],
  colorImages,
  categoryName: product.category_name,
  // strip raw aggregated columns — never expose to client
  service_ids: undefined,
  color_ids: undefined,
  category_name: undefined,
});

// ── Bulk insert helper ────────────────────────────────────────────────────────
// mysql2's execute() does not support the VALUES ? bulk syntax.
// We use individual parameterized execute() calls inside a transaction instead —
// equally safe since every value is still fully parameterized.
const bulkInsert = async (conn, sql, rows) => {
  for (const row of rows) await conn.execute(sql, row);
};

// ── GET all products ──────────────────────────────────────────────────────────
export const getAllProducts = asyncHandler(async (req, res) => {
  const [products] = await db.execute(`
    SELECT p.*,
      c.name AS category_name,
      GROUP_CONCAT(DISTINCT ps.service_id) AS service_ids,
      GROUP_CONCAT(DISTINCT pc.color_id)   AS color_ids
    FROM products p
    LEFT JOIN categories c       ON p.category = c.id
    LEFT JOIN product_services ps ON p.id = ps.product_id
    LEFT JOIN product_colors pc   ON p.id = pc.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);

  const [allImages] = await db.execute(
    "SELECT product_id, image_url FROM product_images ORDER BY product_id, display_order",
  );
  const [allColorImages] = await db.execute(
    "SELECT product_id, color_id, image_url FROM product_colors WHERE image_url IS NOT NULL",
  );

  const imagesByProduct = {};
  allImages.forEach(({ product_id, image_url }) => {
    if (!imagesByProduct[product_id]) imagesByProduct[product_id] = [];
    imagesByProduct[product_id].push({ url: image_url });
  });

  const colorImagesByProduct = {};
  allColorImages.forEach(({ product_id, color_id, image_url }) => {
    if (!colorImagesByProduct[product_id])
      colorImagesByProduct[product_id] = {};
    colorImagesByProduct[product_id][color_id] = image_url;
  });

  const formatted = products.map((p) =>
    formatProduct(
      p,
      imagesByProduct[p.id] || [],
      colorImagesByProduct[p.id] || {},
    ),
  );

  res.json({ success: true, data: formatted });
});

// ── GET product by ID ─────────────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const [products] = await db.execute(
    `SELECT p.*, c.name AS category_name,
       GROUP_CONCAT(DISTINCT ps.service_id) AS service_ids,
       GROUP_CONCAT(DISTINCT pc.color_id)   AS color_ids
     FROM products p
     LEFT JOIN categories c       ON p.category = c.id
     LEFT JOIN product_services ps ON p.id = ps.product_id
     LEFT JOIN product_colors pc   ON p.id = pc.product_id
     WHERE p.id = ? GROUP BY p.id`,
    [req.params.id],
  );
  if (products.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });

  const [imageRows] = await db.execute(
    "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order",
    [req.params.id],
  );
  const [colorImgRows] = await db.execute(
    "SELECT color_id, image_url FROM product_colors WHERE product_id = ? AND image_url IS NOT NULL",
    [req.params.id],
  );

  const colorImages = {};
  colorImgRows.forEach(({ color_id, image_url }) => {
    colorImages[color_id] = image_url;
  });

  res.json({
    success: true,
    data: formatProduct(
      products[0],
      imageRows.map((r) => ({ url: r.image_url })),
      colorImages,
    ),
  });
});

// ── GET product by slug ───────────────────────────────────────────────────────
export const getProductBySlug = asyncHandler(async (req, res) => {
  const [products] = await db.execute(
    `SELECT p.*, c.name AS category_name,
       GROUP_CONCAT(DISTINCT ps.service_id) AS service_ids,
       GROUP_CONCAT(DISTINCT pc.color_id)   AS color_ids
     FROM products p
     LEFT JOIN categories c       ON p.category = c.id
     LEFT JOIN product_services ps ON p.id = ps.product_id
     LEFT JOIN product_colors pc   ON p.id = pc.product_id
     WHERE p.slug = ? GROUP BY p.id`,
    [req.params.slug],
  );
  if (products.length === 0)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });

  const productId = products[0].id;
  const [images] = await db.execute(
    "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order",
    [productId],
  );
  const [colorImgRows] = await db.execute(
    "SELECT color_id, image_url FROM product_colors WHERE product_id = ? AND image_url IS NOT NULL",
    [productId],
  );

  const colorImages = {};
  colorImgRows.forEach(({ color_id, image_url }) => {
    colorImages[color_id] = image_url;
  });

  res.json({
    success: true,
    data: formatProduct(
      products[0],
      images.map((r) => ({ url: r.image_url })),
      colorImages,
    ),
  });
});

// ── CREATE product ────────────────────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      title,
      slug,
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
      status,
    } = req.body;

    const productSlug =
      slug ||
      title
        ?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-") ||
      `product-${Date.now()}`;
    const mainImage = productImages?.[0]?.url || null;

    const [result] = await conn.execute(
      `INSERT INTO products (title, slug, category, heading, price, description, body, image, size_chart, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || "Untitled Product",
        productSlug,
        category || null,
        heading || null,
        price || null,
        description || null,
        body || null,
        mainImage,
        sizeChartImage || null,
        status || "active",
      ],
    );
    const productId = result.insertId;

    if (productImages?.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_images (product_id, image_url, file_name, file_size, display_order) VALUES (?, ?, ?, ?, ?)",
        productImages
          .filter((img) => img?.url && !img.url.startsWith("data:"))
          .map((img, i) => [productId, img.url, `image_${i}.jpg`, 0, i]),
      );
    }

    if (services?.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_services (product_id, service_id) VALUES (?, ?)",
        services.map((sId) => [productId, sId]),
      );
    }

    if (colors?.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_colors (product_id, color_id, image_url) VALUES (?, ?, ?)",
        colors.map((cId) => {
          const imgUrl = colorImages?.[cId] || null;
          const safeUrl = imgUrl && !imgUrl.startsWith("data:") ? imgUrl : null;
          return [productId, cId, safeUrl];
        }),
      );
    }

    await conn.commit();
    res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully",
        data: { id: productId },
      });
  } catch (err) {
    await conn.rollback();
    throw err; // asyncHandler forwards to globalErrorHandler — no details leaked
  } finally {
    conn.release();
  }
});

// ── UPDATE product ────────────────────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
      heading,
      price,
      description,
      body,
      productImages,
      sizeChartImage,
      services,
      colors,
      colorImages,
      status,
    } = req.body;

    await conn.beginTransaction();

    const mainImage = productImages?.[0]?.url || null;

    await conn.execute(
      `UPDATE products
       SET title = ?, slug = ?, category = ?, heading = ?, price = ?,
           description = ?, body = ?, image = ?, size_chart = ?, status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        slug,
        category,
        heading,
        price,
        description,
        body || null,
        mainImage,
        sizeChartImage || null,
        status,
        id,
      ],
    );

    await conn.execute("DELETE FROM product_images WHERE product_id = ?", [id]);
    if (productImages?.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_images (product_id, image_url, file_name, file_size, display_order) VALUES (?, ?, ?, ?, ?)",
        productImages
          .filter((img) => img?.url && !img.url.startsWith("data:"))
          .map((img, i) => [id, img.url, `image_${i}.jpg`, 0, i]),
      );
    }

    await conn.execute("DELETE FROM product_services WHERE product_id = ?", [
      id,
    ]);
    if (services?.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_services (product_id, service_id) VALUES (?, ?)",
        services.map((sId) => [id, sId]),
      );
    }

    await conn.execute("DELETE FROM product_colors WHERE product_id = ?", [id]);
    if (colors?.length) {
      await bulkInsert(
        conn,
        "INSERT INTO product_colors (product_id, color_id, image_url) VALUES (?, ?, ?)",
        colors.map((cId) => {
          const imgUrl = colorImages?.[cId] || null;
          const safeUrl = imgUrl && !imgUrl.startsWith("data:") ? imgUrl : null;
          return [id, cId, safeUrl];
        }),
      );
    }

    await conn.commit();
    res.json({
      success: true,
      message: "Product updated successfully",
      data: { id },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// ── DELETE / ARCHIVE / RESTORE ────────────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM products WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product deleted successfully" });
});

export const archiveProduct = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE products SET status = ? WHERE id = ?",
    ["archived", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product archived successfully" });
});

export const restoreProduct = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE products SET status = ? WHERE id = ?",
    ["active", req.params.id],
  );
  if (result.affectedRows === 0)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product restored successfully" });
});
