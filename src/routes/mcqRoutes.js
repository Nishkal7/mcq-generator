const express = require("express");
const router = express.Router();
const logger = require('../util/logger.js')
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

// Deprecated api, will be using this flow from upload through excel api. TODO : Clean this up later.
router.post("/create", duplicateCheck, async (req, res) => {
  try {
    const mcqData = req.body;
    await Mcq.validate(mcqData);
    const mcqDoc = await Mcq.create(mcqData);
    logger.emit('logging', 'Record Succesfully Created', 'bgBlue');
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

const randomize = (data, limit) => {
  //TODO random logics
  return data;
}

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
      logger.emit('logging', 'Record updated Sucessfully', 'bgBlue');
      res.send("Record updated Sucessfully");
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/randomize/:limit", async(req, res) => {
  try {
    const result = await Mcq.findOne({ title: req.query?.title });
    if(result){
      const transformedData = randomize(result, req.params?.limit ?? result.data.length);
      res.send(transformedData);
    }
    else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
})

router.post("/deleteQuestion", async (req, res) => {
  try {
    const title = req.body.title;
    const question = req.body.question;
    const record = await Mcq.exists({ title });
    if (record) {
      const result = await Mcq.findOne({ title });
      const ind = result.data.findIndex(
        (currItem) => currItem.question === question
      );

      if (ind > -1) {
        result.data.splice(ind, 1);
      }

      await Mcq.updateOne(
        { title },
        {
          data: result.data,
        }
      );
      logger.emit('logging', 'Question Deleted Sucessfully', 'bgRed');
      res.send("Question Deleted Sucessfully");
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/deleteTest", async (req, res) => {
  try {
    const title = req.body.title;
    const record = await Mcq.exists({ title });
    if (record) {
      const result = await Mcq.deleteOne({ title });
      logger.emit('logging', 'Test Deleted Sucessfully', 'bgRed');
      res.send(result);
    } else {
      res.status(404).send("Record not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
