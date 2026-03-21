import db from "../config/database.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../middleware/errorHandler.js";

const generateUserId = async () => {
  const [rows] = await db.execute(
    "SELECT user_id FROM system_users ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "USR-001";
  const num = parseInt(rows[0].user_id.replace("USR-", "")) + 1;
  return `USR-${String(num).padStart(3, "0")}`;
};

export const getAllSystemUsers = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, first_name, last_name, username, email, role, status, last_login, created_at, updated_at FROM system_users ORDER BY created_at DESC",
  );
  res.json({ success: true, data: rows });
});

export const getSystemUserById = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, first_name, last_name, username, email, contact_no, home_address, birthdate, image, role, status, last_login, created_at, updated_at FROM system_users WHERE id = ?",
    [req.params.id],
  );
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: rows[0] });
});

export const getSystemUserByUserId = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, user_id, first_name, last_name, username, email, contact_no, home_address, birthdate, image, role, status, last_login, created_at, updated_at FROM system_users WHERE user_id = ?",
    [req.params.userId],
  );
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: rows[0] });
});

export const createSystemUser = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    username,
    email,
    contact_no,
    home_address,
    birthdate,
    image,
    role,
    password,
  } = req.body;
  if (!first_name || !last_name || !username)
    return res
      .status(400)
      .json({
        success: false,
        message: "First name, last name, and username are required",
      });
  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  const user_id = await generateUserId();
  const hashedPassword = await bcrypt.hash(password, 12);
  const [result] = await db.execute(
    "INSERT INTO system_users (user_id, first_name, last_name, username, email, password, contact_no, home_address, birthdate, image, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user_id,
      first_name,
      last_name,
      username,
      email || null,
      hashedPassword,
      contact_no || null,
      home_address || null,
      birthdate || null,
      image || null,
      role || "staff",
    ],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "User created successfully",
      data: { id: result.insertId, user_id },
    });
});

export const updateSystemUser = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    username,
    email,
    contact_no,
    home_address,
    birthdate,
    image,
    role,
  } = req.body;
  const [result] = await db.execute(
    "UPDATE system_users SET first_name = ?, last_name = ?, username = ?, email = ?, contact_no = ?, home_address = ?, birthdate = ?, image = ?, role = ? WHERE id = ?",
    [
      first_name,
      last_name,
      username,
      email || null,
      contact_no || null,
      home_address || null,
      birthdate || null,
      image || null,
      role || "staff",
      req.params.id,
    ],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User updated successfully" });
});

export const deleteSystemUser = asyncHandler(async (req, res) => {
  const [result] = await db.execute("DELETE FROM system_users WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User deleted successfully" });
});

export const archiveSystemUser = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE system_users SET status = 'archived' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User archived successfully" });
});

export const restoreSystemUser = asyncHandler(async (req, res) => {
  const [result] = await db.execute(
    "UPDATE system_users SET status = 'active' WHERE id = ?",
    [req.params.id],
  );
  if (result.affectedRows === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User restored successfully" });
});
