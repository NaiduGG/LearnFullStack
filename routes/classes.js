const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET: Fetch all classes
router.get("/", (request, response) => {
  const sql = "SELECT * FROM classes ORDER BY year, name, group_name, section";
  db.all(sql, [], (error, rows) => {
    if (error) {
      console.error(error.message);
      return response.status(500).json({ error: "Failed to fetch classes" });
    }
    response.json(rows);
  });
});

// POST: Add a new class
router.post("/add", (request, response) => {
  const { year, name, group_name, section } = request.body;
  const sql =
    "INSERT INTO classes (year, name, group_name, section) VALUES (?, ?, ?, ?)";

  db.run(sql, [year, name, group_name, section], function (error) {
    if (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return response
          .status(400)
          .json({ error: "This class already exists!" });
      }
      return response.status(500).json({ error: "Failed to add class" });
    }
    response
      .status(200)
      .json({ message: "Class added successfully", id: this.lastID });
  });
});

// PUT: Update an existing class
router.put("/update/:id", (request, response) => {
  const id = request.params.id;
  const { year, name, group_name, section } = request.body;

  const sql =
    "UPDATE classes SET year = ?, name = ?, group_name = ?, section = ? WHERE id = ?";

  db.run(sql, [year, name, group_name, section, id], function (error) {
    if (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return response.status(400).json({
          error: "Another class with these exact details already exists!",
        });
      }
      return response.status(500).json({ error: "Failed to update class" });
    }
    response.status(200).json({ message: "Class updated successfully" });
  });
});

// DELETE: Remove a class
router.delete("/delete/:id", (request, response) => {
  const id = request.params.id;
  const sql = "DELETE FROM classes WHERE id = ?";

  db.run(sql, id, function (error) {
    if (error) {
      return response.status(500).json({ error: "Failed to delete class" });
    }
    response.status(200).json({ message: "Class deleted successfully" });
  });
});

module.exports = router;
