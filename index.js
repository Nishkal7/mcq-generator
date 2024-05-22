const express = require("express");
const mcqRouter = require("./src/routes/mcqRoutes");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");
const logger = require("./src/util/logger");
const Mcq = require("./src/model/mcqModel");

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

const getMcqModalData = (excelData) => {
  const transformedData = {};
  transformedData.title = excelData.Sheet1[0]?.title;
  transformedData.author = excelData.Sheet1[0]?.author;
  transformedData.data = [];

  excelData.Sheet1.forEach((item) => {
    transformedData.data.push({
      question: item.question,
      options: item.options.split(",").map((subItem) => {
        return subItem.trim();
      }),
      answers: item.answers.split(",").map((subItem) => {
        return subItem.trim();
      }),
    });
  });
  return transformedData;
};

app.post("/uploadFile", upload.single("file"), async (req, res) => {
  try {
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
          B: "question",
          C: "options",
          D: "answers",
          E: "title",
          F: "author",
        },
      });
      fs.remove(filePath);
      try {
        const transformedExcelData = getMcqModalData(excelData);
        const record = await Mcq.exists({ title: transformedExcelData?.title });
        if (record) {
          res
            .status(409)
            .send("Duplicate title found, please give unique name");
        } else {
            await Mcq.validate(transformedExcelData);
            const mcqDoc = await Mcq.create(transformedExcelData);
            logger.emit("logging", "Record Succesfully Created", "bgBlue");
            res.send(mcqDoc);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/getAllDocs", async(req, res) => {
  try {
    const results = await Mcq.find();
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
