const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "nihongo_user",
  password: "NihongoTalk2026!",
  database: "nihongo_talk",
  port: 3306,
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