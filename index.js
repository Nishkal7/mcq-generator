const express = require("express");
const mcqRouter = require("./src/routes/mcqRoutes");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");

const app = express();
let upload = multer({ dest: "uploads/" });

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_STRING);

app.use(express.json());
app.use("/mcq", mcqRouter);

app.get("/", (req, res) => {
  res.send("Welcome to my app!!");
});

app.post("/uploadFile", upload.single("file"), (req, res) => {
  try {
    console.log('req', req.file)
    if (req.file?.filename === null || req.file?.filename === undefined) {
      res.status(400).json("No File");
    } else {
      let filePath = "uploads\\" + req.file.filename;

      const excelData = excelToJson({
        sourceFile: filePath,
        header: {
          rows: 1,
        },
        columnToKey: {
          A: "id",
          B: "Question",
          C: "Options",
          D: "Answers",
        },
      });
      fs.remove(filePath);
      res.status(200).json(excelData);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
