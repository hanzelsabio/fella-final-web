// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// async function initDatabase() {
//   let connection;

//   try {
//     connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       port: process.env.DB_PORT || 3306,
//     });

//     console.log("Connected to MySQL server");

//     await connection.query(
//       `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
//     );
//     console.log(`✅ Database '${process.env.DB_NAME}' created`);

//     await connection.query(`USE ${process.env.DB_NAME}`);

//     // Create tables (same as before)
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS products (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         title VARCHAR(255) NOT NULL,
//         slug VARCHAR(255) UNIQUE NOT NULL,
//         category VARCHAR(100),
//         heading VARCHAR(255),
//         price VARCHAR(50),
//         description TEXT,
//         image TEXT,
//         status ENUM('active', 'archived') DEFAULT 'active',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         INDEX idx_status (status),
//         INDEX idx_category (category)
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Products table created");

//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS product_images (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         product_id INT,
//         image_url TEXT NOT NULL,
//         file_name VARCHAR(255),
//         file_size INT,
//         display_order INT DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
//         INDEX idx_product (product_id)
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Product Images table created");

//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS product_services (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         product_id INT,
//         service_id INT,
//         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
//         INDEX idx_product (product_id)
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Product Services table created");

//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS product_colors (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         product_id INT,
//         color_id INT,
//         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
//         INDEX idx_product (product_id)
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Product Colors table created");

//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS services (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         name VARCHAR(255) NOT NULL,
//         slug VARCHAR(255) UNIQUE,
//         description TEXT,
//         image TEXT,
//         status ENUM('active', 'archived') DEFAULT 'active',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Services table created");

//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS categories (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         name VARCHAR(255) NOT NULL,
//         slug VARCHAR(255) UNIQUE,
//         description TEXT,
//         image TEXT,
//         product_count INT DEFAULT 0,
//         status ENUM('active', 'archived') DEFAULT 'active',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Categories table created");

//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS drafts (
//         id INT PRIMARY KEY AUTO_INCREMENT,
//         product_name VARCHAR(255),
//         category VARCHAR(100),
//         heading VARCHAR(255),
//         price VARCHAR(50),
//         description TEXT,
//         services JSON,
//         colors JSON,
//         product_images JSON,
//         size_chart_image JSON,
//         status ENUM('draft') DEFAULT 'draft',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
//     `);
//     console.log("✅ Drafts table created");

//     console.log("\n🎉 Database initialization completed!");
//   } catch (error) {
//     console.error("❌ Error:", error);
//     throw error;
//   } finally {
//     if (connection) {
//       await connection.end();
//     }
//   }
// }

// initDatabase()
//   .then(() => process.exit(0))
//   .catch(() => process.exit(1));
