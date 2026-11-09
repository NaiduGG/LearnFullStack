const express = require("express");
const router = express.Router();
const db = require("../config/database");

// 1. Fetch valid Teacher + Subject combos for selected classes
// 1. Fetch valid Teacher + Subject combos for selected classes
// 1. Fetch valid Teacher + Subject combos for selected classes
router.post("/faculty-options", (request, response) => {
  const { classIds } = request.body;
  console.log("-----------------------------------------");
  console.log("1. Frontend requested faculty for classes:", classIds);

  if (!classIds || classIds.length === 0) {
    console.log("2. No classes selected, returning empty array.");
    return response.json([]);
  }

  const safeIds = classIds.map((id) => parseInt(id, 10));
  const placeholders = safeIds.map(() => "?").join(",");

  const sql = `
        SELECT DISTINCT t.id as teacher_id, t.nickname, s.subject_name
        FROM class_subjects cs
        JOIN subjects s ON cs.subject_id = s.id
        JOIN teacher_subjects ts ON s.id = ts.subject_id
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE cs.class_id IN (${placeholders})
        ORDER BY t.nickname, s.subject_name
    `;

  db.all(sql, safeIds, (error, rows) => {
    if (error) {
      console.error("3. SQL ERROR:", error.message);
      return response.status(500).json({ error: error.message });
    }
    console.log("3. Database found these matches:", rows);
    console.log("-----------------------------------------");
    response.json(rows);
  });
});

// 2. Fetch the saved grid for a specific class
router.get("/grid/:classId", (request, response) => {
  const sql = `
        SELECT day_index, slot_index, t.nickname, sch.subject_name 
        FROM schedule sch
        JOIN teachers t ON sch.teacher_id = t.id
        WHERE sch.class_id = ?
    `;
  db.all(sql, [request.params.classId], (error, rows) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(rows);
  });
});

// 3. Save a slot (UPGRADED: Double Collision Detection for Teachers AND Classes)
router.post("/save", (request, response) => {
  const { day_index, slot_index, class_id, teacher_id, subject_name } =
    request.body;

  // Check 1: Is the teacher busy in another class?
  const checkTeacherSql = `SELECT c.name, c.group_name, c.section, c.year FROM schedule sch JOIN classes c ON sch.class_id = c.id WHERE sch.teacher_id = ? AND sch.day_index = ? AND sch.slot_index = ? AND sch.class_id != ?`;

  db.get(
    checkTeacherSql,
    [teacher_id, day_index, slot_index, class_id],
    (err, teacherConflict) => {
      if (err) return response.status(500).json({ error: "DB error" });
      if (teacherConflict) {
        return response.status(400).json({
          error: `Collision! This teacher is already teaching Year ${teacherConflict.year} • ${teacherConflict.name} (${teacherConflict.group_name}) • Sec ${teacherConflict.section} at this time.`,
        });
      }

      // Check 2: Is the class already being taught by another teacher?
      const checkClassSql = `SELECT t.nickname FROM schedule sch JOIN teachers t ON sch.teacher_id = t.id WHERE sch.class_id = ? AND sch.day_index = ? AND sch.slot_index = ? AND sch.teacher_id != ?`;

      db.get(
        checkClassSql,
        [class_id, day_index, slot_index, teacher_id],
        (err, classConflict) => {
          if (err) return response.status(500).json({ error: "DB error" });
          if (classConflict) {
            return response.status(400).json({
              error: `Collision! This class is already being taught by ${classConflict.nickname} at this time. Please clear their schedule first.`,
            });
          }

          // If both checks pass, save the slot
          const insertSql = `
                INSERT INTO schedule (day_index, slot_index, class_id, teacher_id, subject_name) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(day_index, slot_index, class_id) 
                DO UPDATE SET teacher_id = excluded.teacher_id, subject_name = excluded.subject_name;
            `;
          db.run(
            insertSql,
            [day_index, slot_index, class_id, teacher_id, subject_name],
            function (error) {
              if (error)
                return response
                  .status(500)
                  .json({ error: "Failed to save slot." });
              response.status(200).json({ message: "Saved!" });
            },
          );
        },
      );
    },
  );
});

// 4. Clear a slot
router.delete("/clear", (request, response) => {
  const { class_id, day_index, slot_index } = request.body;
  const sql =
    "DELETE FROM schedule WHERE class_id = ? AND day_index = ? AND slot_index = ?";

  db.run(sql, [class_id, day_index, slot_index], function (error) {
    if (error) return response.status(500).json({ error: "Failed to clear." });
    response.status(200).json({ message: "Cleared" });
  });
});

// 5. Fetch the entire master schedule for ALL classes (for CSV Export)
router.get("/all", (request, response) => {
  const sql = `
        SELECT 
            sch.class_id, sch.day_index, sch.slot_index, 
            t.nickname as teacher_name, 
            sch.subject_name 
        FROM schedule sch
        JOIN teachers t ON sch.teacher_id = t.id
    `;
  db.all(sql, [], (error, rows) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(rows);
  });
});

// 6. Bulk clear ALL slots for selected classes
router.post("/clear-classes", (request, response) => {
  const { classIds } = request.body;
  if (!classIds || classIds.length === 0)
    return response.json({ message: "No classes provided." });

  const placeholders = classIds.map(() => "?").join(",");
  const sql = `DELETE FROM schedule WHERE class_id IN (${placeholders})`;

  db.run(sql, classIds, function (error) {
    if (error)
      return response.status(500).json({ error: "Failed to clear classes." });
    response.status(200).json({ message: "Cleared successfully." });
  });
});

// 7. Fetch the saved grid for a specific teacher (ADDED c.id as class_id so we can delete slots)
router.get("/faculty-grid/:teacherId", (request, response) => {
  const sql = `
        SELECT 
            sch.day_index, sch.slot_index, sch.subject_name,
            c.id as class_id, c.name as class_name, c.group_name, c.section, c.year
        FROM schedule sch
        JOIN classes c ON sch.class_id = c.id
        WHERE sch.teacher_id = ?
    `;
  db.all(sql, [request.params.teacherId], (error, rows) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(rows);
  });
});

// 8. Fetch valid Class + Subject combos for selected teachers (NEW)
router.post("/class-options", (request, response) => {
  const { teacherIds } = request.body;
  if (!teacherIds || teacherIds.length === 0) return response.json([]);

  const safeIds = teacherIds.map((id) => parseInt(id, 10));
  const placeholders = safeIds.map(() => "?").join(",");

  // Finds all classes that require a subject this teacher is qualified for
  const sql = `
        SELECT DISTINCT c.id as class_id, c.name, c.group_name, c.section, c.year, s.subject_name
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        JOIN class_subjects cs ON s.id = cs.subject_id
        JOIN classes c ON cs.class_id = c.id
        WHERE ts.teacher_id IN (${placeholders})
        ORDER BY c.year, c.name, s.subject_name
    `;

  db.all(sql, safeIds, (error, rows) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(rows);
  });
});

// 9. Fetch the entire master schedule for ALL faculty (for CSV Export)
router.get("/all-faculty", (request, response) => {
  const sql = `
        SELECT 
            sch.day_index, sch.slot_index, sch.subject_name,
            t.id as teacher_id, t.name as teacher_fullname, t.nickname,
            c.name as class_name, c.group_name, c.section, c.year
        FROM schedule sch
        JOIN teachers t ON sch.teacher_id = t.id
        JOIN classes c ON sch.class_id = c.id
    `;
  db.all(sql, [], (error, rows) => {
    if (error) return response.status(500).json({ error: error.message });
    response.json(rows);
  });
});

module.exports = router;
