const express = require("express");
const mcqRouter = require("./src/routes/mcqRoutes");

const app = express();

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_STRING);

app.use(express.json());
app.use("/mcq", mcqRouter);

app.get("/", (req, res) => {
  res.send("Welcome to my app!!");
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});