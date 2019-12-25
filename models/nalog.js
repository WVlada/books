const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const nalogSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  opis: {
    type: String,
    default: "no description"
  },
  duguje: {
    type: Number,
    default: 0,
    required: true
  },
  potrazuje: {
    type: Number,
    default: 0,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  locked: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  stavovi: [
    {
      stav: {
        type: Schema.Types.ObjectId,
        ref: "Stav"
      }
    }
  ],
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

module.exports = mongoose.model("Nalog", nalogSchema);
