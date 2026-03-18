import db from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    // Find user by email with admin role
    const [rows] = await db.query(
      "SELECT * FROM system_users WHERE email = ? AND role = 'admin' AND status = 'active'",
      [email],
    );

    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    // Update last_login
    await db.query("UPDATE system_users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image || null,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    // Allow manager and staff roles
    const [rows] = await db.query(
      "SELECT * FROM system_users WHERE email = ? AND role IN ('manager', 'staff') AND status = 'active'",
      [email],
    );

    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    await db.query("UPDATE system_users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image || null,
      },
    });
  } catch (error) {
    console.error("Staff login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const { id } = req.user; // from JWT middleware
    const [rows] = await db.query(
      `SELECT id, user_id, first_name, last_name, username, email, contact_no, home_address, birthdate, image, role, status, last_login, created_at
       FROM system_users WHERE id = ?`,
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      first_name,
      last_name,
      username,
      email,
      contact_no,
      home_address,
      birthdate,
      image,
    } = req.body;

    const [result] = await db.query(
      `UPDATE system_users SET first_name = ?, last_name = ?, username = ?, email = ?, contact_no = ?, home_address = ?, birthdate = ?, image = ? WHERE id = ?`,
      [
        first_name,
        last_name,
        username,
        email || null,
        contact_no || null,
        home_address || null,
        birthdate || null,
        image || null,
        id,
      ],
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { current_password, new_password } = req.body;

    const [rows] = await db.query(
      "SELECT password FROM system_users WHERE id = ?",
      [id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE system_users SET password = ? WHERE id = ?", [
      hashed,
      id,
    ]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to change password" });
  }
};
