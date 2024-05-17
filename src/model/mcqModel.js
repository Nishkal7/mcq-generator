const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const mcqSchema = new Schema({
  title: {
    type: String,
    required: true,
    lowercase: true,
  },
  data: [
    {
      question: {
        type: String,
        required: true,
      },
      options: [String],
      answers: [String],
    },
  ],
  author: String,
});

const Mcq = model("Mcq", mcqSchema);

module.exports = Mcq;
