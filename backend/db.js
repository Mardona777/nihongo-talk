const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "nihongo_user",
  password: process.env.DB_PASSWORD || "NihongoTalk2026!",
  database: process.env.DB_NAME || "nihongo_talk",
  port: Number(process.env.DB_PORT) || 3306,
});

db.connect((error) => {
  if (error) {
    console.error(
      "❌ MySQL connection failed:",
      error.message
    );
    return;
  }

  console.log(
    "✅ MySQL connected successfully!"
  );
});

module.exports = db;