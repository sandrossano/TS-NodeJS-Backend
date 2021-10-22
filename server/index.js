const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const crypto = require("crypto");
const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

// Route to get all posts
app.get("/api/get", (req, res) => {
  db.query("SELECT * FROM tt_projects", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.get("/", (req, res) => {
  res.send("aaa");
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
  console.log(`Server is running on ${PORT}`);
});
