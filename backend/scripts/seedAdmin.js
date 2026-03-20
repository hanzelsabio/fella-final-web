import bcrypt from "bcrypt";
import db from "../config/database.js";
import dotenv from "dotenv";

const seedAdmin = async () => {
  dotenv.config();

  try {
    // ✏️ Change these to your preferred credentials
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const first_name = process.env.ADMIN_FIRST_NAME;
    const last_name = process.env.ADMIN_LAST_NAME;
    const username = process.env.ADMIN_USERNAME;

    // Check if already exists
    const [existing] = await db.query(
      "SELECT id FROM system_users WHERE email = ? OR username = ?",
      [email, username],
    );

    if (existing.length > 0) {
      console.log("⚠️  Admin already exists. Skipping.");
      process.exit(0);
    }

    // Generate user_id
    const [rows] = await db.query(
      "SELECT user_id FROM system_users ORDER BY id DESC LIMIT 1",
    );
    const user_id =
      rows.length === 0
        ? "USR-001"
        : `USR-${String(parseInt(rows[0].user_id.replace("USR-", "")) + 1).padStart(3, "0")}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await db.query(
      `INSERT INTO system_users 
        (user_id, first_name, last_name, username, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?, 'admin', 'active')`,
      [user_id, first_name, last_name, username, email, hashedPassword],
    );

    console.log("✅ Admin created successfully!");
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID:  ${user_id}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();
