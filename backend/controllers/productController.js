import db from "../config/database.js";

// Get all products with category names (including archived)
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, 
        c.name as category_name,
        GROUP_CONCAT(DISTINCT ps.service_id) as service_ids,
        GROUP_CONCAT(DISTINCT pc.color_id) as color_ids
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      LEFT JOIN product_services ps ON p.id = ps.product_id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // Get images for all products
    const [allImages] = await db.query(`
      SELECT product_id, image_url 
      FROM product_images 
      ORDER BY product_id, display_order
    `);

    // Get color images for all products
    const [allColorImages] = await db.query(`
      SELECT product_id, color_id, image_url
      FROM product_colors
      WHERE image_url IS NOT NULL
    `);

    // Group images by product_id
    const imagesByProduct = {};
    allImages.forEach((img) => {
      if (!imagesByProduct[img.product_id]) {
        imagesByProduct[img.product_id] = [];
      }
      imagesByProduct[img.product_id].push({ url: img.image_url }); // ← consistent { url } shape
    });

    // Group color images by product_id → { colorId: imageUrl }
    const colorImagesByProduct = {};
    allColorImages.forEach(({ product_id, color_id, image_url }) => {
      if (!colorImagesByProduct[product_id]) {
        colorImagesByProduct[product_id] = {};
      }
      colorImagesByProduct[product_id][color_id] = image_url;
    });

    const formattedProducts = products.map((product) => ({
      ...product,
      productImages: imagesByProduct[product.id] || [],
      // ← expose sizeChartImage consistently alongside raw size_chart
      sizeChartImage: product.size_chart || null,
      services: product.service_ids
        ? product.service_ids.split(",").map(Number)
        : [],
      colors: product.color_ids ? product.color_ids.split(",").map(Number) : [],
      colorImages: colorImagesByProduct[product.id] || {},
      categoryName: product.category_name,
      service_ids: undefined,
      color_ids: undefined,
      category_name: undefined,
    }));

    res.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      `
      SELECT p.*, 
        c.name as category_name,
        GROUP_CONCAT(DISTINCT ps.service_id) as service_ids,
        GROUP_CONCAT(DISTINCT pc.color_id) as color_ids
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      LEFT JOIN product_services ps ON p.id = ps.product_id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `,
      [id]
    );

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Get product images separately for correct ordering
    const [imageRows] = await db.query(
      `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order`,
      [id]
    );

    // Get color images for this product
    const [colorImgRows] = await db.query(
      `SELECT color_id, image_url FROM product_colors WHERE product_id = ? AND image_url IS NOT NULL`,
      [id]
    );
    const colorImages = {};
    colorImgRows.forEach(({ color_id, image_url }) => {
      colorImages[color_id] = image_url;
    });

    const product = {
      ...products[0],
      productImages: imageRows.map((img) => ({ url: img.image_url })), // ← consistent { url } shape
      sizeChartImage: products[0].size_chart || null, // ← expose sizeChartImage
      services: products[0].service_ids
        ? products[0].service_ids.split(",").map(Number)
        : [],
      colors: products[0].color_ids
        ? products[0].color_ids.split(",").map(Number)
        : [],
      colorImages,
      categoryName: products[0].category_name,
      service_ids: undefined,
      color_ids: undefined,
      category_name: undefined,
    };

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// Create product
export const createProduct = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

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
      colorImages, // { colorId: imageUrl }
      productImages,
      sizeChartImage,
      status,
    } = req.body;

    console.log("Creating product:", { title, category, price });

    const productSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

    const mainImage =
      productImages && productImages.length > 0
        ? productImages[0]?.url || productImages[0]?.preview || productImages[0]
        : null;

    const [result] = await connection.query(
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
        mainImage || null,
        sizeChartImage || null,
        status || "active",
      ]
    );

    const productId = result.insertId;

    // Insert product images
    if (productImages && productImages.length > 0) {
      const imageValues = productImages.map((img, index) => {
        const imageUrl = img?.url || img?.preview || img;
        return [productId, imageUrl, `image_${index}.jpg`, 0, index];
      });
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, file_name, file_size, display_order) VALUES ?`,
        [imageValues]
      );
    }

    // Insert services
    if (services && services.length > 0) {
      const serviceValues = services.map((serviceId) => [productId, serviceId]);
      await connection.query(
        `INSERT INTO product_services (product_id, service_id) VALUES ?`,
        [serviceValues]
      );
    }

    // Insert colors — with optional per-color image_url
    if (colors && colors.length > 0) {
      const colorValues = colors.map((colorId) => {
        const imgUrl = colorImages?.[colorId] || null;
        // Reject base64 strings — only allow real URLs
        const safeUrl = imgUrl && !imgUrl.startsWith("data:") ? imgUrl : null;
        return [productId, colorId, safeUrl];
      });
      await connection.query(
        `INSERT INTO product_colors (product_id, color_id, image_url) VALUES ?`,
        [colorValues]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { id: productId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
      details: error.sqlMessage,
    });
  } finally {
    connection.release();
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const connection = await db.getConnection();

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
      colorImages, // { colorId: imageUrl }
      status,
    } = req.body;

    await connection.beginTransaction();

    // Derive the main image from productImages
    const mainImage =
      productImages && productImages.length > 0
        ? productImages[0]?.url || productImages[0]?.preview || productImages[0]
        : null;

    await connection.query(
      `UPDATE products 
       SET title = ?, 
           slug = ?, 
           category = ?, 
           heading = ?, 
           price = ?, 
           description = ?,
           body = ?,
           image = ?,
           size_chart = ?, 
           status = ?,
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
        mainImage || null, // ← also update products.image on edit
        sizeChartImage || null,
        status,
        id,
      ]
    );

    // Rebuild product images
    await connection.query("DELETE FROM product_images WHERE product_id = ?", [
      id,
    ]);
    if (productImages && productImages.length > 0) {
      const imageValues = productImages.map((img, index) => {
        const imageUrl = img?.url || img?.preview || img;
        return [id, imageUrl, `image_${index}.jpg`, 0, index];
      });
      await connection.query(
        "INSERT INTO product_images (product_id, image_url, file_name, file_size, display_order) VALUES ?",
        [imageValues]
      );
    }

    // Rebuild services
    await connection.query(
      "DELETE FROM product_services WHERE product_id = ?",
      [id]
    );
    if (services && services.length > 0) {
      const serviceValues = services.map((serviceId) => [id, serviceId]);
      await connection.query(
        "INSERT INTO product_services (product_id, service_id) VALUES ?",
        [serviceValues]
      );
    }

    // Rebuild colors — with optional per-color image_url
    await connection.query("DELETE FROM product_colors WHERE product_id = ?", [
      id,
    ]);
    if (colors && colors.length > 0) {
      const colorValues = colors.map((colorId) => {
        const imgUrl = colorImages?.[colorId] || null;
        const safeUrl = imgUrl && !imgUrl.startsWith("data:") ? imgUrl : null;
        return [id, colorId, safeUrl];
      });
      await connection.query(
        `INSERT INTO product_colors (product_id, color_id, image_url) VALUES ?`,
        [colorValues]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Product updated successfully",
      data: { id },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Archive product
export const archiveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE products SET status = ? WHERE id = ?",
      ["archived", id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product archived successfully" });
  } catch (error) {
    console.error("Error archiving product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive product",
      error: error.message,
    });
  }
};

