const mysql = require("mysql");

const db = mysql.createConnection({
  host: "timesheet.cghmbrpjvqls.eu-central-1.rds.amazonaws.com",
  user: "timesheet",
  password: "timesheet",
  database: "timesheet"
});

module.exports = db;
