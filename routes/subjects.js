const express = require("express");
const router = express.Router();
const db = require("../config/database");

// 1. Fetch all subjects
router.get("/", (request, response) => {
  db.all(
    "SELECT * FROM subjects ORDER BY semester, subject_name",
    [],
    (error, rows) => {
      if (error) return response.status(500).json({ error: error.message });
      response.json(rows);
    },
  );
});

// 2. Add a new subject
router.post("/add", (request, response) => {
  const { subject_name, semester } = request.body;
  db.run(
    "INSERT INTO subjects (subject_name, semester) VALUES (?,?)",
    [subject_name, semester],
    function (error) {
      if (error)
        return response
          .status(500)
          .json({ error: "Could not add subject. Name might already exist." });
      response.json({ message: "Subject added!", id: this.lastID });
    },
  );
});

// 3. Get currently assigned subjects for a specific class
router.get("/assigned/:classId", (request, response) => {
  db.all(
    "SELECT subject_id FROM class_subjects WHERE class_id = ?",
    [request.params.classId],
    (error, rows) => {
      if (error) return response.status(500).json({ error: error.message });
      // Return an array of just the IDs (e.g., [1, 4, 5])
      response.json(rows.map((row) => row.subject_id));
    },
  );
});

// 4. Save checkbox assignments for a class
router.post("/assign/:classId", (request, response) => {
  const classId = request.params.classId;
  const { subjectIds } = request.body; // Array of checked subject IDs

  db.serialize(() => {
    // We use a transaction so if one step fails, the whole thing rolls back safely
    db.run("BEGIN TRANSACTION");

    // Clear old assignments for this class
    db.run("DELETE FROM class_subjects WHERE class_id = ?", [classId]);

    // Insert the new checked assignments
    if (subjectIds && subjectIds.length > 0) {
      const placeholders = subjectIds.map(() => "(?, ?)").join(",");
      const values = [];
      subjectIds.forEach((subId) => {
        values.push(classId, subId);
      });

      db.run(
        `INSERT INTO class_subjects (class_id, subject_id) VALUES ${placeholders}`,
        values,
      );
    }

    db.run("COMMIT", (error) => {
      if (error)
        return response
          .status(500)
          .json({ error: "Failed to save assignments" });
      response.json({ message: "Subjects assigned to class successfully!" });
    });
  });
});


// DELETE: Remove a subject
router.delete("/delete/:id", (request, response) => {
    db.run("DELETE FROM subjects WHERE id = ?", [request.params.id], function(error) {
        if (error) return response.status(500).json({ error: "Failed to delete subject" });
        response.json({ message: "Subject deleted successfully" });
    });
});

module.exports = router;
