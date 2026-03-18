// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// async function testConnection() {
//   try {
//     console.log("Testing connection with:");
//     console.log("Host:", process.env.DB_HOST);
//     console.log("User:", process.env.DB_USER);
//     console.log("Port:", process.env.DB_PORT);
//     console.log("Database:", process.env.DB_NAME);

//     const connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       port: process.env.DB_PORT || 3306,
//     });

//     console.log("✅ Connection successful!");

//     const [rows] = await connection.query("SELECT VERSION() as version");
//     console.log("MySQL Version:", rows[0].version);

//     await connection.end();
//     console.log("✅ Connection closed");
//   } catch (error) {
//     console.error("❌ Connection failed:", error.message);
//     console.error("Error code:", error.code);

//     if (error.code === "ER_ACCESS_DENIED_ERROR") {
//       console.error("\n💡 Solutions:");
//       console.error("1. Check your username and password in .env file");
//       console.error("2. Make sure MySQL is running");
//       console.error("3. Verify the user has proper permissions");
//     }
//   }
// }

// testConnection();
