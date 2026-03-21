import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getContactSettings = asyncHandler(async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM contact_settings LIMIT 1");
  if (rows.length === 0) return res.json({ success: true, data: {} });

  const data = rows[0];
  if (data.social_links && typeof data.social_links === "string") {
    try {
      data.social_links = JSON.parse(data.social_links);
    } catch {
      data.social_links = [];
    }
  }
  res.json({ success: true, data });
});

export const updateContactSettings = asyncHandler(async (req, res) => {
  const { location_text, map_embed_url, social_links, mobile, email } =
    req.body;
  const socialLinksJson = JSON.stringify(social_links || []);

  const [existing] = await db.execute(
    "SELECT id FROM contact_settings LIMIT 1",
  );
  if (existing.length > 0) {
    await db.execute(
      `UPDATE contact_settings
       SET location_text = ?, map_embed_url = ?, social_links = ?, mobile = ?, email = ?
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
    await db.execute(
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
  res.json({ success: true, message: "Contact settings updated successfully" });
});
