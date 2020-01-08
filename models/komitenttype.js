const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const komitenttypeSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true
  }
});

module.exports = mongoose.model("Komitenttype", komitenttypeSchema);
