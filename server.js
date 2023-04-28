const express = require("express");
const app = express();
const TrackerSystem = require("./internal-modules/employee-tracker");
const PORT = process.env.PORT || 3000;
const addRouter = require("./routes/add");

const tracker = new TrackerSystem();
tracker.connectToDB();

// Express middleware
app.use("/add", addRouter);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Catch-all route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
