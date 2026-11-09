const express = require("express");
const path = require("path");
const app = express();

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

// 1. Middleware (Setting up the server rules)
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Added this so your server can understand JSON fetch requests later
app.use(express.static("public"));

// 2. Import your modular routes
const teacherRoutes = require("./routes/teachers");
const subjectRoutes = require("./routes/subjects");
const classRoutes = require("./routes/classes");
const assignRoutes = require("./routes/assign");
// 3. Delegate traffic to the routes
// Any request starting with /api/teachers goes to the teachers.js file
app.use("/api/teachers", teacherRoutes);

// Any request starting with /api/subjects goes to the subjects.js file
app.use("/api/subjects", subjectRoutes);

app.use("/api/classes", classRoutes);

app.use("/api/schedule", assignRoutes);

// 4. Start the Server
app
  .listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  })
  .on("error", (err) => {
    console.error("Express failed to start:", err.message);
  });
