const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/timetable.db");

// 1. Fetch subjects for a class + their current assigned teacher + eligible teachers
router.get("/data/:classId", (request, response) => {
  const classId = request.params.classId;

  // Get all subjects this class takes, and who is currently assigned to them
  const subjectsSql = `
        SELECT s.id as subject_id, s.subject_name, a.teacher_id as assigned_teacher_id
        FROM class_subjects cs
        JOIN subjects s ON cs.subject_id = s.id
        LEFT JOIN allocations a ON cs.class_id = a.class_id AND s.id = a.subject_id
        WHERE cs.class_id = ?
        ORDER BY s.subject_name
    `;

  // Get ALL eligible teachers who are qualified to teach those specific subjects
  const teachersSql = `
        SELECT t.id as teacher_id, t.nickname, t.name, ts.subject_id 
        FROM teacher_subjects ts
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE ts.subject_id IN (SELECT subject_id FROM class_subjects WHERE class_id = ?)
    `;

  db.all(subjectsSql, [classId], (err, subjects) => {
    if (err) return response.status(500).json({ error: err.message });
    db.all(teachersSql, [classId], (err, teachers) => {
      if (err) return response.status(500).json({ error: err.message });
      response.json({ subjects, teachers });
    });
  });
});


 // Fetch valid Faculty based on STRICT Allocations
router.post("/faculty-options", (request, response) => {
    const { classIds } = request.body;
    if (!classIds || classIds.length === 0) return response.json([]);

    const safeIds = classIds.map(id => parseInt(id, 10));
    const placeholders = safeIds.map(() => "?").join(",");
    
    // Only fetch teachers explicitly allocated to this class in Step 4
    const sql = `
        SELECT a.teacher_id, t.nickname, s.subject_name
        FROM allocations a
        JOIN teachers t ON a.teacher_id = t.id
        JOIN subjects s ON a.subject_id = s.id
        WHERE a.class_id IN (${placeholders})
        ORDER BY s.subject_name, t.nickname
    `;

    db.all(sql, safeIds, (error, rows) => {
        if (error) return response.status(500).json({ error: error.message });
        response.json(rows);
    });
});

// 2. Save or Remove an allocation
router.post("/save", (request, response) => {
  const { class_id, subject_id, teacher_id } = request.body;

  if (!teacher_id) {
    // If they select "-- Unassigned --", delete the bridge link
    db.run(
      `DELETE FROM allocations WHERE class_id = ? AND subject_id = ?`,
      [class_id, subject_id],
      (err) => {
        if (err) return response.status(500).json({ error: err.message });
        response.json({ message: "Unassigned" });
      },
    );
  } else {
    // Upsert: Insert the new teacher, or overwrite the existing one
    const sql = `
            INSERT INTO allocations (class_id, subject_id, teacher_id) 
            VALUES (?, ?, ?)
            ON CONFLICT(class_id, subject_id) 
            DO UPDATE SET teacher_id = excluded.teacher_id;
        `;
    db.run(sql, [class_id, subject_id, teacher_id], (err) => {
      if (err) return response.status(500).json({ error: err.message });
      response.json({ message: "Saved" });
    });
  }
});

module.exports = router;
