import db from "../config/database.js";

// Get all drafts
export const getAllDrafts = async (req, res) => {
  try {
    const [drafts] = await db.query(`
    SELECT 
    id,
    product_name AS productName,
    category,
    heading,
    price,
    description,
    body,
    services,
    colors,
    color_images,
    product_images,
    size_chart_image,
    last_saved AS lastSaved,
    created_at AS createdAt
  FROM drafts
  ORDER BY last_saved DESC
  
    `);

    const formattedDrafts = drafts.map((draft) => ({
      ...draft,
      services: draft.services ? JSON.parse(draft.services) : [],
      colors: draft.colors ? JSON.parse(draft.colors) : [],
      colorImages: draft.color_images ? JSON.parse(draft.color_images) : {},
      productImages: draft.product_images
        ? JSON.parse(draft.product_images)
        : [],
      sizeChartImage: draft.size_chart_image
        ? JSON.parse(draft.size_chart_image)
        : null,
      // remove raw DB fields from response
      color_images: undefined,
      product_images: undefined,
      size_chart_image: undefined,
    }));

    res.json({ success: true, data: formattedDrafts });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch drafts" });
  }
};

// Get single draft
export const getDraftById = async (req, res) => {
  try {
    const { id } = req.params;

    const [drafts] = await db.query(
      `SELECT 
    id,
    product_name AS productName,
    category,
    heading,
    price,
    description,
    body,
    services,
    colors,
    color_images,
    product_images,
    size_chart_image,
    last_saved AS lastSaved,
    created_at AS createdAt
  FROM drafts
  WHERE id = ?
  `,
      [id],
    );

    if (drafts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }

    const draft = {
      ...drafts[0],
      services: drafts[0].services ? JSON.parse(drafts[0].services) : [],
      colors: drafts[0].colors ? JSON.parse(drafts[0].colors) : [],
      colorImages: drafts[0].color_images
        ? JSON.parse(drafts[0].color_images)
        : {},
      productImages: drafts[0].product_images
        ? JSON.parse(drafts[0].product_images)
        : [],
      sizeChartImage: drafts[0].size_chart_image
        ? JSON.parse(drafts[0].size_chart_image)
        : null,
      // remove raw DB fields from response
      color_images: undefined,
      product_images: undefined,
      size_chart_image: undefined,
    };

    res.json({ success: true, data: draft });
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ success: false, message: "Failed to fetch draft" });
  }
};

// Create or update draft
export const saveDraft = async (req, res) => {
  try {
    const {
      id,
      productName,
      category,
      heading,
      price,
      description,
      body, // ← was missing before
      services,
      colors,
      colorImages, // ← was missing before
      productImages,
      sizeChartImage,
    } = req.body;

    const servicesJson = JSON.stringify(services || []);
    const colorsJson = JSON.stringify(colors || []);

    // Strip base64 from productImages — only keep entries with a real /uploads/ URL
    const safeProductImages = (productImages || [])
      .map((img) => {
        if (!img) return null;
        const url = img?.url || (typeof img === "string" ? img : null);
        if (!url || url.startsWith("data:")) return null;
        return typeof img === "object" ? { ...img, preview: undefined } : img;
      })
      .filter(Boolean);

    // Strip base64 from colorImages — only keep entries with a real /uploads/ URL
    const safeColorImages = {};
    for (const [colorId, imgUrl] of Object.entries(colorImages || {})) {
      if (imgUrl && typeof imgUrl === "string" && !imgUrl.startsWith("data:")) {
        safeColorImages[colorId] = imgUrl;
      }
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
      await db.query(
        `UPDATE drafts 
         SET product_name = ?, category = ?, heading = ?, price = ?, 
             description = ?, body = ?, services = ?, colors = ?,
             color_images = ?, product_images = ?, 
             size_chart_image = ?, last_saved = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          productName || null,
          category || null,
          heading || null,
          price || null,
          description || null,
          body || null, // ← new
          servicesJson,
          colorsJson,
          colorImagesJson, // ← new
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
      const [result] = await db.query(
        `INSERT INTO drafts (product_name, category, heading, price, description, 
                            body, services, colors, color_images, product_images, size_chart_image) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productName || null,
          category || null,
          heading || null,
          price || null,
          description || null,
          body || null, // ← new
          servicesJson,
          colorsJson,
          colorImagesJson, // ← new
          productImagesJson,
          sizeChartImageJson,
        ],
      );

      res.status(201).json({
        success: true,
        message: "Draft created successfully",
        data: { id: result.insertId },
      });
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save draft",
      error: error.message,
    });
  }
};

