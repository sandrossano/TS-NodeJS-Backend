const mysql = require("mysql");

const db = mysql.createConnection({
  host: "", //cambiare per test,
  user: "timesheet",
  password: "timesheet",
  database: "timesheet"
});

module.exports = db;
