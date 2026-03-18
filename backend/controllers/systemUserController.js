import db from "../config/database.js";
import bcrypt from "bcrypt";

const generateUserId = async () => {
  const [rows] = await db.query(
    "SELECT user_id FROM system_users ORDER BY id DESC LIMIT 1",
  );
  if (rows.length === 0) return "USR-001";
  const last = rows[0].user_id;
  const num = parseInt(last.replace("USR-", "")) + 1;
  return `USR-${String(num).padStart(3, "0")}`;
};

export const getAllSystemUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, user_id, first_name, last_name, username, email, role, status, last_login, created_at, updated_at
       FROM system_users ORDER BY created_at DESC`,
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching system users:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch system users" });
  }
};

export const getSystemUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT id, user_id, first_name, last_name, username, email, contact_no, home_address, birthdate, image, role, status, last_login, created_at, updated_at
       FROM system_users WHERE id = ?`,
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const getSystemUserByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      `SELECT id, user_id, first_name, last_name, username, email, contact_no, home_address, birthdate, image, role, status, last_login, created_at, updated_at
       FROM system_users WHERE user_id = ?`,
      [userId],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const createSystemUser = async (req, res) => {
  try {
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
      return res.status(400).json({
        success: false,
        message: "First name, last name, and username are required",
      });

    if (!password)
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });

    const user_id = await generateUserId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      // ✅ Added password column, fixed column order
      `INSERT INTO system_users (user_id, first_name, last_name, username, email, password, contact_no, home_address, birthdate, image, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: result.insertId, user_id },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    console.error("Error creating system user:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

export const updateSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
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
    const [result] = await db.query(
      `UPDATE system_users SET first_name = ?, last_name = ?, username = ?, email = ?, contact_no = ?, home_address = ?, birthdate = ?, image = ?, role = ? WHERE id = ?`,
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
        id,
      ],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const deleteSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM system_users WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

export const archiveSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE system_users SET status = 'archived' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User archived successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to archive user" });
  }
};

export const restoreSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE system_users SET status = 'active' WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to restore user" });
  }
};
