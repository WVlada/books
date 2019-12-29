const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const racunSchema = new Schema({
  number: {
    type: String,
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
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true
  }
});

module.exports = mongoose.model("Racun", racunSchema);
