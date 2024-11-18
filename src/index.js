const express = require("express");
const cors = require("cors");

const Config = require("./config/config");
const HttpError = require("./errors/HttpError");

const authRouter = require("./routers/auth.router");
const staffRouter = require("./routers/staff.router");
const courseRouter = require("./routers/course.router");
const sectionRouter = require("./routers/section.router");
const studentRouter = require("./routers/student.router");
const groupRouter = require("./routers/group.router");

const config = Config.getInstance();

// Initialize database
require("./models/index");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/staffs", staffRouter);
app.use("/courses", courseRouter);
app.use("/sections", sectionRouter);
app.use("/students", studentRouter);
app.use("/groups", groupRouter);

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
