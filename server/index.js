const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const queryproject =
  "SELECT tt_projects.name,tt_projects.description" +
  " FROM tt_user_project_binds INNER JOIN tt_users" +
  " ON tt_user_project_binds.user_id = tt_users.id" +
  " INNER JOIN tt_projects ON tt_projects.id = tt_user_project_binds.project_id" +
  " WHERE tt_users.login = ? ORDER by tt_projects.name";
// Route to get all posts
app.get("/api/getproject/:id", (req, res) => {
  const id = req.params.id;
  db.query(queryproject, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.get("/", (req, res) => {
  res.send(
    "Backend Timesheet: <p>/api/getproject/:id </p> <p>/api/login/:id~:psw </p> <p>/api/gettask</p> <p>/api/getevent/:id~:datestart</p> <p>/api/gettypes</p> <p>/api/getusers</p>"
  );
});

// Route to get one post
app.get("/api/login/:id~:psw", (req, res) => {
  const id = req.params.id;
  const password = crypto
    .createHash("md5")
    .update(req.params.psw)
    .digest("hex");
  db.query(
    "SELECT * FROM tt_users WHERE login = ? AND password = ? ",
    [id, password],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

const queryevent =
  "SELECT tt_log.id,tt_log.date AS start,tt_log.date AS end," +
  "tt_log.duration,tt_clients.name,tt_projects.name AS project," +
  "tt_tasks.name AS task, tt_log.comment FROM tt_log INNER JOIN tt_users ON " +
  "tt_log.user_id = tt_users.id INNER JOIN tt_clients ON " +
  "tt_log.client_id = tt_clients.id INNER JOIN tt_projects " +
  "ON tt_log.project_id = tt_projects.id INNER JOIN tt_tasks " +
  "ON tt_log.task_id = tt_tasks.id WHERE tt_users.login = ? AND tt_log.date >= ? AND tt_log.status = '1'" +
  "ORDER BY tt_log.date DESC";
// Route to get all posts
app.get("/api/getevent/:id~:date", (req, res) => {
  const id = req.params.id;
  const date = req.params.date;
  db.query(queryevent, [id, date], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// Route to get one post
app.get("/api/gettask", (req, res) => {
  db.query("SELECT * FROM tt_tasks", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// Route to get one post
app.get("/api/gettypes", (req, res) => {
  db.query("SELECT * FROM tt_types", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// Route to get one post
app.get("/api/getusers", (req, res) => {
  db.query(
    "SELECT * FROM tt_users WHERE tt_users.status = '1' ORDER BY tt_users.login",
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    }
  );
});

// Route for creating the post
app.post("/api/create", (req, res) => {
  const username = req.body.userName;
  const title = req.body.title;
  const text = req.body.text;

  db.query(
    "INSERT INTO posts (title, post_text, user_name) VALUES (?,?,?)",
    [title, text, username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
});

// Route to like a post
app.post("/api/like/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "UPDATE posts SET likes = likes + 1 WHERE id = ?",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
});

// Route to delete a post

app.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM posts WHERE id= ?", id, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

app.listen(PORT, () => {
  console.log("Server is running on" + PORT);
});
