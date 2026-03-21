import db from "../config/database.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAbout = asyncHandler(async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM about LIMIT 1");
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "About not found" });
  res.json({ success: true, data: rows[0] });
});

export const updateAbout = asyncHandler(async (req, res) => {
  const { heading, subheading, body, image } = req.body;
  if (!heading?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Heading is required" });

  const [existing] = await db.execute("SELECT id FROM about LIMIT 1");
  if (existing.length > 0) {
    await db.execute(
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
    await db.execute(
      "INSERT INTO about (heading, subheading, body, image) VALUES (?, ?, ?, ?)",
      [heading.trim(), subheading || null, body || null, image || null],
    );
  }
  res.json({ success: true, message: "About updated successfully" });
});
