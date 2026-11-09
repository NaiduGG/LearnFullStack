const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET: Fetch all teachers
router.get("/", (request, response) => {
  db.all("SELECT * FROM teachers ORDER BY name", [], (error, rows) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(rows);
  });
});

// POST: Add a new teacher
router.post("/add", (request, response) => {
  const { name, department, nickname } = request.body;
  const sql =
    "INSERT INTO teachers (name, department, nickname) VALUES (?,?,?)";

  db.run(sql, [name, department, nickname], function (error) {
    if (error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return response.status(400).json({ error: "Nickname must be unique!" });
      }
      return response.status(500).json({ error: "Failed to add teacher" });
    }
    response.json({ message: "Teacher added successfully!", id: this.lastID });
  });
});

// PUT: Update a teacher
router.put("/update/:id", (request, response) => {
  const { name, department, nickname } = request.body;
  const sql =
    "UPDATE teachers SET name = ?, department = ?, nickname = ? WHERE id = ?";

  db.run(
    sql,
    [name, department, nickname, request.params.id],
    function (error) {
      if (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          return response
            .status(400)
            .json({ error: "Nickname is already taken by another teacher!" });
        }
        return response.status(500).json({ error: "Failed to update teacher" });
      }
      response.json({ message: "Teacher updated successfully!" });
    },
  );
});

// DELETE: Remove a teacher
router.delete("/delete/:id", (request, response) => {
  db.run(
    "DELETE FROM teachers WHERE id = ?",
    [request.params.id],
    function (error) {
      if (error)
        return response.status(500).json({ error: "Failed to delete teacher" });
      response.json({ message: "Teacher deleted successfully" });
    },
  );
});

// GET: Fetch assigned subjects for a teacher
router.get("/assigned/:teacherId", (request, response) => {
  db.all(
    "SELECT subject_id FROM teacher_subjects WHERE teacher_id = ?",
    [request.params.teacherId],
    (error, rows) => {
      if (error) return response.status(500).json({ error: error.message });
      response.json(rows.map((row) => row.subject_id));
    },
  );
});

// POST: Save subject assignments for a teacher
router.post("/assign/:teacherId", (request, response) => {
  const teacherId = request.params.teacherId;
  const { subjectIds } = request.body;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run("DELETE FROM teacher_subjects WHERE teacher_id = ?", [teacherId]);

    if (subjectIds && subjectIds.length > 0) {
      const placeholders = subjectIds.map(() => "(?, ?)").join(",");
      const values = [];
      subjectIds.forEach((subId) => {
        values.push(teacherId, subId);
      });

      db.run(
        `INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES ${placeholders}`,
        values,
      );
    }

    db.run("COMMIT", (error) => {
      if (error)
        return response
          .status(500)
          .json({ error: "Failed to save assignments" });
      response.json({ message: "Subjects assigned to teacher successfully!" });
    });
  });
});

module.exports = router;
