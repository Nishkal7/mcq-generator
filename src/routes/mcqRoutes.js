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

module.exports = router;
