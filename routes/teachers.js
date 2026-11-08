const express = require("express");
const router = express.Router();
const db = require("../config/database"); // Import the database connection

// Handle adding a teacher -> POST /api/teachers/add
router.post("/add", (request, response) => {
  const name = request.body.name;
  const department = request.body.department;
  const nickname = request.body.nickname;

  const sql =
    "INSERT INTO teachers (name, department, nickname) VALUES (?,?,?)";

  db.run(sql, [name, department, nickname], (error) => {
    if (error) {
      console.log(error);
      return response.status(500).send("Unable to add teacher");
    }
    response.status(200).send("Teacher added successfully");
  });
});

// Handle fetching teachers -> GET /api/teachers/
router.get("/", (request, response) => {
  const sql = "SELECT nickname FROM teachers";

  db.all(sql, (error, teachers) => {
    if (error) {
      console.log(error);
      return response.status(500).send("Error fetching teachers");
    }
    response.json(teachers);
  });
});

module.exports = router;
