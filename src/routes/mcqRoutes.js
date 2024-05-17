const express = require("express");
const router = express.Router();
const Mcq = require("../model/mcqModel");

const duplicateCheck = async (req, res, next) => {
  const title = req.body.title;
  const record = await Mcq.exists({ title });
  if (record) {
    res.status(409).send("Duplicate title found, please give unique name");
  } else {
    next();
  }
};

router.post("/create", duplicateCheck, async (req, res) => {
  try {
    const mcqData = req.body;
    await Mcq.validate(mcqData);
    const mcqDoc = await Mcq.create(mcqData);
    res.send(mcqDoc);
  } catch (error) {
    res.status(500).send(error);
  }
});

const checkItemInArray = (currentData, newItem) => {
  const res = currentData.findIndex(
    (currItem) => currItem.question === newItem.question
  );
  return res;
};

router.post("/update", async (req, res) => {
  try {
    const title = req.body.title;
    const newData = req.body.data;
    const record = await Mcq.exists({ title });
    if (record) {
      const result = await Mcq.findOne({ title });
      const updatedAuthor = req.body.author ?? result.author;
      newData.forEach((item) => {
        const ind = checkItemInArray(result.data, item);
        if (ind > -1) {
          result.data.splice(ind, 1);
        }
      });

      await Mcq.updateOne(
        { title },
        {
          data: [...result.data, ...newData],
          author: updatedAuthor,
        }
      );

      res.send("Record updated Sucessfully");
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
