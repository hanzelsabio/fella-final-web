import db from "../config/database.js";

export const getContactSettings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM contact_settings LIMIT 1");
    if (rows.length === 0) return res.json({ success: true, data: {} });
    const data = rows[0];
    // Parse JSON social_links
    if (data.social_links && typeof data.social_links === "string") {
      try {
        data.social_links = JSON.parse(data.social_links);
      } catch {
        data.social_links = [];
      }
    }
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch contact settings" });
  }
};

export const updateContactSettings = async (req, res) => {
  try {
    const { location_text, map_embed_url, social_links, mobile, email } =
      req.body;

    const socialLinksJson = JSON.stringify(social_links || []);

    const [existing] = await db.query(
      "SELECT id FROM contact_settings LIMIT 1",
    );
    if (existing.length > 0) {
      await db.query(
        `UPDATE contact_settings SET
          location_text = ?, map_embed_url = ?,
          social_links = ?, mobile = ?, email = ?
         WHERE id = ?`,
        [
          location_text || null,
          map_embed_url || null,
          socialLinksJson,
          mobile || null,
          email || null,
          existing[0].id,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO contact_settings (location_text, map_embed_url, social_links, mobile, email)
         VALUES (?, ?, ?, ?, ?)`,
        [
          location_text || null,
          map_embed_url || null,
          socialLinksJson,
          mobile || null,
          email || null,
        ],
      );
    }
    res.json({
      success: true,
      message: "Contact settings updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update contact settings" });
  }
};
