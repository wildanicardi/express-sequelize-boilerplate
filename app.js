const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// import route
// const authRoute = require("./routes/auth");

dotenv.config();
const app = express();
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// middleware
app.use(express.json());
// route middleware
// app.use("/api/auth", authRoute);

// route
app.get("/", (req, res, next) => {
  res.send("Hello Express");
});

app.listen(() => console.log(`Example app listening on port ${process.env.PORT}`));
module.exports = app;