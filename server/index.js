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

const queryprojectclienttask =
  "SELECT tt_projects.id AS 'idprojects' , tt_projects.name,tt_projects.description,tt_clients.name AS 'clients', tt_clients.id AS 'idclients'," +
  " tt_tasks.name AS 'tasks' , tt_tasks.id AS 'idtasks' FROM tt_user_project_binds INNER JOIN " +
  "tt_users ON tt_user_project_binds.user_id = tt_users.id " +
  "INNER JOIN tt_projects ON tt_projects.id = tt_user_project_binds.project_id " +
  "INNER JOIN tt_client_project_binds ON tt_client_project_binds.project_id = tt_projects.id " +
  "INNER JOIN tt_clients ON tt_clients.id = tt_client_project_binds.client_id " +
  "INNER JOIN tt_project_task_binds ON tt_project_task_binds.project_id= tt_projects.id " +
  "INNER JOIN tt_tasks ON tt_tasks.id = tt_project_task_binds.task_id " +
  "WHERE tt_users.login = ? ORDER by tt_clients.name";
// Route to get all posts
app.get("/api/getprojectclienttask/:id", (req, res) => {
  const id = req.params.id;
  db.query(queryprojectclienttask, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.get("/", (req, res) => {
  var text =
    "Backend Timesheet:" +
    " <p>/api/getproject/:id </p>" +
    " <p>/api/getprojectclienttask/:id </p>" +
    " <p>/api/login/:id~:psw </p>" +
    " <p>/api/gettask</p>" +
    " <p>/api/getevent/:id~:datestart</p>" +
    " <p>/api/getreport/:id~:date~:enddate</p>" +
    " <p>/api/getusers</p>" +
    " <p>/api/getdash/:date~:id</p>" +
    " <p>/api/getuser/:id</p>" +
    " <p>/api/edituser/:name~:login~:email~:psw (POST)</p>" +
    " <p>/api/postevent/:user~:date~:duration~:comment~:client~:project~:task (POST)</p>" +
    " <p>/api/deleteevent/:idevt (DELETE)</p>" +
    " <p>/api/updateevent/:id~:user~:duration~:comment~:client~:project~:task (UPDATE)</p>";
  res.send(text);
});

app.delete("/api/deleteevent/:idevt", (req, res) => {
  const id = req.params.idevt;
  var query = "UPDATE tt_log SET status = null WHERE id = ?";
  db.query(query, id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

app.post(
  "/api/updateevent/:id~:user~:duration~:comment~:client~:project~:task",
  (req, res) => {
    const id = req.params.id;
    const user = req.params.user;
    const date = req.params.date;
    const duration = req.params.duration;
    const comment = req.params.comment;
    const client = req.params.client;
    const project = req.params.project;
    const task = req.params.task;
    var parametri = [user, duration, comment, client, project, task, id];
    var query =
      "UPDATE tt_log SET user_id = ? ,duration = ? ,comment = ? ,client_id = ? ,project_id = ? ,task_id = ? WHERE id = ?";
    if (comment === "null") {
      query =
        "UPDATE tt_log SET user_id = ? ,duration = ? ,comment = null ,client_id = ? ,project_id = ? ,task_id = ? WHERE id = ?";
      parametri = [user, duration, client, project, task, id];
    }
    db.query(query, parametri, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
  }
);

// Route to get one post
app.post(
  "/api/postevent/:user~:date~:duration~:comment~:client~:project~:task",
  (req, res) => {
    const user = req.params.user;
    const date = req.params.date;
    const duration = req.params.duration;
    const comment = req.params.comment;
    const client = req.params.client;
    const project = req.params.project;
    const task = req.params.task;
    var parametri = [
      user,
      date,
      duration,
      comment,
      client,
      project,
      task,
      user
    ];
    var query =
      "INSERT INTO tt_log (id, user_id, group_id, org_id, date, duration, comment,client_id, project_id, task_id,created_by,status,billable) " +
      "SELECT MAX(id) + 1, ? , '1', '1', ? , ? , ? , ? , ? , ? , ? , '1' , '1' FROM tt_log";
    if (comment === "null") {
      query =
        "INSERT INTO tt_log (id, user_id, group_id, org_id, date, duration, comment,client_id, project_id, task_id,created_by,status,billable) " +
        "SELECT MAX(id) + 1, ? , '1', '1', ? , ? , null , ? , ? , ? , ? , '1' , '1' FROM tt_log";
      parametri = [user, date, duration, client, project, task, user];
    }
    db.query(query, parametri, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
  }
);

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

// Route to get one post
app.get("/api/getuser/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM tt_users WHERE login = ? ", id, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

const querydash =
  "SELECT SUM(tt_log.duration) AS counter, tt_tasks.id, tt_tasks.name, tt_log.user_id  " +
  "FROM tt_tasks LEFT JOIN tt_log ON tt_tasks.id  = tt_log.task_id " +
  "AND tt_log.date >= ? AND tt_log.date < ? AND tt_log.status = '1' " +
  "AND tt_log.user_id = ( SELECT tt_users.id FROM tt_users WHERE tt_users.login = ?) " +
  "WHERE tt_tasks.status = '1' AND tt_tasks.name IN ('Smart Working','Hours Off','Holiday','On-Site') " +
  "GROUP BY tt_tasks.id, tt_tasks.name, tt_log.user_id";
// Route to get all posts
app.get("/api/getdash/:date1~:id", (req, res) => {
  const id = req.params.id;
  const date1 = req.params.date1;
  var date2 = new Date(
    date1.split("-")[0],
    date1.split("-")[1],
    date1.split("-")[2],
    0,
    0,
    0
  );
  date2.setMonth(date2.getMonth() + 1);
  var datenext =
    date2.getFullYear() + "-" + date2.getMonth() + "-" + date2.getDay();
  db.query(querydash, [date1, datenext, id], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
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

const queryreport =
  "SELECT tt_log.id,tt_log.date AS start,tt_log.date AS end," +
  "tt_log.duration,tt_clients.name,tt_projects.name AS project," +
  "tt_tasks.name AS task, tt_log.comment FROM tt_log INNER JOIN tt_users ON " +
  "tt_log.user_id = tt_users.id INNER JOIN tt_clients ON " +
  "tt_log.client_id = tt_clients.id INNER JOIN tt_projects " +
  "ON tt_log.project_id = tt_projects.id INNER JOIN tt_tasks " +
  "ON tt_log.task_id = tt_tasks.id WHERE tt_users.login = ? AND tt_log.date >= ? AND tt_log.date < ? AND tt_log.status = '1'" +
  "ORDER BY tt_log.date DESC";
// Route to get all posts
app.get("/api/getreport/:id~:date~:enddate", (req, res) => {
  const id = req.params.id;
  const date = req.params.date;
  const enddate = req.params.enddate;
  db.query(queryreport, [id, date, enddate], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// Route to get one post
app.get("/api/gettask", (req, res) => {
  db.query(
    "SELECT * FROM tt_tasks WHERE tt_tasks.status = '1'",
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    }
  );
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
app.post("/api/edituser/:name~:login~:email~:psw", (req, res) => {
  const name = req.params.name;
  const login = req.params.login;
  const email = req.params.email;
  //const psw = req.params.psw;
  const psw = crypto.createHash("md5").update(req.params.psw).digest("hex");
  db.query(
    "UPDATE tt_users SET tt_users.name = ? , tt_users.email = ? , tt_users.password = ? WHERE tt_users.login = ?",
    [name, email, psw, login],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
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
