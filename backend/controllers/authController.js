import db from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/errorHandler.js";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

const safeUser = (user) => ({
  id: user.id,
  user_id: user.user_id,
  first_name: user.first_name,
  last_name: user.last_name,
  username: user.username,
  email: user.email,
  role: user.role,
  image: user.image || null,
});

// ── Generic login helper ──────────────────────────────────────────────────────
const login = async (res, email, password, allowedRoles) => {
  const placeholders = allowedRoles.map(() => "?").join(", ");
  const [rows] = await db.execute(
    `SELECT * FROM system_users WHERE email = ? AND role IN (${placeholders}) AND status = 'active'`,
    [email, ...allowedRoles],
  );

  // Use the same generic message for both "not found" and "wrong password"
  // to prevent user enumeration
  const INVALID = { success: false, message: "Invalid credentials" };

  if (rows.length === 0) return res.status(401).json(INVALID);

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json(INVALID);

  await db.execute("UPDATE system_users SET last_login = NOW() WHERE id = ?", [
    user.id,
  ]);

  res.json({ success: true, token: signToken(user), user: safeUser(user) });
};

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  await login(res, email, password, ["admin"]);
});

export const staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  await login(res, email, password, ["manager", "staff"]);
});

export const getProfile = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT id, user_id, first_name, last_name, username, email,
            contact_no, home_address, birthdate, image, role, status, last_login, created_at
     FROM system_users WHERE id = ?`,
    [req.user.id],
  );
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: rows[0] });
});

export const updateProfile = asyncHandler(async (req, res) => {
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

  const [result] = await db.execute(
    `UPDATE system_users
     SET first_name = ?, last_name = ?, username = ?, email = ?,
         contact_no = ?, home_address = ?, birthdate = ?, image = ?
     WHERE id = ?`,
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
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "Profile updated successfully" });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { current_password, new_password } = req.body;

  if (!new_password || new_password.length < 8)
    return res
      .status(400)
      .json({
        success: false,
        message: "New password must be at least 8 characters",
      });

  const [rows] = await db.execute(
    "SELECT password FROM system_users WHERE id = ?",
    [id],
  );
  if (rows.length === 0)
    return res.status(404).json({ success: false, message: "User not found" });

  const isMatch = await bcrypt.compare(current_password, rows[0].password);
  if (!isMatch)
    return res
      .status(400)
      .json({ success: false, message: "Current password is incorrect" });

  const hashed = await bcrypt.hash(new_password, 12); // ✅ increased from 10 to 12 rounds
  await db.execute("UPDATE system_users SET password = ? WHERE id = ?", [
    hashed,
    id,
  ]);
  res.json({ success: true, message: "Password changed successfully" });
});
