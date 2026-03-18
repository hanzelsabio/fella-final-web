import db from "../config/database.js";

export const getAbout = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about LIMIT 1");
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "About not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch about" });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const { heading, subheading, body, image } = req.body;
    if (!heading?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Heading is required" });

    // Upsert — update if exists, insert if not
    const [existing] = await db.query("SELECT id FROM about LIMIT 1");
    if (existing.length > 0) {
      await db.query(
        "UPDATE about SET heading = ?, subheading = ?, body = ?, image = ? WHERE id = ?",
        [
          heading.trim(),
          subheading || null,
          body || null,
          image || null,
          existing[0].id,
        ],
      );
    } else {
      await db.query(
        "INSERT INTO about (heading, subheading, body, image) VALUES (?, ?, ?, ?)",
        [heading.trim(), subheading || null, body || null, image || null],
      );
    }
    res.json({ success: true, message: "About updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update about" });
  }
};