// Restore product
export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE products SET status = ? WHERE id = ?",
      ["active", id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product restored successfully" });
  } catch (error) {
    console.error("Error restoring product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore product",
      error: error.message,
    });
  }
};

// Get product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [products] = await db.query(
      `
      SELECT p.*, 
        c.name as category_name,
        GROUP_CONCAT(DISTINCT ps.service_id) as service_ids,
        GROUP_CONCAT(DISTINCT pc.color_id) as color_ids
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      LEFT JOIN product_services ps ON p.id = ps.product_id
      LEFT JOIN product_colors pc ON p.id = pc.product_id
      WHERE p.slug = ?
      GROUP BY p.id
    `,
      [slug]
    );

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const productId = products[0].id;

    // Get product images
    const [images] = await db.query(
      `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order`,
      [productId]
    );

    // Get color images for this product
    const [colorImgRows] = await db.query(
      `SELECT color_id, image_url FROM product_colors WHERE product_id = ? AND image_url IS NOT NULL`,
      [productId]
    );
    const colorImages = {};
    colorImgRows.forEach(({ color_id, image_url }) => {
      colorImages[color_id] = image_url;
    });

    const product = {
      ...products[0],
      productImages: images.map((img) => ({ url: img.image_url })), // ← consistent { url } shape
      sizeChartImage: products[0].size_chart || null, // ← expose sizeChartImage
      services: products[0].service_ids
        ? products[0].service_ids.split(",").map(Number)
        : [],
      colors: products[0].color_ids
        ? products[0].color_ids.split(",").map(Number)
        : [],
      colorImages,
      categoryName: products[0].category_name,
      service_ids: undefined,
      color_ids: undefined,
      category_name: undefined,
    };

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};
