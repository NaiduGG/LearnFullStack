// const http = require("http");
// const fs = require("fs");

// const server = http.createServer((request, response) => {
//   //   console.log(request.url);
//   if (request.url === "/") {
//     fs.readFile("index.html", (error, data) => {
//       if (error) {
//         response.writeHead(500);
//         response.end("Unable to load the page.");
//         return;
//       }

//       response.writeHead(200, {
//         "Content-Type": "text/html",
//       });

//       response.end(data);
//     });
//   } else if (request.url === "/style.css") {
//     fs.readFile("style.css", (error, data) => {
//       if (error) {
//         response.writeHead(500);
//         response.end("Unable to load the page.");
//         return;
//       }

//       response.writeHead(200, {
//         "Content-Type": "text/css",
//       });

//       response.end(data);
//     });
//   } else {
//     response.writeHead(404, {
//       "Content-Type": "text/plain",
//     });

//     response.end("404 - Page not found");
//   }
// });

// server.listen(3000, () => {
//   console.log("Server running at http://localhost:3000");
// });

/*
    up until now we have used the vanilla node js but from now onwards we are taking the help of
    express to simplify things
*/

// const express = require("express");

// const app = express();

// app.use(express.urlencoded({ extended: true }));

// app.use(express.static("public"));

// app.post("/signup", (request, response) => {
//   console.log("Signup request received!");

//   console.log(request.body);

//   console.log("-------------");

//   console.log(request.body.name);
//   console.log(request.body.email);
//   console.log(request.body.password);

//   response.send("Signup route reached!");
// });

// app.listen(3000, () => {
//   console.log("Server running at http://localhost:3000");
// });

/* 
now we will be connecting our database(sqlite) to our webpage
*/

/* const express = require("express");

const sqlite = require("sqlite3").verbose(); //1

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

const db = new sqlite.Database("users.db", (error) => {
  //2
  if (error) {
    console.log("unable to connect");
    return;
  }

  console.log("connected successfully!");
});

app.post("/signup", (request, response) => {
  const name = request.body.name;
  const email = request.body.email;
  const password = request.body.password;

  const sql = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";

  db.run(sql, [name, email, password], (error) => {
    if (error) {
      console.log(error);
      response.send("Unable to create account");
      return;
    }
    response.send("Account created successfully");
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

//here, we have accessed the data from the sql and performed logical operations

*/
const express = require("express");

const sqlite = require("sqlite3").verbose(); //1

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

const db = new sqlite.Database("users.db", (error) => {
  //2
  if (error) {
    console.log("unable to connect");
    return;
  }

  console.log("connected successfully!");
});

app.post("/signin", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  console.log("Email entered:", email);
  console.log("Password entered:", password);

  const sql = "SELECT * FROM users WHERE email = ?";

  db.get(sql, [email], (error, user) => {
    if (error) {
      console.log(error);
      return;
    }

    if (!user) {
      console.log("User not found");
      return;
    }
    console.log(user);
    console.log("actual password: ", user.password_hash);
    if (password == user.password_hash) {
      response.redirect("/index.html");
    } else {
      response.send("GTFO");
    }
  });
});

app.post("/signup", (request, response) => {
  const name = request.body.name;
  const email = request.body.email;
  const password = request.body.password;

  console.log("Email entered:", email);
  console.log("Password entered:", password);

  const sql = "INSERT INTO users (name, email, password_hash) VALUES (?,?,?)";

  db.run(sql, [name, email, password], (error, user) => {
    if (error) {
      console.log(error);
    }

    if (error.message.includes("UNIQUE constraint failed")) {
      return response.status(400).send("Email already registered!");
    }

    console.log(`User created successfully with ID: ${this.lastID}`);
    response.send("Account created successfully! You can now log in.");
  });
});

app
  .listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  })
  .on("error", (err) => {
    console.error("Express failed to start:", err.message);
  });
