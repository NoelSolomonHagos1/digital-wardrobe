const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
require("dotenv").config();

async function setupDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const schema = await readFile(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);
    console.log("Database tables are ready.");
  } finally {
    await pool.end();
  }
}

setupDatabase().catch((error) => {
  console.error("Could not set up the database:", error.message);
  process.exitCode = 1;
});
