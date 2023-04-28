const express = require("express");
let router = express.Router();
const db = require("../internal-modules/employee-tracker");

router.post("/department", (req, res) => {
  const { title } = req.body;
  db.connection.query(
    `INSERT INTO departments (name) VALUES (?)`,
    [title],
    (err, results) => {
      res.json(results);
    }
  );
});

module.exports = router;