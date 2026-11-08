const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Handle adding a subject -> POST /api/subjects/add
router.post("/add", (request, response) => {
  const name = request.body.subject_name;
  const semester = request.body.semester;

  const sql = "INSERT INTO subjects (subject_name, semester) VALUES (?,?)";

  db.run(sql, [name, semester], function (error) {
    if (error) {
      console.log(error.message);
      return response.status(500).send("Unable to add subject");
    }
    response.status(200).send("Subject added successfully");
  });
});

module.exports = router;