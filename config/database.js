const sqlite = require("sqlite3").verbose();
const path = require("path");

// Go up one directory from 'config', then into 'database'
const dbPath = path.join(__dirname, "..", "database", "timetable.db");

const db = new sqlite.Database(dbPath, (error) => {
  if (error) {
    console.error("Unable to connect to database:", error);
  } else {
    console.log("Connected to SQLite database successfully!");
  }
});

// Export the connection so other files can use it
module.exports = db;