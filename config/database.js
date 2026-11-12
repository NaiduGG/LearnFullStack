const sqlite = require("sqlite3").verbose();
const path = require("path");

// Go up one directory from 'config', then into 'database'
const dbPath = path.join(__dirname, "..", "database", "timetable.db");

const db = new sqlite.Database(dbPath, (error) => {
  if (error) {
    console.error("Unable to connect to database:", error);
  } else {
    console.log("Connected to SQLite database successfully!");

    db.run("PRAGMA foreign_keys = ON;");
  }
});

// Export the connection so other files can use it
module.exports = db;


/*

 .schema
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL
, nickname TEXT NOT NULL UNIQUE );
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE classes (
id INTEGER PRIMARY KEY AUTOINCREMENT,
year INTEGER NOT NULL CHECK (year IN (1, 2, 3)),               -- e.g -> 1,2,3
name TEXT NOT NULL,              -- e.g., 'B.Tech', 'MBA'
group_name TEXT NOT NULL,        -- e.g., 'DTSC', 'AI&DS'
section TEXT NOT NULL,           -- e.g., 'A', 'B'
UNIQUE(year, name, group_name, section) -- Prevents duplicate classes
);
CREATE TABLE schedule (
    day_index INTEGER,          -- mon = 1, tue = 2, etc.
    slot_index INTEGER,         -- 1 to 8
    class_id INTEGER,           -- Which class is having a lesson
    teacher_id INTEGER,         -- Which professor is teaching
    subject_name TEXT,          -- What subject is being taught
    
    -- CONSTRAINT 1: A specific class can only have ONE lesson in a single period slot
    PRIMARY KEY (day_index, slot_index, class_id),
    
    -- CONSTRAINT 2: A specific teacher can only teach ONE class in a single period slot
    UNIQUE (day_index, slot_index, teacher_id),
    
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);
CREATE TABLE teacher_subjects (
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,

    PRIMARY KEY (teacher_id, subject_id),

    FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON DELETE CASCADE,

    FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
);
CREATE VIEW teacher_subject_view AS
SELECT
t.name as teacher,
s.subject_name as subject
from teacher_subjects ts
join teachers t on ts.teacher_id = t.id
JOIN subjects s on ts.subject_id = s.id
"" teacher_subject_view(teacher,subject); ""
CREATE TABLE class_subjects (
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    
    PRIMARY KEY (class_id, subject_id),
    
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "subjects" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name TEXT NOT NULL,
    semester INTEGER NOT NULL,
    -- The new rule: Only the exact combo of name + semester must be unique
    UNIQUE(subject_name, semester)
);
CREATE TABLE workload (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    periods_per_week INTEGER NOT NULL DEFAULT 1, -- The new quantity column

    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY(teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    
    UNIQUE(class_id, teacher_id, subject_id)
);

*/