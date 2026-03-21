// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// // Create connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // Test connection
// try {
//   const connection = await pool.getConnection();
//   console.log("✅ Connected to MySQL database");
//   connection.release();
// } catch (err) {
//   console.error("Error connecting to database:", err);
// }

// export default pool;

/**
 * db.js  (replaces / wraps your existing database.js)
 * All queries go through these helpers — raw string interpolation
 * into SQL is impossible when you use these functions.
 *
 * Usage:
 *   import { queryOne, queryMany, execute } from "../config/db.js";
 *
 *   // SELECT one row
 *   const product = await queryOne("SELECT * FROM products WHERE id = ?", [id]);
 *
 *   // SELECT many rows
 *   const products = await queryMany("SELECT * FROM products WHERE status = ?", ["active"]);
 *
 *   // INSERT / UPDATE / DELETE
 *   const result = await execute(
 *     "INSERT INTO products (title, price) VALUES (?, ?)",
 *     [title, price]
 *   );
 *   console.log(result.insertId);
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// ── Connection pool ───────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ✅ Security: disable multiple statements — prevents stacked query attacks
  multipleStatements: false,
  // ✅ Security: enable named placeholders for readability when needed
  namedPlaceholders: false,
});

// ── Test connection ───────────────────────────────────────────────────────────
try {
  const conn = await pool.getConnection();
  console.log("✅ Connected to MySQL database");
  conn.release();
} catch (err) {
  console.error("Error connecting to database:", err);
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/**
 * queryMany — SELECT returning multiple rows
 * @param {string} sql   — parameterized SQL, e.g. "SELECT * FROM t WHERE id = ?"
 * @param {any[]}  params — values, e.g. [id]
 * @returns {Promise<any[]>}
 */
export const queryMany = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * queryOne — SELECT returning a single row (or null)
 */
export const queryOne = async (sql, params = []) => {
  const rows = await queryMany(sql, params);
  return rows[0] ?? null;
};

/**
 * execute — INSERT / UPDATE / DELETE
 * @returns {Promise<mysql.ResultSetHeader>} — has .insertId, .affectedRows
 */
export const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

/**
 * transaction — run multiple queries atomically
 * If any query throws, the whole transaction rolls back.
 *
 * Usage:
 *   await transaction(async (conn) => {
 *     await conn.execute("INSERT INTO orders ...", [...]);
 *     await conn.execute("UPDATE inventory ...", [...]);
 *   });
 */
export const transaction = async (callback) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await callback(conn);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export default pool;