// Delete draft
export const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM drafts WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }

    res.json({ success: true, message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ success: false, message: "Failed to delete draft" });
  }
};

// Publish draft
export const publishDraft = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const [drafts] = await connection.query(
      "SELECT * FROM drafts WHERE id = ?",
      [id],
    );

    if (drafts.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }

    const draft = drafts[0];

    let services = [];
    let colors = [];
    let productImages = [];
    let colorImages = {}; // ← was missing before

    try {
      services = draft.services ? JSON.parse(draft.services) : [];
      colors = draft.colors ? JSON.parse(draft.colors) : [];
      productImages = draft.product_images
        ? JSON.parse(draft.product_images)
        : [];
      colorImages = draft.color_images // ← new
        ? JSON.parse(draft.color_images)
        : {};
    } catch (parseError) {
      console.error("Error parsing draft JSON:", parseError);
    }

    // Generate base slug from product name
    const baseSlug =
      draft.product_name
        ?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") || `product-${Date.now()}`;

    // Ensure slug is unique — append timestamp if it already exists
    let slug = baseSlug;
    const [existing] = await connection.query(
      "SELECT id FROM products WHERE slug = ?",
      [slug],
    );
    if (existing.length > 0) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const numericPrice = parseFloat(draft.price);
    const price =
      !isNaN(numericPrice) && numericPrice > 0 ? numericPrice : null;

    // Use .url only — never use .preview which may be raw base64
    const firstImageUrl =
      productImages.length > 0
        ? productImages[0]?.url?.startsWith("/uploads")
          ? productImages[0].url
          : null
        : null;

    // Parse sizeChartImage — stored as JSON string in draft, extract the url
    let sizeChartUrl = null;
    try {
      const rawSizeChart = draft.size_chart_image
        ? JSON.parse(draft.size_chart_image)
        : null;
      if (rawSizeChart) {
        // Could be a plain string or { url, preview }
        const candidate =
          typeof rawSizeChart === "string"
            ? rawSizeChart
            : rawSizeChart?.url || rawSizeChart?.preview || null;
        // Only accept real uploaded paths, never base64
        if (candidate && candidate.startsWith("/uploads")) {
          sizeChartUrl = candidate;
        }
      }
    } catch (e) {
      console.error("Error parsing size_chart_image:", e);
    }

    const [result] = await connection.query(
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
        sizeChartUrl, // ← now included
      ],
    );

    const productId = result.insertId;

    // Insert product images — only use uploaded URLs, never base64 previews
    if (productImages.length > 0) {
      const imageValues = productImages
        .map((img, index) => {
          const url = img?.url || (typeof img === "string" ? img : null);
          // Skip if no url or if it looks like a base64 string
          if (!url || url.startsWith("data:")) return null;
          return [productId, url, `image_${index}`, 0, index];
        })
        .filter(Boolean);

      if (imageValues.length > 0) {
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, file_name, file_size, display_order) 
           VALUES ?`,
          [imageValues],
        );
      }
    }

    // Insert services
    if (services.length > 0) {
      const serviceValues = services.map((serviceId) => [productId, serviceId]);
      await connection.query(
        `INSERT INTO product_services (product_id, service_id) VALUES ?`,
        [serviceValues],
      );
    }

    // Insert colors + their images
    if (colors.length > 0) {
      const colorValues = colors.map((colorId) => [productId, colorId]);
      await connection.query(
        `INSERT INTO product_colors (product_id, color_id) VALUES ?`,
        [colorValues],
      );

      // Insert color images — only real uploaded URLs, never base64
      const colorImageValues = colors
        .map((colorId) => {
          const imgUrl = colorImages[colorId];
          if (!imgUrl) return null;
          // Skip base64 strings — color image was never uploaded from draft
          if (typeof imgUrl === "string" && imgUrl.startsWith("data:"))
            return null;
          // Only accept real uploaded paths
          if (typeof imgUrl !== "string" || !imgUrl.startsWith("/uploads"))
            return null;
          return [productId, colorId, imgUrl];
        })
        .filter(Boolean);

      if (colorImageValues.length > 0) {
        await connection.query(
          `INSERT INTO product_color_images (product_id, color_id, image_url) 
           VALUES ?`,
          [colorImageValues],
        );
      }
    }

    await connection.query("DELETE FROM drafts WHERE id = ?", [id]);
    await connection.commit();

    res.json({
      success: true,
      message: "Draft published successfully",
      data: { productId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error publishing draft:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to publish draft" });
  } finally {
    connection.release();
  }
};
