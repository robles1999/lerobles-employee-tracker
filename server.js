const express = require("express");
const app = express();
const TrackerSystem = require("./internal-modules/employee-tracker");
const PORT = process.env.PORT || 3000;

const tracker = new TrackerSystem();

tracker.start();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});